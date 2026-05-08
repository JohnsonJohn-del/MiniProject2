import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";

const updatePlanSchema = z.object({
  subscription_plan: z.enum(["free", "pro", "premium"])
});

const toggleActiveSchema = z.object({
  is_active: z.boolean()
});

export async function getAdminOverview(req, res) {
  const usersResult = await query(
    `SELECT COUNT(*)::int AS total_users,
            COUNT(*) FILTER (WHERE is_active = true)::int AS active_users,
            COUNT(*) FILTER (WHERE subscription_plan != 'free')::int AS paid_subscriptions
     FROM users
     WHERE role = 'client'`
  );

  const mostUsedPlanResult = await query(
    `SELECT subscription_plan, COUNT(*)::int AS count
     FROM users
     WHERE role = 'client'
     GROUP BY subscription_plan
     ORDER BY count DESC
     LIMIT 1`
  );

  const recipeResult = await query("SELECT COUNT(*)::int AS total_recipes FROM recipes");
  const aiResult = await query(
    `SELECT COALESCE(SUM(request_count), 0)::int AS total_ai_requests,
            COALESCE(SUM(request_count) FILTER (WHERE log_date = CURRENT_DATE), 0)::int AS today_ai_requests
     FROM ai_usage_logs`
  );

  const entityCountsResult = await query(
    `SELECT
      (SELECT COUNT(*)::int FROM ingredients) AS ingredients,
      (SELECT COUNT(*)::int FROM menu_items) AS menu_items,
      (SELECT COUNT(*)::int FROM operational_expenses) AS operational_expenses,
      (SELECT COUNT(*)::int FROM ai_usage_logs) AS ai_logs`
  );

  res.json({
    success: true,
    overview: {
      ...usersResult.rows[0],
      most_used_plan: mostUsedPlanResult.rows[0]?.subscription_plan || "free",
      total_recipes: recipeResult.rows[0].total_recipes,
      ...aiResult.rows[0],
      ...entityCountsResult.rows[0]
    }
  });
}

export async function listUsers(req, res) {
  const { search = "", plan, status } = req.query;
  const where = ["role = 'client'"];
  const values = [];

  if (search) {
    values.push(`%${search}%`);
    where.push(`(name ILIKE $${values.length} OR email ILIKE $${values.length})`);
  }
  if (plan) {
    values.push(plan);
    where.push(`subscription_plan = $${values.length}`);
  }
  if (status === "active" || status === "inactive") {
    values.push(status === "active");
    where.push(`is_active = $${values.length}`);
  }

  const result = await query(
    `SELECT id, name, email, role, subscription_plan, is_active, recipes_created, ai_requests_used, created_at
     FROM users
     WHERE ${where.join(" AND ")}
     ORDER BY created_at DESC`,
    values
  );

  res.json({ success: true, users: result.rows });
}

export async function updateUserPlan(req, res) {
  const parsed = updatePlanSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid subscription payload", 400);

  const { userId } = req.params;
  const result = await query(
    `UPDATE users
     SET subscription_plan = $1,
         updated_at = now()
     WHERE id = $2
       AND role = 'client'
     RETURNING id, name, email, subscription_plan`,
    [parsed.data.subscription_plan, userId]
  );

  if (!result.rows[0]) throw new AppError("Client not found", 404);
  res.json({ success: true, user: result.rows[0] });
}

export async function updateUserActiveStatus(req, res) {
  const parsed = toggleActiveSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid active status payload", 400);

  const { userId } = req.params;
  const result = await query(
    `UPDATE users
     SET is_active = $1,
         updated_at = now()
     WHERE id = $2
       AND role = 'client'
     RETURNING id, name, email, is_active`,
    [parsed.data.is_active, userId]
  );

  if (!result.rows[0]) throw new AppError("Client not found", 404);
  res.json({ success: true, user: result.rows[0] });
}

export async function resetUserAiUsage(req, res) {
  const { userId } = req.params;
  await query("DELETE FROM ai_usage_logs WHERE user_id = $1", [userId]);

  const result = await query(
    `UPDATE users
     SET ai_requests_used = 0,
         updated_at = now()
     WHERE id = $1
       AND role = 'client'
     RETURNING id, name, email, ai_requests_used`,
    [userId]
  );

  if (!result.rows[0]) throw new AppError("Client not found", 404);
  res.json({ success: true, user: result.rows[0] });
}

export async function listAdminAiUsage(req, res) {
  const result = await query(
    `SELECT l.id, l.user_id, u.name, u.email, l.request_count, l.log_date, l.created_at
     FROM ai_usage_logs l
     JOIN users u ON u.id = l.user_id
     ORDER BY l.created_at DESC
     LIMIT 200`
  );
  res.json({ success: true, logs: result.rows });
}

export async function listEntityRecords(req, res) {
  const { entity } = req.params;
  const allowList = {
    recipes: "SELECT id, user_id, recipe_name, total_cost, created_at FROM recipes ORDER BY created_at DESC LIMIT 200",
    ingredients:
      "SELECT id, user_id, ingredient_name, unit, price_per_unit, created_at FROM ingredients ORDER BY created_at DESC LIMIT 200",
    menu_items:
      "SELECT id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, created_at FROM menu_items ORDER BY created_at DESC LIMIT 200",
    operational_expenses:
      "SELECT id, user_id, electricity_bill, gas_bill, salary_cost, month, created_at FROM operational_expenses ORDER BY created_at DESC LIMIT 200"
  };

  const sql = allowList[entity];
  if (!sql) throw new AppError("Unsupported entity", 400);

  const result = await query(sql);
  res.json({ success: true, records: result.rows });
}
