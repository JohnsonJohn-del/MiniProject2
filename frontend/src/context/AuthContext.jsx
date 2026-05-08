import { createContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

function isDemoEmail(email) {
  return String(email || "").toLowerCase().endsWith("@demo.com");
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
        localStorage.setItem("demo_mode", isDemoEmail(data.user?.email) ? "1" : "0");
      } catch {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("demo_mode");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const { data } = await api.post("/auth/login", payload);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("demo_mode", isDemoEmail(data.user?.email) ? "1" : "0");
        setUser(data.user);
        return data;
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("demo_mode", "0");
        setUser(data.user);
        return data;
      },
      async loginAsDemo(role = "client") {
        const payload =
          role === "admin"
            ? { email: "admin@demo.com", password: "123456" }
            : { email: "client@demo.com", password: "123456" };
        const { data } = await api.post("/auth/login", payload);
        localStorage.setItem("auth_token", data.token);
        localStorage.setItem("demo_mode", "1");
        setUser(data.user);
        return data;
      },
      logout() {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("demo_mode");
        setUser(null);
      },
      isDemo: localStorage.getItem("demo_mode") === "1" || isDemoEmail(user?.email)
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
