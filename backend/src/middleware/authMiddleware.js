import { query } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyToken(token);
      const result = await query(
        "SELECT id, email, role, subscription_plan, is_active FROM users WHERE id = $1",
        [decoded.userId]
      );
      if (!result.rows[0] || !result.rows[0].is_active) {
        return next(new AppError("User not found or inactive", 401));
      }
      req.user = result.rows[0];
      return next();
    } catch {
      const supabaseUrl = process.env.SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
      const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmdvbHdqdXFqdnFjbWN3ZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA5MjcsImV4cCI6MjA5Mzg0NjkyN30.CzVyo2fXePgy_7lSBUDDoIgXs09kshib5c1k78RjxhQ";

      const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return next(new AppError("Invalid or expired token", 401));
      }

      const supabaseUser = await response.json();

      let result = await query(
        "SELECT id, email, name, role, subscription_plan, is_active FROM users WHERE email = $1",
        [supabaseUser.email]
      );

      if (!result.rows[0]) {
        const meta = supabaseUser.user_metadata || {};
        const insertResult = await query(
          `INSERT INTO users (name, email, password_hash, role, subscription_plan)
           VALUES ($1, $2, 'supabase-auth', $3, $4)
           RETURNING id, email, name, role, subscription_plan, is_active`,
          [
            meta.name || supabaseUser.email?.split("@")[0] || "User",
            supabaseUser.email,
            meta.role || "client",
            meta.subscription_plan || "free"
          ]
        );
        result = insertResult;
      }

      if (!result.rows[0] || !result.rows[0].is_active) {
        return next(new AppError("User not found or inactive", 401));
      }

      req.user = result.rows[0];
      next();
    }
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}