import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

export function getPlanConfig(planKey) {
  return SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.free;
}

export async function getUserSubscriptionUsage(userId) {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("subscription_plan, recipes_created, ai_requests_used")
    .eq("id", userId)
    .single();

  if (error || !data) {
    return { subscription_plan: "free", recipes_created: 0, ai_requests_used: 0 };
  }

  return data;
}

export async function getTodayAiRequests(userId) {
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data, error } = await supabaseAdmin
      .from("ai_usage_logs")
      .select("request_count")
      .eq("user_id", userId)
      .eq("log_date", today);

    if (error || !data || data.length === 0) return 0;

    return data.reduce((sum, row) => sum + (Number(row.request_count) || 0), 0);
  } catch {
    return 0;
  }
}

export async function incrementAiUsage(userId) {
  const today = new Date().toISOString().split("T")[0];

  try {
    const { data: existing } = await supabaseAdmin
      .from("ai_usage_logs")
      .select("id, request_count")
      .eq("user_id", userId)
      .eq("log_date", today);

    if (existing && existing.length > 0) {
      await supabaseAdmin
        .from("ai_usage_logs")
        .update({ request_count: existing[0].request_count + 1 })
        .eq("id", existing[0].id);
    } else {
      await supabaseAdmin
        .from("ai_usage_logs")
        .insert({ user_id: userId, request_count: 1, log_date: today });
    }
  } catch {
    return;
  }

  try {
    const { data: logs } = await supabaseAdmin
      .from("ai_usage_logs")
      .select("request_count")
      .eq("user_id", userId);

    const totalAi = (logs || []).reduce((sum, row) => sum + (Number(row.request_count) || 0), 0);

    await supabaseAdmin
      .from("users")
      .update({ ai_requests_used: totalAi })
      .eq("id", userId);
  } catch {
    return;
  }
}
