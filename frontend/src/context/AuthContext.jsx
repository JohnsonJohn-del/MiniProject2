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

    const fetchUserAndProfile = async (sessionUser) => {
      console.log("[Auth] fetchUserAndProfile started for:", sessionUser?.id);
      if (!sessionUser) return null;
      const baseUser = mapSupabaseUser(sessionUser);
      try {
        console.log("[Auth] Querying restaurant_profiles...");
        const { data: profile } = await Promise.race([
          supabase
            .from("restaurant_profiles")
            .select("*")
            .eq("user_id", sessionUser.id)
            .maybeSingle(),
          new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase query timeout after 5s")), 5000))
        ]);
        console.log("[Auth] restaurant_profiles query resolved:", !!profile);
        if (profile) {
          let packaging_cost = 15;
          let clean_platforms = [];
          if (Array.isArray(profile.online_platforms)) {
            profile.online_platforms.forEach(p => {
              if (p && typeof p === "string" && p.startsWith("__pkg_cost:")) {
                packaging_cost = Number(p.split(":")[1]) || 15;
              } else if (p) {
                clean_platforms.push(p);
              }
            });
          }
          return {
            ...baseUser,
            ...profile,
            id: baseUser.id,
            profile_id: profile.id,
            online_platforms: clean_platforms,
            packaging_cost
          };
        }
      } catch (err) {
        console.error("[Auth] Error fetching user profile:", err);
      }
      return baseUser;
    };

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      try {
        if (session?.user) {
          const fullUser = await fetchUserAndProfile(session.user);
          setUser(fullUser);
          localStorage.setItem("demo_mode", isDemoEmail(session.user.email) ? "1" : "0");
        } else {
          setUser(null);
          localStorage.removeItem("demo_mode");
        }
      } catch (err) {
        console.error("Error in onAuthStateChange:", err);
      } finally {
        setLoading(false);
      }
    });

    const initAuth = async () => {
      console.log("[Auth] initAuth started");
      try {
        console.log("[Auth] Calling getSession...");
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[Auth] getSession resolved, session exists:", !!session);
        if (session?.user && mounted) {
          console.log("[Auth] Fetching user and profile...");
          const fullUser = await fetchUserAndProfile(session.user);
          console.log("[Auth] fetchUserAndProfile complete:", fullUser?.email);
          setUser(fullUser);
          localStorage.setItem("demo_mode", isDemoEmail(session.user.email) ? "1" : "0");
        } else if (mounted) {
          console.log("[Auth] No session found");
          setUser(null);
          localStorage.removeItem("demo_mode");
        }
      } catch (err) {
        console.error("[Auth] Failed to initialize session:", err);
      } finally {
        if (mounted) {
          console.log("[Auth] Setting loading to false");
          setLoading(false);
        }
      }
    };
    initAuth();

    return () => {
      mounted = false;
      listener?.subscription?.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async refreshProfile() {
        if (!user) return;
        try {
          const { data: profile } = await Promise.race([
            supabase
              .from("restaurant_profiles")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Supabase query timeout after 5s")), 5000))
          ]);
          if (profile) {
            let packaging_cost = 15;
            let clean_platforms = [];
            if (Array.isArray(profile.online_platforms)) {
              profile.online_platforms.forEach(p => {
                if (p && typeof p === "string" && p.startsWith("__pkg_cost:")) {
                  packaging_cost = Number(p.split(":")[1]) || 15;
                } else if (p) {
                  clean_platforms.push(p);
                }
              });
            }
            setUser(prev => ({
              ...prev,
              ...profile,
              id: prev.id,
              profile_id: profile.id,
              online_platforms: clean_platforms,
              packaging_cost
            }));
          }
        } catch (err) {
          console.error("Failed to refresh profile:", err);
        }
      },
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