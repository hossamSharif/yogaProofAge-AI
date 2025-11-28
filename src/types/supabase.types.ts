/**
 * YogaAgeProof AI - Supabase TypeScript Types
 *
 * Generated from database schema at specs/001-yogaageproof-ai/contracts/supabase-schema.sql
 *
 * Usage: Import Database type and use with Supabase client
 * import { Database } from '@/types/supabase.types';
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal'
export type RoutineStatus = 'draft' | 'active' | 'archived'
export type StepType = 'face_yoga' | 'product_application'
export type SessionStatus = 'in_progress' | 'completed' | 'abandoned'
export type StepCompletionStatus = 'completed' | 'skipped'
export type MoodType = 'stressed' | 'calm' | 'energized' | 'tired' | 'happy' | 'anxious' | 'neutral'
export type SyncStatus = 'local_only' | 'pending' | 'synced'
export type NotificationType = 'routine_reminder' | 'progress_milestone' | 'ai_tip' | 'system_update' | 'achievement'
export type RecommendationType = 'routine_adjustment' | 'product_suggestion' | 'behavioral_tip'
export type SubscriptionPlan = 'free' | 'pro'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'
export type ProductCategory = 'cleanser' | 'toner' | 'serum' | 'moisturizer' | 'eye_cream' | 'treatment' | 'sunscreen' | 'mask' | 'oil'

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          display_name: string
          date_of_birth: string | null
          avatar_url: string | null
          language_preference: string
          notification_enabled: boolean
          notification_routine_reminders: boolean
          notification_tips: boolean
          notification_milestones: boolean
          cloud_backup_enabled: boolean
          timezone: string
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          date_of_birth?: string | null
          avatar_url?: string | null
          language_preference?: string
          notification_enabled?: boolean
          notification_routine_reminders?: boolean
          notification_tips?: boolean
          notification_milestones?: boolean
          cloud_backup_enabled?: boolean
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          display_name?: string
          date_of_birth?: string | null
          avatar_url?: string | null
          language_preference?: string
          notification_enabled?: boolean
          notification_routine_reminders?: boolean
          notification_tips?: boolean
          notification_milestones?: boolean
          cloud_backup_enabled?: boolean
          timezone?: string
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      skin_profiles: {
        Row: {
          id: string
          user_id: string
          skin_type: SkinType
          concerns: Json
          analysis_confidence: number | null
          source_photo_url: string
          analysis_metadata: Json
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_type: SkinType
          concerns?: Json
          analysis_confidence?: number | null
          source_photo_url: string
          analysis_metadata?: Json
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_type?: SkinType
          concerns?: Json
          analysis_confidence?: number | null
          source_photo_url?: string
          analysis_metadata?: Json
          is_active?: boolean
          created_at?: string
        }
      }
      products: {
        Row: {
          id: string
          name: string
          brand: string
          category: ProductCategory
          description: string | null
          ingredients: Json
          benefits: Json
          usage_instructions: string | null
          skin_types: Json
          concerns_addressed: Json
          image_url: string | null
          price_usd: number | null
          external_url: string | null
          is_available: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          brand: string
          category: ProductCategory
          description?: string | null
          ingredients?: Json
          benefits?: Json
          usage_instructions?: string | null
          skin_types?: Json
          concerns_addressed?: Json
          image_url?: string | null
          price_usd?: number | null
          external_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          brand?: string
          category?: ProductCategory
          description?: string | null
          ingredients?: Json
          benefits?: Json
          usage_instructions?: string | null
          skin_types?: Json
          concerns_addressed?: Json
          image_url?: string | null
          price_usd?: number | null
          external_url?: string | null
          is_available?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      routines: {
        Row: {
          id: string
          user_id: string
          skin_profile_id: string
          title: string
          description: string | null
          focus_area: string
          estimated_duration_minutes: number
          benefits: Json
          status: RoutineStatus
          is_ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          skin_profile_id: string
          title: string
          description?: string | null
          focus_area: string
          estimated_duration_minutes: number
          benefits?: Json
          status?: RoutineStatus
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          skin_profile_id?: string
          title?: string
          description?: string | null
          focus_area?: string
          estimated_duration_minutes?: number
          benefits?: Json
          status?: RoutineStatus
          is_ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      routine_steps: {
        Row: {
          id: string
          routine_id: string
          step_number: number
          step_type: StepType
          title: string
          instructions: string
          tips: string | null
          duration_seconds: number
          image_url: string | null
          video_url: string | null
          product_id: string | null
          product_amount: string | null
          created_at: string
        }
        Insert: {
          id?: string
          routine_id: string
          step_number: number
          step_type: StepType
          title: string
          instructions: string
          tips?: string | null
          duration_seconds: number
          image_url?: string | null
          video_url?: string | null
          product_id?: string | null
          product_amount?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          routine_id?: string
          step_number?: number
          step_type?: StepType
          title?: string
          instructions?: string
          tips?: string | null
          duration_seconds?: number
          image_url?: string | null
          video_url?: string | null
          product_id?: string | null
          product_amount?: string | null
          created_at?: string
        }
      }
      routine_sessions: {
        Row: {
          id: string
          user_id: string
          routine_id: string
          started_at: string
          completed_at: string | null
          status: SessionStatus
          total_duration_seconds: number | null
          steps_completed: number
          steps_skipped: number
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          routine_id: string
          started_at: string
          completed_at?: string | null
          status?: SessionStatus
          total_duration_seconds?: number | null
          steps_completed?: number
          steps_skipped?: number
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          routine_id?: string
          started_at?: string
          completed_at?: string | null
          status?: SessionStatus
          total_duration_seconds?: number | null
          steps_completed?: number
          steps_skipped?: number
          notes?: string | null
          created_at?: string
        }
      }
      step_completions: {
        Row: {
          id: string
          session_id: string
          step_id: string
          status: StepCompletionStatus
          started_at: string
          completed_at: string | null
          duration_seconds: number | null
        }
        Insert: {
          id?: string
          session_id: string
          step_id: string
          status: StepCompletionStatus
          started_at: string
          completed_at?: string | null
          duration_seconds?: number | null
        }
        Update: {
          id?: string
          session_id?: string
          step_id?: string
          status?: StepCompletionStatus
          started_at?: string
          completed_at?: string | null
          duration_seconds?: number | null
        }
      }
      diary_entries: {
        Row: {
          id: string
          user_id: string
          entry_date: string
          mood: MoodType | null
          triggers: Json
          skin_condition: string | null
          notes: string | null
          routine_session_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          entry_date: string
          mood?: MoodType | null
          triggers?: Json
          skin_condition?: string | null
          notes?: string | null
          routine_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          entry_date?: string
          mood?: MoodType | null
          triggers?: Json
          skin_condition?: string | null
          notes?: string | null
          routine_session_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      progress_photos: {
        Row: {
          id: string
          user_id: string
          local_path: string | null
          cloud_url: string | null
          sync_status: SyncStatus
          captured_at: string
          lighting_conditions: string | null
          analysis_result: Json | null
          thumbnail_url: string | null
          file_size_bytes: number | null
          is_deleted: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          local_path?: string | null
          cloud_url?: string | null
          sync_status?: SyncStatus
          captured_at: string
          lighting_conditions?: string | null
          analysis_result?: Json | null
          thumbnail_url?: string | null
          file_size_bytes?: number | null
          is_deleted?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          local_path?: string | null
          cloud_url?: string | null
          sync_status?: SyncStatus
          captured_at?: string
          lighting_conditions?: string | null
          analysis_result?: Json | null
          thumbnail_url?: string | null
          file_size_bytes?: number | null
          is_deleted?: boolean
          created_at?: string
        }
      }
      photo_comparisons: {
        Row: {
          id: string
          user_id: string
          before_photo_id: string
          after_photo_id: string
          analyzed_at: string
          detected_changes: Json
          improvement_metrics: Json
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          before_photo_id: string
          after_photo_id: string
          analyzed_at: string
          detected_changes: Json
          improvement_metrics?: Json
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          before_photo_id?: string
          after_photo_id?: string
          analyzed_at?: string
          detected_changes?: Json
          improvement_metrics?: Json
          ai_summary?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data: Json
          is_read: boolean
          read_at: string | null
          scheduled_for: string | null
          delivered_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: NotificationType
          title: string
          message: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          scheduled_for?: string | null
          delivered_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: NotificationType
          title?: string
          message?: string
          data?: Json
          is_read?: boolean
          read_at?: string | null
          scheduled_for?: string | null
          delivered_at?: string | null
          created_at?: string
        }
      }
      ai_recommendations: {
        Row: {
          id: string
          user_id: string
          type: RecommendationType
          title: string
          message: string
          data_sources: Json
          is_actioned: boolean
          actioned_at: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: RecommendationType
          title: string
          message: string
          data_sources?: Json
          is_actioned?: boolean
          actioned_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: RecommendationType
          title?: string
          message?: string
          data_sources?: Json
          is_actioned?: boolean
          actioned_at?: string | null
          expires_at?: string | null
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: SubscriptionPlan
          status: SubscriptionStatus
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: SubscriptionPlan
          status?: SubscriptionStatus
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_routine_consistency: {
        Args: { p_user_id: string; p_days?: number }
        Returns: number
      }
      get_active_routine: {
        Args: { p_user_id: string }
        Returns: {
          routine_id: string
          routine_title: string
          focus_area: string
          estimated_duration: number
          step_id: string
          step_number: number
          step_type: StepType
          step_title: string
          instructions: string
          duration_seconds: number
          product_name: string
          product_brand: string
        }[]
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
    }
    Enums: {
      skin_type: SkinType
      routine_status: RoutineStatus
      step_type: StepType
      session_status: SessionStatus
      step_completion_status: StepCompletionStatus
      mood_type: MoodType
      sync_status: SyncStatus
      notification_type: NotificationType
      recommendation_type: RecommendationType
      subscription_plan: SubscriptionPlan
      subscription_status: SubscriptionStatus
      product_category: ProductCategory
    }
  }
}
