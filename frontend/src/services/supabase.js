import { createClient } from "@supabase/supabase-js";

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
export const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmdvbHdqdXFqdnFjbWN3ZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA5MjcsImV4cCI6MjA5Mzg0NjkyN30.CzVyo2fXePgy_7lSBUDDoIgXs09kshib5c1k78RjxhQ";

const customFetch = (url, options) => {
  const signal = options?.signal;
  const controller = new AbortController();
  
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const timeoutId = setTimeout(() => {
    console.warn(`[Supabase Client] Request timed out for: ${url}`);
    controller.abort();
  }, 5000);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
};

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  },
  global: { fetch: customFetch }
});

export function isSupabaseConfigured() {
  return (
    !!supabaseUrl &&
    !!supabaseKey &&
    supabaseUrl !== "<YOUR_SUPABASE_URL>" &&
    supabaseKey !== "<YOUR_SUPABASE_PUBLISHABLE_KEY>"
  );
}