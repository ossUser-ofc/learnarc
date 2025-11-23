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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_analysis: {
        Row: {
          analysis_type: string
          created_at: string
          id: string
          input_data: Json
          model: string
          result: Json
          task_id: string
          user_id: string | null
        }
        Insert: {
          analysis_type: string
          created_at?: string
          id?: string
          input_data: Json
          model: string
          result: Json
          task_id: string
          user_id?: string | null
        }
        Update: {
          analysis_type?: string
          created_at?: string
          id?: string
          input_data?: Json
          model?: string
          result?: Json
          task_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          content: string
          created_at: string
          folder: string | null
          id: string
          tags: string[] | null
          task_id: string | null
          title: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          folder?: string | null
          id?: string
          tags?: string[] | null
          task_id?: string | null
          title: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          folder?: string | null
          id?: string
          tags?: string[] | null
          task_id?: string | null
          title?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      subtasks: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          order_index: number
          task_id: string
          title: string
          user_id: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          order_index?: number
          task_id: string
          title: string
          user_id?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          order_index?: number
          task_id?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tags: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_completion_history: {
        Row: {
          actual_time: number
          completed_at: string
          created_at: string
          estimated_time: number | null
          id: string
          task_id: string
          task_title: string
          user_id: string | null
        }
        Insert: {
          actual_time: number
          completed_at?: string
          created_at?: string
          estimated_time?: number | null
          id?: string
          task_id: string
          task_title: string
          user_id?: string | null
        }
        Update: {
          actual_time?: number
          completed_at?: string
          created_at?: string
          estimated_time?: number | null
          id?: string
          task_id?: string
          task_title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_dependencies: {
        Row: {
          created_at: string
          depends_on_task_id: string
          id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          depends_on_task_id: string
          id?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          depends_on_task_id?: string
          id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      task_tags: {
        Row: {
          created_at: string
          id: string
          tag_id: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          tag_id: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          tag_id?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "task_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      task_time_sessions: {
        Row: {
          created_at: string
          duration_seconds: number | null
          end_time: string | null
          id: string
          notes: string | null
          start_time: string
          task_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          end_time?: string | null
          id?: string
          notes?: string | null
          start_time?: string
          task_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          category: string
          completed: boolean
          created_at: string
          description: string | null
          due_date: string | null
          estimated_time: number | null
          id: string
          notes: string | null
          priority: string
          progress: number
          recurring_end_date: string | null
          recurring_type: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          notes?: string | null
          priority?: string
          progress?: number
          recurring_end_date?: string | null
          recurring_type?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          completed?: boolean
          created_at?: string
          description?: string | null
          due_date?: string | null
          estimated_time?: number | null
          id?: string
          notes?: string | null
          priority?: string
          progress?: number
          recurring_end_date?: string | null
          recurring_type?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_settings: {
        Row: {
          created_at: string
          current_school: string | null
          default_view: string | null
          display_name: string | null
          education_level: string | null
          email_notifications: boolean | null
          id: string
          language: string | null
          target_university: string | null
          task_reminders: boolean | null
          theme_preference: string | null
          timezone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_school?: string | null
          default_view?: string | null
          display_name?: string | null
          education_level?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          target_university?: string | null
          task_reminders?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_school?: string | null
          default_view?: string | null
          display_name?: string | null
          education_level?: string | null
          email_notifications?: boolean | null
          id?: string
          language?: string | null
          target_university?: string | null
          task_reminders?: boolean | null
          theme_preference?: string | null
          timezone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_summaries: {
        Row: {
          created_at: string
          id: string
          insights: Json
          summary: string
          user_id: string | null
          week_end: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          insights: Json
          summary: string
          user_id?: string | null
          week_end: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          insights?: Json
          summary?: string
          user_id?: string | null
          week_end?: string
          week_start?: string
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
