import axios from "axios";
import { supabase } from "./supabase";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: { "Content-Type": "application/json" }
});

// Attach fresh Supabase token to every request (auto-refresh if needed)
api.interceptors.request.use(async (config) => {
  try {
    // refreshSession will get a new access_token if the current one is expired
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      // Try refreshing explicitly
      const { data: refreshData } = await supabase.auth.refreshSession();
      if (refreshData?.session?.access_token) {
        config.headers.Authorization = `Bearer ${refreshData.session.access_token}`;
        return config;
      }
      // No valid session — let the request go without token (will 401, handled below)
      return config;
    }
    config.headers.Authorization = `Bearer ${data.session.access_token}`;
  } catch {
    // Fail silently — 401 interceptor handles auth errors
  }
  return config;
});

// On 401: try one token refresh then retry; if still fails → redirect to /login
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retried) {
      error.config._retried = true;
      try {
        const { data } = await supabase.auth.refreshSession();
        if (data?.session?.access_token) {
          error.config.headers.Authorization = `Bearer ${data.session.access_token}`;
          return api(error.config);
        }
      } catch {
        // Refresh failed
      }
      // Give up — sign out and redirect
      await supabase.auth.signOut();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
