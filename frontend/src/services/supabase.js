import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmdvbHdqdXFqdnFjbWN3ZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA5MjcsImV4cCI6MjA5Mzg0NjkyN30.CzVyo2fXePgy_7lSBUDDoIgXs09kshib5c1k78RjxhQ";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

export function isSupabaseConfigured() {
  return (
    !!supabaseUrl &&
    !!supabaseKey &&
    supabaseUrl !== "<YOUR_SUPABASE_URL>" &&
    supabaseKey !== "<YOUR_SUPABASE_PUBLISHABLE_KEY>"
  );
}