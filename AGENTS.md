<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Video subtitle merging runs only after an explicit action using a dynamically imported browser FFmpeg worker and bundled same-origin assets; this keeps native media processing out of the server runtime.
- Lossless subtitle export remuxes original video/audio into MKV; burned-in MP4 preserves dimensions with high-quality encoding because visible captions necessarily require re-encoding.
