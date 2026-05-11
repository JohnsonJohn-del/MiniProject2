import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";
import { getTodayAiRequests } from "../services/subscriptionService.js";

export async function getCurrentSubscription(req, res) {
  const { data: user, error } = await supabaseAdmin
    .from("users")
    .select("id, subscription_plan, recipes_created, ai_requests_used")
    .eq("id", req.user.id)
    .single();

  if (error || !user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const plan = SUBSCRIPTION_PLANS[user.subscription_plan] || SUBSCRIPTION_PLANS.free;
  const todayAiUsage = await getTodayAiRequests(req.user.id);

  res.json({
    success: true,
    subscription: {
      plan: user.subscription_plan,
      limits: {
        maxRecipes: plan.maxRecipes,
        aiRequestsPerDay: plan.aiRequestsPerDay
      },
      usage: {
        recipesCreated: user.recipes_created,
        aiRequestsToday: todayAiUsage,
        aiRequestsLifetime: user.ai_requests_used
      },
      features: plan.features
    }
  });
}
