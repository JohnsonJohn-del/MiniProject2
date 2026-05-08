import { createContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../services/supabase";

export const AuthContext = createContext(null);

function isDemoEmail(email) {
  return String(email || "").toLowerCase().endsWith("@demo.com");
}

function mapSupabaseUser(sbUser) {
  if (!sbUser) return null;
  const meta = sbUser.user_metadata || {};
  return {
    id: sbUser.id,
    email: sbUser.email,
    name: meta.name || sbUser.email?.split("@")[0] || "User",
    role: meta.role || "client",
    subscription_plan: meta.subscription_plan || "free"
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        localStorage.setItem("demo_mode", isDemoEmail(session.user.email) ? "1" : "0");
      } else {
        setUser(null);
        localStorage.removeItem("demo_mode");
      }
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(mapSupabaseUser(session.user));
        localStorage.setItem("demo_mode", isDemoEmail(session.user.email) ? "1" : "0");
      } else {
        setUser(null);
        localStorage.removeItem("demo_mode");
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: payload.email,
          password: payload.password
        });
        if (error) throw error;
        return { user: mapSupabaseUser(data.user) };
      },
      async register(payload) {
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              role: "client",
              subscription_plan: "free"
            }
          }
        });
        if (error) throw error;
        return { user: mapSupabaseUser(data.user) };
      },
      async loginAsDemo(role = "client") {
        const email = role === "admin" ? "admin@demo.com" : "client@demo.com";
        const password = "123456";

        let { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error && error.message?.toLowerCase().includes("invalid")) {
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                name: role === "admin" ? "Demo Admin" : "Demo Client",
                role,
                subscription_plan: "premium"
              }
            }
          });
          if (signUpError) throw signUpError;

          const retry = await supabase.auth.signInWithPassword({
            email,
            password
          });
          if (retry.error) throw retry.error;
          data = retry.data;
        } else if (error) {
          throw error;
        }

        return { user: mapSupabaseUser(data.user) };
      },
      async logout() {
        await supabase.auth.signOut();
        localStorage.removeItem("demo_mode");
        setUser(null);
      },
      isDemo: localStorage.getItem("demo_mode") === "1" || isDemoEmail(user?.email)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}