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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      comments: {
        Row: {
          created_at: string | null
          diagram_id: string | null
          id: string
          is_resolved: boolean | null
          linked_view_id: string | null
          text: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          is_resolved?: boolean | null
          linked_view_id?: string | null
          text: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          is_resolved?: boolean | null
          linked_view_id?: string | null
          text?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_linked_view_id_fkey"
            columns: ["linked_view_id"]
            isOneToOne: false
            referencedRelation: "saved_views"
            referencedColumns: ["id"]
          },
        ]
      }
      diagrams: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          mermaid_code: string
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          mermaid_code: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          mermaid_code?: string
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: []
      }
      provisional_views: {
        Row: {
          comment_id: string | null
          created_at: string | null
          diagram_id: string | null
          id: string
          name: string
          pan_x: number | null
          pan_y: number | null
          user_id: string | null
          zoom_level: number
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          name?: string
          pan_x?: number | null
          pan_y?: number | null
          user_id?: string | null
          zoom_level?: number
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          name?: string
          pan_x?: number | null
          pan_y?: number | null
          user_id?: string | null
          zoom_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "provisional_views_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: true
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provisional_views_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_views: {
        Row: {
          created_at: string | null
          diagram_id: string | null
          expanded: boolean | null
          id: string
          is_folder: boolean | null
          name: string
          pan_x: number | null
          pan_y: number | null
          parent_id: string | null
          sort_order: number | null
          updated_at: string | null
          user_id: string | null
          zoom_level: number
        }
        Insert: {
          created_at?: string | null
          diagram_id?: string | null
          expanded?: boolean | null
          id?: string
          is_folder?: boolean | null
          name: string
          pan_x?: number | null
          pan_y?: number | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
          zoom_level?: number
        }
        Update: {
          created_at?: string | null
          diagram_id?: string | null
          expanded?: boolean | null
          id?: string
          is_folder?: boolean | null
          name?: string
          pan_x?: number | null
          pan_y?: number | null
          parent_id?: string | null
          sort_order?: number | null
          updated_at?: string | null
          user_id?: string | null
          zoom_level?: number
        }
        Relationships: [
          {
            foreignKeyName: "saved_views_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_views_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "saved_views"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          auto_save_interval: number | null
          created_at: string | null
          default_zoom_level: number | null
          id: string
          keyboard_shortcuts_enabled: boolean | null
          theme_preference: string | null
          toast_notifications_enabled: boolean | null
          ui_layout_config: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_save_interval?: number | null
          created_at?: string | null
          default_zoom_level?: number | null
          id?: string
          keyboard_shortcuts_enabled?: boolean | null
          theme_preference?: string | null
          toast_notifications_enabled?: boolean | null
          ui_layout_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_save_interval?: number | null
          created_at?: string | null
          default_zoom_level?: number | null
          id?: string
          keyboard_shortcuts_enabled?: boolean | null
          theme_preference?: string | null
          toast_notifications_enabled?: boolean | null
          ui_layout_config?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      view_comment_associations: {
        Row: {
          association_type: string
          comment_id: string | null
          created_at: string | null
          id: string
          view_id: string | null
        }
        Insert: {
          association_type?: string
          comment_id?: string | null
          created_at?: string | null
          id?: string
          view_id?: string | null
        }
        Update: {
          association_type?: string
          comment_id?: string | null
          created_at?: string | null
          id?: string
          view_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "view_comment_associations_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "view_comment_associations_view_id_fkey"
            columns: ["view_id"]
            isOneToOne: false
            referencedRelation: "saved_views"
            referencedColumns: ["id"]
          },
        ]
      }
      view_history: {
        Row: {
          created_at: string | null
          diagram_id: string | null
          id: string
          operation_data: Json | null
          operation_type: string
          user_id: string | null
          views_snapshot: Json
        }
        Insert: {
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          operation_data?: Json | null
          operation_type: string
          user_id?: string | null
          views_snapshot: Json
        }
        Update: {
          created_at?: string | null
          diagram_id?: string | null
          id?: string
          operation_data?: Json | null
          operation_type?: string
          user_id?: string | null
          views_snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "view_history_diagram_id_fkey"
            columns: ["diagram_id"]
            isOneToOne: false
            referencedRelation: "diagrams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_data: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      cleanup_temp_files: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_user_storage_stats: {
        Args: { user_uuid: string }
        Returns: Json
      }
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
