import { createClient } from "@supabase/supabase-js";
import { env } from "./env.js";

const customFetch = (url, options) => {
  const signal = options?.signal;
  const controller = new AbortController();
  
  if (signal) {
    signal.addEventListener("abort", () => controller.abort());
  }

  const timeoutId = setTimeout(() => {
    console.warn(`[Supabase Admin] Request timed out for: ${url}`);
    controller.abort();
  }, 5000);

  return fetch(url, { ...options, signal: controller.signal })
    .finally(() => clearTimeout(timeoutId));
};

export const supabaseAdmin = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: customFetch }
});
