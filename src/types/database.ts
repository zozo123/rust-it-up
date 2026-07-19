/** Supabase-aligned types for future wiring. UI currently uses seed + localStorage. */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          provider: string
          owner: string
          repo: string
          canonical_url: string
          default_branch: string | null
          latest_sha: string | null
          visibility: string | null
          primary_language: string | null
          category: string | null
          license_spdx: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          provider?: string
          owner: string
          repo: string
          canonical_url: string
          default_branch?: string | null
          latest_sha?: string | null
          visibility?: string | null
          primary_language?: string | null
          category?: string | null
          license_spdx?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['projects']['Insert']>
      }
      scans: {
        Row: {
          id: string
          project_id: string
          requested_by: string | null
          commit_sha: string
          status: string
          scanner_version: string
          started_at: string | null
          completed_at: string | null
          failure_code: string | null
          failure_message: string | null
          artifact_path: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          requested_by?: string | null
          commit_sha: string
          status: string
          scanner_version: string
          started_at?: string | null
          completed_at?: string | null
          failure_code?: string | null
          failure_message?: string | null
          artifact_path?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['scans']['Insert']>
      }
      findings: {
        Row: {
          id: string
          scan_id: string
          finding_type: string
          key: string
          numeric_value: number | null
          text_value: string | null
          evidence: Json
          confidence: string
        }
        Insert: {
          id?: string
          scan_id: string
          finding_type: string
          key: string
          numeric_value?: number | null
          text_value?: string | null
          evidence?: Json
          confidence?: string
        }
        Update: Partial<Database['public']['Tables']['findings']['Insert']>
      }
      estimates: {
        Row: {
          id: string
          scan_id: string
          rust_upside: number
          migration_feasibility: number
          commercial_signal: number
          opportunity_score: number
          recommendation: string
          confidence: string
          p50_engineer_months: number
          p90_engineer_months: number
          cicd_low_days: number
          cicd_high_days: number
          first_slice: Json
          value_scenarios: Json
          blockers: Json
          assumptions: Json
          benchmark_plan: Json
          model_version: string
        }
        Insert: {
          id?: string
          scan_id: string
          rust_upside: number
          migration_feasibility: number
          commercial_signal: number
          opportunity_score: number
          recommendation: string
          confidence: string
          p50_engineer_months: number
          p90_engineer_months: number
          cicd_low_days: number
          cicd_high_days: number
          first_slice?: Json
          value_scenarios?: Json
          blockers?: Json
          assumptions?: Json
          benchmark_plan?: Json
          model_version: string
        }
        Update: Partial<Database['public']['Tables']['estimates']['Insert']>
      }
      leads: {
        Row: {
          id: string
          scan_id: string | null
          email: string
          company: string | null
          role: string | null
          production_use: boolean | null
          monthly_compute_band: string | null
          primary_pain: string | null
          request_type: string
          created_at: string
        }
        Insert: {
          id?: string
          scan_id?: string | null
          email: string
          company?: string | null
          role?: string | null
          production_use?: boolean | null
          monthly_compute_band?: string | null
          primary_pain?: string | null
          request_type: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['leads']['Insert']>
      }
      project_signals: {
        Row: {
          id: string
          project_id: string
          signal_type: string
          anonymous_session_id: string | null
          work_email_domain: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          signal_type: string
          anonymous_session_id?: string | null
          work_email_domain?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['project_signals']['Insert']>
      }
    }
  }
}
