import { AppError } from "../utils/appError.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

async function findUserByEmail(email) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, email, name, role, subscription_plan, is_active")
    .eq("email", email)
    .maybeSingle();
  if (error) {
    console.error("findUserByEmail error:", error);
    throw new AppError("Database error during user lookup", 500);
  }
  return data;
}

async function createUserFromSupabase(supabaseUser) {
  const meta = supabaseUser.user_metadata || {};
  const { data, error } = await supabaseAdmin
    .from("users")
    .insert({
      id: supabaseUser.id,
      name: meta.name || supabaseUser.email?.split("@")[0] || "User",
      email: supabaseUser.email,
      password_hash: "supabase-auth",
      role: meta.role || "client",
      subscription_plan: meta.subscription_plan || "free"
    })
    .select("id, email, name, role, subscription_plan, is_active")
    .single();
  if (error) {
    console.error("createUserFromSupabase error:", error);
    throw new AppError("Failed to create local user", 500);
  }
  return data;
}

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("[Auth] Missing or invalid authorization header");
      return next(new AppError("Authentication required. Missing token.", 401));
    }

    const token = authHeader.split(" ")[1];

    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !supabaseUser) {
      console.error("[Auth] Invalid or expired token via Supabase:", error?.message || "No user found");
      return next(new AppError("Invalid or expired session token", 401));
    }

    let user = await findUserByEmail(supabaseUser.email);

    if (!user) {
      user = await createUserFromSupabase(supabaseUser);
    }

    if (!user || !user.is_active) {
      console.error(`[Auth] User account inactive or missing: ${supabaseUser.email}`);
      return next(new AppError("User account is inactive or not found", 401));
    }

    req.user = user;
    next();
  } catch (err) {
    console.error("[Auth] Unexpected authentication failure:", err.message);
    return next(new AppError("Authentication failed due to an unexpected error", 401));
  }
}
