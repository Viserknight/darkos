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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      chat_history: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      emergency_contacts: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean | null
          name: string
          phone_number: string
          relationship: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name: string
          phone_number: string
          relationship?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean | null
          name?: string
          phone_number?: string
          relationship?: string | null
          user_id?: string
        }
        Relationships: []
      }
      evidence_recordings: {
        Row: {
          created_at: string
          file_url: string | null
          id: string
          location_lat: number | null
          location_lng: number | null
          recording_type: string
          transcription: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          recording_type: string
          transcription?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          file_url?: string | null
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          recording_type?: string
          transcription?: string | null
          user_id?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          emotional_state: string | null
          heart_rate: number | null
          id: string
          recorded_at: string
          stress_level: number | null
          user_id: string
        }
        Insert: {
          emotional_state?: string | null
          heart_rate?: number | null
          id?: string
          recorded_at?: string
          stress_level?: number | null
          user_id: string
        }
        Update: {
          emotional_state?: string | null
          heart_rate?: number | null
          id?: string
          recorded_at?: string
          stress_level?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      safe_checkins: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          scheduled_time: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_time: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          scheduled_time?: string
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      sos_alerts: {
        Row: {
          created_at: string
          id: string
          location_lat: number | null
          location_lng: number | null
          resolved_at: string | null
          status: string | null
          trigger_method: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          resolved_at?: string | null
          status?: string | null
          trigger_method?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          location_lat?: number | null
          location_lng?: number | null
          resolved_at?: string | null
          status?: string | null
          trigger_method?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_notes: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_favorite: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_favorite?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_record_on_stress: boolean | null
          checkin_frequency_hours: number | null
          created_at: string
          id: string
          sos_voice_keywords: string[] | null
          theme: string | null
          updated_at: string
          user_id: string
          voice_activation_enabled: boolean | null
        }
        Insert: {
          auto_record_on_stress?: boolean | null
          checkin_frequency_hours?: number | null
          created_at?: string
          id?: string
          sos_voice_keywords?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id: string
          voice_activation_enabled?: boolean | null
        }
        Update: {
          auto_record_on_stress?: boolean | null
          checkin_frequency_hours?: number | null
          created_at?: string
          id?: string
          sos_voice_keywords?: string[] | null
          theme?: string | null
          updated_at?: string
          user_id?: string
          voice_activation_enabled?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
