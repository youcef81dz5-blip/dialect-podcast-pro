export type TranscriptSegment = { start_ms: number; end_ms: number; text: string };

export function salvageSegmentObjects(json: string): unknown[] {
  const out: unknown[] = [];
  let depth = 0;
  let startIdx = -1;
  let inString = false;
  let escaped = false;

  for (let index = 0; index < json.length; index++) {
    const character = json[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === '"') inString = false;
      continue;
    }
    if (character === '"') inString = true;
    else if (character === "{") {
      if (depth === 0) startIdx = index;
      depth += 1;
    } else if (character === "}") {
      depth -= 1;
      if (depth === 0 && startIdx >= 0) {
        try {
          out.push(JSON.parse(json.slice(startIdx, index + 1)));
        } catch {
          // Ignore an incomplete object; the batch completeness check will reject it.
        }
        startIdx = -1;
      }
    }
  }
  return out;
}

export function parseBatchSegments(raw: string): {
  segments: TranscriptSegment[];
  coveredUntilMs: number | null;
} {
  const cleaned = raw.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const arrayStart = cleaned.indexOf("[");
    const arrayEnd = cleaned.lastIndexOf("]");
    const scope = arrayStart >= 0 ? cleaned.slice(arrayStart, arrayEnd > arrayStart ? arrayEnd + 1 : undefined) : cleaned;
    parsed = { segments: salvageSegmentObjects(scope), covered_until_ms: null };
  }

  const root = Array.isArray(parsed)
    ? { segments: parsed, covered_until_ms: null }
    : (parsed as Record<string, unknown>);
  const rows = Array.isArray(root?.segments) ? root.segments : [];
  const segments = rows
    .map((item, index) => {
      const row = item as Record<string, unknown>;
      const startMs = Math.max(0, Math.round(Number(row.start_ms ?? row.start ?? index * 5000)));
      const endMs = Math.max(startMs, Math.round(Number(row.end_ms ?? row.end ?? startMs + 5000)));
      return { start_ms: startMs, end_ms: endMs, text: String(row.text ?? "").trim() };
    })
    .filter((segment) => segment.text.length > 0);

  const coverage = Number(root?.covered_until_ms);
  return {
    segments,
    coveredUntilMs: Number.isFinite(coverage) && coverage > 0 ? Math.round(coverage) : null,
  };
}

function normalizedText(value: string): string {
  return value.replace(/[\s،,.!?؟؛:]+/g, " ").trim().toLocaleLowerCase("ar");
}

export function mergeSegmentBatches(batches: TranscriptSegment[][]): TranscriptSegment[] {
  const sorted = batches.flat().sort((left, right) => left.start_ms - right.start_ms || left.end_ms - right.end_ms);
  const merged: TranscriptSegment[] = [];

  for (const segment of sorted) {
    const duplicate = merged.slice(-8).some((existing) => {
      const overlaps = segment.start_ms < existing.end_ms && segment.end_ms > existing.start_ms;
      return overlaps && normalizedText(segment.text) === normalizedText(existing.text);
    });
    if (!duplicate) merged.push(segment);
  }

  return merged.map((segment, index) => {
    const next = merged[index + 1];
    return next && segment.end_ms > next.start_ms
      ? { ...segment, end_ms: Math.max(segment.start_ms, next.start_ms) }
      : segment;
  });
}