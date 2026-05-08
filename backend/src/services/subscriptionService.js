import { SUBSCRIPTION_PLANS } from "../config/subscriptionPlans.js";
import { query } from "../config/db.js";

export function getPlanConfig(planKey) {
  return SUBSCRIPTION_PLANS[planKey] || SUBSCRIPTION_PLANS.free;
}

export async function getUserSubscriptionUsage(userId) {
  const userResult = await query(
    "SELECT subscription_plan, recipes_created, ai_requests_used FROM users WHERE id = $1",
    [userId]
  );
  return userResult.rows[0];
}

export async function getTodayAiRequests(userId) {
  const result = await query(
    `SELECT COALESCE(SUM(request_count), 0)::int AS requests
     FROM ai_usage_logs
     WHERE user_id = $1 AND log_date = CURRENT_DATE`,
    [userId]
  );
  return Number(result.rows[0].requests || 0);
}

export async function incrementAiUsage(userId) {
  await query(
    `INSERT INTO ai_usage_logs (user_id, request_count, log_date)
     VALUES ($1, 1, CURRENT_DATE)`,
    [userId]
  );

  await query(
    `UPDATE users
     SET ai_requests_used = (
       SELECT COALESCE(SUM(request_count), 0)::int
       FROM ai_usage_logs
       WHERE user_id = $1
     )
     WHERE id = $1`,
    [userId]
  );
}
