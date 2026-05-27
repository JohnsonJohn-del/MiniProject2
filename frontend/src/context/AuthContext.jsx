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
    role: meta.role || "client"
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

        // Check if there's a pending profile to submit after successful login
        const pendingProfile = localStorage.getItem("pendingProfile");
        if (pendingProfile) {
          try {
            const p = JSON.parse(pendingProfile);
            const { default: api } = await import("../services/api.js");
            await api.post("/profile", {
              business_name: p.business_name,
              business_type: p.business_type,
              phone_number: p.phone_number,
              tax_id: p.tax_id,
              website: p.website,
              address: p.address,
              city: p.city,
              state: p.state,
              country: p.country,
              postal_code: p.postal_code,
              online_platforms: p.online_platforms
            });
            localStorage.removeItem("pendingProfile");
          } catch (profileError) {
            console.error("Failed to save pending profile data:", profileError);
          }
        }

        return { user: mapSupabaseUser(data.user) };
      },
      async register(payload) {
        const { data, error } = await supabase.auth.signUp({
          email: payload.email,
          password: payload.password,
          options: {
            data: {
              name: payload.name,
              role: "client"
            }
          }
        });
        if (error) throw error;
        
        // If email confirmation is required, Supabase won't return a session immediately.
        if (!data.session) {
          localStorage.setItem("pendingProfile", JSON.stringify(payload));
          throw new Error("Please check your email to confirm your account. You can log in afterwards to complete the setup.");
        }

        try {
          const { default: api } = await import("../services/api.js");
          await api.post("/profile", {
            business_name: payload.business_name,
            business_type: payload.business_type,
            phone_number: payload.phone_number,
            tax_id: payload.tax_id,
            website: payload.website,
            address: payload.address,
            city: payload.city,
            state: payload.state,
            country: payload.country,
            postal_code: payload.postal_code,
            online_platforms: payload.online_platforms
          });
        } catch (profileError) {
          console.error("Failed to save profile data:", profileError);
        }

        return { user: mapSupabaseUser(data.user) };
      },
      async loginAsDemo(role = "client") {
        const email = role === "admin" ? "admin@demo.com" : "client@demo.com";
        const password = "password123";

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
                role
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
        console.log("Starting logout process...");
        localStorage.removeItem("demo_mode");
        setUser(null); // Clear state immediately for instant UI response
        
        try {
          // Attempt to sign out from Supabase, but don't let it block the UI
          await supabase.auth.signOut();
          console.log("Supabase session cleared.");
        } catch (error) {
          console.error("Supabase signOut error (ignoring):", error);
        }
      },
      isDemo: localStorage.getItem("demo_mode") === "1" || isDemoEmail(user?.email)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}