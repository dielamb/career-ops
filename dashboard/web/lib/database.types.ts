// career-ops v1 — Supabase database types
// Handwritten to match supabase/migrations/001_v1_schema.sql
// Compatible with @supabase/supabase-js createClient<Database>()

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type PipelineStatus =
  | 'pending'
  | 'evaluated'
  | 'applied'
  | 'responded'
  | 'interview'
  | 'offer'
  | 'rejected'
  | 'discarded'
  | 'skipped'
  | 'error';

export interface Database {
  public: {
    Tables: {
      listings: {
        Row: {
          id: string;
          user_id: string;
          url: string;
          jd_text: string | null;
          company: string | null;
          title: string | null;
          source: string | null;
          fetched_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          url: string;
          jd_text?: string | null;
          company?: string | null;
          title?: string | null;
          source?: string | null;
          fetched_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          url?: string;
          jd_text?: string | null;
          company?: string | null;
          title?: string | null;
          source?: string | null;
          fetched_at?: string;
          created_at?: string;
        };
      };
      pipeline: {
        Row: {
          id: string;
          user_id: string;
          listing_id: string | null;
          url: string | null;
          company: string | null;
          title: string | null;
          score: number | null;
          dimension_scores: Json | null;
          gap_analysis: string | null;
          status: PipelineStatus;
          pdf_path: string | null;
          notes: string | null;
          eval_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          listing_id?: string | null;
          url?: string | null;
          company?: string | null;
          title?: string | null;
          score?: number | null;
          dimension_scores?: Json | null;
          gap_analysis?: string | null;
          status?: PipelineStatus;
          pdf_path?: string | null;
          notes?: string | null;
          eval_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          listing_id?: string | null;
          url?: string | null;
          company?: string | null;
          title?: string | null;
          score?: number | null;
          dimension_scores?: Json | null;
          gap_analysis?: string | null;
          status?: PipelineStatus;
          pdf_path?: string | null;
          notes?: string | null;
          eval_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          pipeline_id: string | null;
          company: string;
          role: string;
          submitted_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pipeline_id?: string | null;
          company: string;
          role: string;
          submitted_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pipeline_id?: string | null;
          company?: string;
          role?: string;
          submitted_at?: string | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          user_id: string;
          cv_text: string | null;
          scoring_prefs: Json;
          anthropic_api_key_encrypted: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          cv_text?: string | null;
          scoring_prefs?: Json;
          anthropic_api_key_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          cv_text?: string | null;
          scoring_prefs?: Json;
          anthropic_api_key_encrypted?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      usage_counters: {
        Row: {
          user_id: string;
          month_start: string;
          eval_count: number;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          month_start?: string;
          eval_count?: number;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          month_start?: string;
          eval_count?: number;
          updated_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      pipeline_status: PipelineStatus;
    };
  };
}

// Convenience row types
export type Listing = Database['public']['Tables']['listings']['Row'];
export type PipelineRow = Database['public']['Tables']['pipeline']['Row'];
export type Application = Database['public']['Tables']['applications']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type UsageCounter = Database['public']['Tables']['usage_counters']['Row'];

export type ListingInsert = Database['public']['Tables']['listings']['Insert'];
export type PipelineInsert = Database['public']['Tables']['pipeline']['Insert'];
export type ApplicationInsert = Database['public']['Tables']['applications']['Insert'];
