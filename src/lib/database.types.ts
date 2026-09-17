/**
 * Public-schema types for migration 20260730170636.
 *
 * Regenerate from the connected project after applying migrations:
 * supabase gen types --project-id vanjwanmnusgnavzzzpz --schema public
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          display_name: string | null;
          email: string | null;
          id: string;
          phone: string | null;
          preferred_language: string;
          updated_at: string;
        };
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id: string;
          phone?: string | null;
          preferred_language?: string;
          updated_at?: string;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          display_name?: string | null;
          email?: string | null;
          id?: string;
          phone?: string | null;
          preferred_language?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_settings: {
        Row: {
          created_at: string;
          dark_mode: boolean;
          settings_json: Json;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          dark_mode?: boolean;
          settings_json?: Json;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          dark_mode?: boolean;
          settings_json?: Json;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_settings_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_progress: {
        Row: {
          completed: Json;
          created_at: string;
          current_streak: number;
          last_completed_at: string | null;
          longest_streak: number;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          completed?: Json;
          created_at?: string;
          current_streak?: number;
          last_completed_at?: string | null;
          longest_streak?: number;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          completed?: Json;
          created_at?: string;
          current_streak?: number;
          last_completed_at?: string | null;
          longest_streak?: number;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      session_history: {
        Row: {
          category: string;
          completed_at: string;
          completed_count: number;
          duration_seconds: number;
          id: string;
          is_complete: boolean;
          total_count: number;
          user_id: string;
        };
        Insert: {
          category: string;
          completed_at?: string;
          completed_count?: number;
          duration_seconds?: number;
          id: string;
          is_complete?: boolean;
          total_count?: number;
          user_id: string;
        };
        Update: {
          category?: string;
          completed_at?: string;
          completed_count?: number;
          duration_seconds?: number;
          id?: string;
          is_complete?: boolean;
          total_count?: number;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_history_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      daily_collection_completions: {
        Row: {
          category: string;
          created_at: string;
          day_key: string;
          time_zone: string;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string;
          day_key: string;
          time_zone?: string;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string;
          day_key?: string;
          time_zone?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "daily_collection_completions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      saved_zikr: {
        Row: {
          created_at: string;
          user_id: string;
          zikr_id: string;
        };
        Insert: {
          created_at?: string;
          user_id: string;
          zikr_id: string;
        };
        Update: {
          created_at?: string;
          user_id?: string;
          zikr_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "saved_zikr_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
