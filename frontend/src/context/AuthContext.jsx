import { createContext, useEffect, useMemo, useState } from "react";
import api from "../services/api";

export const AuthContext = createContext(null);

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
      } catch {
        localStorage.removeItem("auth_token");
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
        setUser(data.user);
        return data;
      },
      async register(payload) {
        const { data } = await api.post("/auth/register", payload);
        localStorage.setItem("auth_token", data.token);
        setUser(data.user);
        return data;
      },
      logout() {
        localStorage.removeItem("auth_token");
        setUser(null);
      }
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
