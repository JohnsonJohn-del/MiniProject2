import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";

const updatePlanSchema = z.object({
  subscription_plan: z.enum(["free", "pro", "premium"])
});

const toggleActiveSchema = z.object({
  is_active: z.boolean()
});

export async function getAdminOverview(req, res) {
  // Fetch users
  const { data: users, error: usersError } = await supabaseAdmin
    .from("users")
    .select("is_active, subscription_plan")
    .eq("role", "client");
  if (usersError) throw new AppError("Failed to fetch users", 500);

  let total_users = 0;
  let active_users = 0;
  let paid_subscriptions = 0;
  const planCounts = {};

  users.forEach(u => {
    total_users++;
    if (u.is_active) active_users++;
    if (u.subscription_plan !== "free") paid_subscriptions++;
    planCounts[u.subscription_plan] = (planCounts[u.subscription_plan] || 0) + 1;
  });

  const most_used_plan = Object.entries(planCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "free";

  // Counts using head requests
  const countTable = async (table) => {
    const { count } = await supabaseAdmin.from(table).select("*", { count: 'exact', head: true });
    return count || 0;
  };

  const total_recipes = await countTable("recipes");
  const ingredients = await countTable("ingredients");
  const menu_items = await countTable("menu_items");
  const operational_expenses = await countTable("operational_expenses");
  const ai_logs = await countTable("ai_usage_logs");

  // AI Usage
  const { data: aiLogs } = await supabaseAdmin.from("ai_usage_logs").select("request_count, log_date");
  const todayStr = new Date().toISOString().split("T")[0];
  let total_ai_requests = 0;
  let today_ai_requests = 0;

  (aiLogs || []).forEach(log => {
    total_ai_requests += log.request_count;
    if (log.log_date === todayStr) {
      today_ai_requests += log.request_count;
    }
  });

  res.json({
    success: true,
    overview: {
      total_users,
      active_users,
      paid_subscriptions,
      most_used_plan,
      total_recipes,
      total_ai_requests,
      today_ai_requests,
      ingredients,
      menu_items,
      operational_expenses,
      ai_logs,
      plan_counts: planCounts
    }
  });
}

export async function listUsers(req, res) {
  const { search = "", plan, status } = req.query;
  
  let query = supabaseAdmin
    .from("users")
    .select("id, name, email, role, subscription_plan, is_active, recipes_created, ai_requests_used, created_at")
    .eq("role", "client")
    .order("created_at", { ascending: false });

  if (plan) query = query.eq("subscription_plan", plan);
  if (status === "active") query = query.eq("is_active", true);
  if (status === "inactive") query = query.eq("is_active", false);
  
  const { data: users, error } = await query;
  if (error) throw new AppError("Failed to fetch users", 500);

  let filteredUsers = users;
  if (search) {
    const s = search.toLowerCase();
    filteredUsers = users.filter(u => u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s));
  }

  res.json({ success: true, users: filteredUsers });
}

export async function updateUserPlan(req, res) {
  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid subscription payload", 400);

  const { userId } = req.params;
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ subscription_plan: parsed.data.subscription_plan, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("role", "client")
    .select("id, name, email, subscription_plan")
    .single();

  if (error || !data) throw new AppError("Client not found", 404);
  res.json({ success: true, user: data });
}

export async function updateUserActiveStatus(req, res) {
  const parsed = toggleActiveSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid active status payload", 400);

  const { userId } = req.params;
  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ is_active: parsed.data.is_active, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("role", "client")
    .select("id, name, email, is_active")
    .single();

  if (error || !data) throw new AppError("Client not found", 404);
  res.json({ success: true, user: data });
}

export async function resetUserAiUsage(req, res) {
  const { userId } = req.params;
  
  await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", userId);

  const { data, error } = await supabaseAdmin
    .from("users")
    .update({ ai_requests_used: 0, updated_at: new Date().toISOString() })
    .eq("id", userId)
    .eq("role", "client")
    .select("id, name, email, ai_requests_used")
    .single();

  if (error || !data) throw new AppError("Client not found", 404);
  res.json({ success: true, user: data });
}

export async function listAdminAiUsage(req, res) {
  // We need to join ai_usage_logs with users
  const { data: logs, error } = await supabaseAdmin
    .from("ai_usage_logs")
    .select("id, user_id, request_count, log_date, created_at, users(name, email)")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) throw new AppError("Failed to fetch AI logs", 500);

  const mappedLogs = logs.map(l => ({
    id: l.id,
    user_id: l.user_id,
    name: l.users?.name,
    email: l.users?.email,
    request_count: l.request_count,
    log_date: l.log_date,
    created_at: l.created_at
  }));

  res.json({ success: true, logs: mappedLogs });
}

export async function listEntityRecords(req, res) {
  const { entity } = req.params;
  const allowList = ["recipes", "ingredients", "menu_items", "operational_expenses"];

  if (!allowList.includes(entity)) throw new AppError("Unsupported entity", 400);

  let selectStr = "*, users(name, email)";
  if (entity === "menu_items") {
    selectStr = "*, users(name, email), recipes(recipe_name)";
  }

  const { data, error } = await supabaseAdmin
    .from(entity)
    .select(selectStr)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    console.error(`Failed to fetch ${entity}:`, error);
    throw new AppError(`Failed to fetch ${entity}`, 500);
  }

  const mapped = (data || []).map(r => ({
    ...r,
    owner_name: r.users?.name || "Unknown",
    owner_email: r.users?.email || "Unknown",
    recipe_name: r.recipes?.recipe_name || r.recipe_name || "Unknown"
  }));

  res.json({ success: true, records: mapped });
}
