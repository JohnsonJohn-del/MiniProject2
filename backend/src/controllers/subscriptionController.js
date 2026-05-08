import { query } from "../config/db.js";
import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";
import { getTodayAiRequests } from "../services/subscriptionService.js";

export async function getCurrentSubscription(req, res) {
  const result = await query(
    "SELECT id, subscription_plan, recipes_created, ai_requests_used FROM users WHERE id = $1",
    [req.user.id]
  );

  const user = result.rows[0];
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
