export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      episodes: {
        Row: {
          created_at: string
          dialect: Database["public"]["Enums"]["episode_dialect"]
          duration_seconds: number | null
          error_message: string | null
          id: string
          source_type: Database["public"]["Enums"]["episode_source"]
          source_url: string | null
          status: Database["public"]["Enums"]["episode_status"]
          storage_path: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          dialect?: Database["public"]["Enums"]["episode_dialect"]
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          source_type: Database["public"]["Enums"]["episode_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          storage_path?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          dialect?: Database["public"]["Enums"]["episode_dialect"]
          duration_seconds?: number | null
          error_message?: string | null
          id?: string
          source_type?: Database["public"]["Enums"]["episode_source"]
          source_url?: string | null
          status?: Database["public"]["Enums"]["episode_status"]
          storage_path?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          attempts: number
          created_at: string
          episode_id: string
          id: string
          kind: Database["public"]["Enums"]["job_kind"]
          last_error: string | null
          locked_at: string | null
          state: Database["public"]["Enums"]["job_state"]
          updated_at: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          episode_id: string
          id?: string
          kind: Database["public"]["Enums"]["job_kind"]
          last_error?: string | null
          locked_at?: string | null
          state?: Database["public"]["Enums"]["job_state"]
          updated_at?: string
        }
        Update: {
          attempts?: number
          created_at?: string
          episode_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["job_kind"]
          last_error?: string | null
          locked_at?: string | null
          state?: Database["public"]["Enums"]["job_state"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          locale: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          locale?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          locale?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          minutes_quota: number
          minutes_used: number
          plan: Database["public"]["Enums"]["subscription_plan"]
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          minutes_quota?: number
          minutes_used?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          minutes_quota?: number
          minutes_used?: number
          plan?: Database["public"]["Enums"]["subscription_plan"]
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transcript_segments: {
        Row: {
          created_at: string
          end_ms: number
          id: string
          idx: number
          start_ms: number
          text: string
          transcript_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_ms: number
          id?: string
          idx: number
          start_ms: number
          text: string
          transcript_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_ms?: number
          id?: string
          idx?: number
          start_ms?: number
          text?: string
          transcript_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcript_segments_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          created_at: string
          episode_id: string
          id: string
          language: string
          model: string | null
          raw_text: string | null
          refined_text: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          episode_id: string
          id?: string
          language?: string
          model?: string | null
          raw_text?: string | null
          refined_text?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          episode_id?: string
          id?: string
          language?: string
          model?: string | null
          raw_text?: string | null
          refined_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
        ]
      }
      translation_segments: {
        Row: {
          created_at: string
          end_ms: number
          id: string
          idx: number
          start_ms: number
          text: string
          translation_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_ms: number
          id?: string
          idx: number
          start_ms: number
          text: string
          translation_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_ms?: number
          id?: string
          idx?: number
          start_ms?: number
          text?: string
          translation_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translation_segments_translation_id_fkey"
            columns: ["translation_id"]
            isOneToOne: false
            referencedRelation: "translations"
            referencedColumns: ["id"]
          },
        ]
      }
      translations: {
        Row: {
          created_at: string
          id: string
          model: string | null
          status: string
          target_language: string
          transcript_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string | null
          status?: string
          target_language?: string
          transcript_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string | null
          status?: string
          target_language?: string
          transcript_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "translations_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      claim_quota_minutes: {
        Args: { p_minutes: number; p_user_id: string }
        Returns: {
          granted: boolean
          remaining_minutes: number
        }[]
      }
    }
    Enums: {
      episode_dialect: "msa" | "gulf" | "egyptian" | "levantine" | "maghrebi"
      episode_source: "upload" | "url"
      episode_status: "queued" | "processing" | "ready" | "failed"
      job_kind: "transcribe" | "translate"
      job_state: "pending" | "running" | "done" | "failed"
      subscription_plan: "free" | "pro"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      episode_dialect: ["msa", "gulf", "egyptian", "levantine", "maghrebi"],
      episode_source: ["upload", "url"],
      episode_status: ["queued", "processing", "ready", "failed"],
      job_kind: ["transcribe", "translate"],
      job_state: ["pending", "running", "done", "failed"],
      subscription_plan: ["free", "pro"],
    },
  },
} as const
