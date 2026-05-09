import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";
import { env } from "../config/env.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

async function findUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, name, role, subscription_plan, is_active")
    .eq("email", email)
    .maybeSingle();
  if (error) throw new AppError("Database error", 500);
  return data;
}

async function findUserById(id) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, role, subscription_plan, is_active")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new AppError("Database error", 500);
  return data;
}

async function createUserFromSupabase(supabaseUser) {
  const meta = supabaseUser.user_metadata || {};
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      name: meta.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email,
      password_hash: "supabase-auth",
      role: meta.role || "client",
      subscription_plan: meta.subscription_plan || "free"
    })
    .select("id, email, name, role, subscription_plan, is_active")
    .single();
  if (error) throw new AppError("Failed to create user", 500);
  return data;
}

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];

    try {
      const decoded = verifyToken(token);
      const user = await findUserById(decoded.userId);
      if (!user || !user.is_active) {
        return next(new AppError("User not found or inactive", 401));
      }
      req.user = user;
      return next();
    } catch {
      const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: env.supabaseAnonKey,
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return next(new AppError("Invalid or expired token", 401));
      }

      const supabaseUser = await response.json();
      let user = await findUserByEmail(supabaseUser.email);

      if (!user) {
        user = await createUserFromSupabase(supabaseUser);
      }

      if (!user || !user.is_active) {
        return next(new AppError("User not found or inactive", 401));
      }

      req.user = user;
      next();
    }
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}
