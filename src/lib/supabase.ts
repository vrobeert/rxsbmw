import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          city: string | null;
          role: "member" | "staff" | "admin" | "sponsor";
          member_level: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          city?: string | null;
          role?: "member" | "staff" | "admin" | "sponsor";
          member_level?: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url?: string | null;
          bio?: string | null;
        };
        Update: {
          full_name?: string;
          city?: string | null;
          role?: "member" | "staff" | "admin" | "sponsor";
          member_level?: "Bronze" | "Silver" | "Gold" | "Elite";
          avatar_url?: string | null;
          bio?: string | null;
        };
      };
    };
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
