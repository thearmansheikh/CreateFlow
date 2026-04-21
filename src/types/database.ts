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
      users: {
        Row: {
          id: string
          full_name: string | null
          username: string | null
          avatar_url: string | null
          subscription_tier: 'free' | 'creator' | 'agency' | 'enterprise'
          credits_balance: number
          total_credits_used: number
          trial_end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'creator' | 'agency' | 'enterprise'
          credits_balance?: number
          total_credits_used?: number
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          username?: string | null
          avatar_url?: string | null
          subscription_tier?: 'free' | 'creator' | 'agency' | 'enterprise'
          credits_balance?: number
          total_credits_used?: number
          trial_end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workspaces: {
        Row: {
          id: string
          owner_id: string
          name: string
          slug: string
          plan: 'free' | 'creator' | 'agency' | 'enterprise'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          slug: string
          plan?: 'free' | 'creator' | 'agency' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          slug?: string
          plan?: 'free' | 'creator' | 'agency' | 'enterprise'
          created_at?: string
          updated_at?: string
        }
      }
      workspace_members: {
        Row: {
          id: string
          workspace_id: string
          user_id: string
          role: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string
          role?: 'owner' | 'admin' | 'editor' | 'viewer'
          created_at?: string
        }
      }
      folders: {
        Row: {
          id: string
          workspace_id: string
          name: string
          parent_folder_id: string | null
          color: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          parent_folder_id?: string | null
          color?: string | null
          icon?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          parent_folder_id?: string | null
          color?: string | null
          icon?: string | null
          created_at?: string
        }
      }
      brand_profiles: {
        Row: {
          id: string
          workspace_id: string
          name: string
          description: string | null
          voice_tone: Json | null
          visual_style: Json | null
          logo_url: string | null
          brand_colors: string[] | null
          brand_fonts: string[] | null
          brand_examples: string[] | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          name: string
          description?: string | null
          voice_tone?: Json | null
          visual_style?: Json | null
          logo_url?: string | null
          brand_colors?: string[] | null
          brand_fonts?: string[] | null
          brand_examples?: string[] | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          name?: string
          description?: string | null
          voice_tone?: Json | null
          visual_style?: Json | null
          logo_url?: string | null
          brand_colors?: string[] | null
          brand_fonts?: string[] | null
          brand_examples?: string[] | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      content_items: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          type: 'image' | 'video' | 'music' | 'copy' | 'upload'
          title: string | null
          description: string | null
          file_url: string | null
          thumbnail_url: string | null
          file_size: number | null
          mime_type: string | null
          width: number | null
          height: number | null
          duration: number | null
          tags: string[]
          folder_id: string | null
          brand_profile_id: string | null
          is_favorite: boolean
          ai_model_used: string | null
          original_prompt: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          type: 'image' | 'video' | 'music' | 'copy' | 'upload'
          title?: string | null
          description?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration?: number | null
          tags?: string[]
          folder_id?: string | null
          brand_profile_id?: string | null
          is_favorite?: boolean
          ai_model_used?: string | null
          original_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          type?: 'image' | 'video' | 'music' | 'copy' | 'upload'
          title?: string | null
          description?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          file_size?: number | null
          mime_type?: string | null
          width?: number | null
          height?: number | null
          duration?: number | null
          tags?: string[]
          folder_id?: string | null
          brand_profile_id?: string | null
          is_favorite?: boolean
          ai_model_used?: string | null
          original_prompt?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      generation_tasks: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          type: 'image' | 'video' | 'music' | 'copy'
          prompt: string
          enhanced_prompt: string | null
          negative_prompt: string | null
          parameters: Json | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress: number
          result_url: string | null
          error_message: string | null
          model_used: string | null
          credits_used: number
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          type: 'image' | 'video' | 'music' | 'copy'
          prompt: string
          enhanced_prompt?: string | null
          negative_prompt?: string | null
          parameters?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          result_url?: string | null
          error_message?: string | null
          model_used?: string | null
          credits_used?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          type?: 'image' | 'video' | 'music' | 'copy'
          prompt?: string
          enhanced_prompt?: string | null
          negative_prompt?: string | null
          parameters?: Json | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
          progress?: number
          result_url?: string | null
          error_message?: string | null
          model_used?: string | null
          credits_used?: number
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      credit_transactions: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'trial'
          amount: number
          description: string | null
          related_generation_id: string | null
          stripe_payment_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'trial'
          amount: number
          description?: string | null
          related_generation_id?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          type?: 'purchase' | 'usage' | 'refund' | 'bonus' | 'trial'
          amount?: number
          description?: string | null
          related_generation_id?: string | null
          stripe_payment_id?: string | null
          created_at?: string
        }
      }
      scheduled_posts: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          content_ids: string[]
          caption: string | null
          platforms: Json | null
          scheduled_at: string
          status: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          publish_log: Json | null
          published_at: string | null
          error_message: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          content_ids?: string[]
          caption?: string | null
          platforms?: Json | null
          scheduled_at: string
          status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          publish_log?: Json | null
          published_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          content_ids?: string[]
          caption?: string | null
          platforms?: Json | null
          scheduled_at?: string
          status?: 'draft' | 'scheduled' | 'publishing' | 'published' | 'failed' | 'cancelled'
          publish_log?: Json | null
          published_at?: string | null
          error_message?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      social_connections: {
        Row: {
          id: string
          workspace_id: string
          user_id: string | null
          platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'pinterest'
          platform_user_id: string | null
          platform_username: string | null
          access_token: string | null
          refresh_token: string | null
          token_expires_at: string | null
          scopes: string[] | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          user_id?: string | null
          platform: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'pinterest'
          platform_user_id?: string | null
          platform_username?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          scopes?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          user_id?: string | null
          platform?: 'instagram' | 'tiktok' | 'youtube' | 'linkedin' | 'twitter' | 'facebook' | 'pinterest'
          platform_user_id?: string | null
          platform_username?: string | null
          access_token?: string | null
          refresh_token?: string | null
          token_expires_at?: string | null
          scopes?: string[] | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      analytics_events: {
        Row: {
          id: string
          workspace_id: string
          post_id: string | null
          platform: string | null
          event_type: 'impression' | 'engagement' | 'click' | 'share' | 'comment' | 'like' | 'save' | 'follow' | 'view'
          event_value: number
          event_metadata: Json | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          workspace_id: string
          post_id?: string | null
          platform?: string | null
          event_type: 'impression' | 'engagement' | 'click' | 'share' | 'comment' | 'like' | 'save' | 'follow' | 'view'
          event_value?: number
          event_metadata?: Json | null
          recorded_at: string
          created_at?: string
        }
        Update: {
          id?: string
          workspace_id?: string
          post_id?: string | null
          platform?: string | null
          event_type?: 'impression' | 'engagement' | 'click' | 'share' | 'comment' | 'like' | 'save' | 'follow' | 'view'
          event_value?: number
          event_metadata?: Json | null
          recorded_at?: string
          created_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          workspace_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          plan: 'creator' | 'agency' | 'enterprise'
          status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start: string | null
          current_period_end: string | null
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          workspace_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan: 'creator' | 'agency' | 'enterprise'
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          workspace_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          plan?: 'creator' | 'agency' | 'enterprise'
          status?: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid'
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
