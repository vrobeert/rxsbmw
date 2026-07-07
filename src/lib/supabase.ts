import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          city: string | null;
          member_code: string;
          role: "member" | "staff" | "admin" | "sponsor";
          member_level: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url: string | null;
          bio: string | null;
          joined_at: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          city?: string | null;
          member_code?: string;
          role?: "member" | "staff" | "admin" | "sponsor";
          member_level?: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          full_name?: string;
          city?: string | null;
          member_code?: string;
          role?: "member" | "staff" | "admin" | "sponsor";
          member_level?: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url?: string | null;
          bio?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      memberships: {
        Row: {
          id: string;
          profile_id: string;
          year: number;
          paid: boolean;
          paid_at: string | null;
          expires_at: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          profile_id: string;
          year: number;
          paid?: boolean;
          paid_at?: string | null;
          expires_at?: string | null;
          notes?: string | null;
        };
        Update: {
          paid?: boolean;
          paid_at?: string | null;
          expires_at?: string | null;
          notes?: string | null;
        };
        Relationships: [];
      };
      cars: {
        Row: {
          id: string;
          profile_id: string;
          model: string;
          generation: string;
          engine: string | null;
          power_hp: number | null;
          year: number | null;
          color: string | null;
          cover_photo_id: string | null;
          approved: boolean;
          hidden_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          profile_id: string;
          model: string;
          generation: string;
          engine?: string | null;
          power_hp?: number | null;
          year?: number | null;
          color?: string | null;
          approved?: boolean;
        };
        Update: {
          model?: string;
          generation?: string;
          engine?: string | null;
          power_hp?: number | null;
          year?: number | null;
          color?: string | null;
          cover_photo_id?: string | null;
          approved?: boolean;
          hidden_at?: string | null;
        };
        Relationships: [];
      };
      car_photos: {
        Row: {
          id: string;
          car_id: string;
          storage_path: string;
          alt: string | null;
          sort_order: number;
          created_at: string;
        };
        Insert: {
          car_id: string;
          storage_path: string;
          alt?: string | null;
          sort_order?: number;
        };
        Update: {
          storage_path?: string;
          alt?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      car_mods: {
        Row: {
          id: string;
          car_id: string;
          category: string;
          description: string;
          sort_order: number;
        };
        Insert: {
          car_id: string;
          category: string;
          description: string;
          sort_order?: number;
        };
        Update: {
          category?: string;
          description?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      car_likes: {
        Row: {
          car_id: string;
          profile_id: string;
          created_at: string;
        };
        Insert: {
          car_id: string;
          profile_id: string;
        };
        Update: never;
        Relationships: [];
      };
      car_comments: {
        Row: {
          id: string;
          car_id: string;
          profile_id: string;
          body: string;
          hidden_at: string | null;
          created_at: string;
        };
        Insert: {
          car_id: string;
          profile_id: string;
          body: string;
        };
        Update: {
          body?: string;
          hidden_at?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          title: string;
          slug: string;
          status: "draft" | "published" | "archived";
          description: string | null;
          cover_url: string | null;
          city: string | null;
          location_name: string | null;
          location_address: string | null;
          maps_url: string | null;
          starts_at: string;
          ends_at: string | null;
          price_ron: number;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          title: string;
          slug: string;
          status?: "draft" | "published" | "archived";
          description?: string | null;
          cover_url?: string | null;
          city?: string | null;
          location_name?: string | null;
          location_address?: string | null;
          maps_url?: string | null;
          starts_at: string;
          ends_at?: string | null;
          price_ron?: number;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          slug?: string;
          status?: "draft" | "published" | "archived";
          description?: string | null;
          cover_url?: string | null;
          city?: string | null;
          location_name?: string | null;
          location_address?: string | null;
          maps_url?: string | null;
          starts_at?: string;
          ends_at?: string | null;
          price_ron?: number;
        };
        Relationships: [];
      };
      event_schedule_items: {
        Row: {
          id: string;
          event_id: string;
          starts_at: string;
          title: string;
          sort_order: number;
        };
        Insert: {
          event_id: string;
          starts_at: string;
          title: string;
          sort_order?: number;
        };
        Update: {
          starts_at?: string;
          title?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      event_categories: {
        Row: {
          id: string;
          event_id: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          event_id: string;
          name: string;
          sort_order?: number;
        };
        Update: {
          name?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      event_registrations: {
        Row: {
          id: string;
          event_id: string;
          profile_id: string;
          car_id: string | null;
          category_id: string | null;
          qr_token: string;
          payment_status: "pending" | "cash" | "transfer" | "paid" | "refunded";
          checked_in_at: string | null;
          checked_in_by: string | null;
          created_at: string;
        };
        Insert: {
          event_id: string;
          profile_id: string;
          car_id?: string | null;
          category_id?: string | null;
          payment_status?: "pending" | "cash" | "transfer" | "paid" | "refunded";
        };
        Update: {
          payment_status?: "pending" | "cash" | "transfer" | "paid" | "refunded";
          checked_in_at?: string | null;
          checked_in_by?: string | null;
        };
        Relationships: [];
      };
      sponsors: {
        Row: {
          id: string;
          name: string;
          logo_url: string | null;
          website: string | null;
          contact_email: string | null;
          active: boolean;
          created_at: string;
        };
        Insert: {
          name: string;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          active?: boolean;
        };
        Update: {
          name?: string;
          logo_url?: string | null;
          website?: string | null;
          contact_email?: string | null;
          active?: boolean;
        };
        Relationships: [];
      };
      event_sponsors: {
        Row: {
          event_id: string;
          sponsor_id: string;
          placement: string | null;
          sort_order: number;
        };
        Insert: {
          event_id: string;
          sponsor_id: string;
          placement?: string | null;
          sort_order?: number;
        };
        Update: {
          placement?: string | null;
          sort_order?: number;
        };
        Relationships: [];
      };
      announcements: {
        Row: {
          id: string;
          title: string;
          body: string;
          pinned: boolean;
          published_at: string;
          created_by: string | null;
        };
        Insert: {
          title: string;
          body: string;
          pinned?: boolean;
          published_at?: string;
          created_by?: string | null;
        };
        Update: {
          title?: string;
          body?: string;
          pinned?: boolean;
          published_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      app_role: "member" | "staff" | "admin" | "sponsor";
      member_level: "Bronze" | "Silver" | "Gold" | "Elite";
      payment_status: "pending" | "cash" | "transfer" | "paid" | "refunded";
      event_status: "draft" | "published" | "archived";
    };
    CompositeTypes: Record<string, never>;
  };
}

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase: SupabaseClient<Database> | null = hasSupabaseConfig
  ? createClient<Database>(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;
