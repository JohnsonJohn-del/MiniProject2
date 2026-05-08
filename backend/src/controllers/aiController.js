import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { calculateRecipeCost } from "../services/costingService.js";
import { generatePricingAdvice } from "../services/aiPricingService.js";
import { getTodayAiRequests, incrementAiUsage } from "../services/subscriptionService.js";

const pricingSchema = z.object({
  recipe_id: z.string().uuid(),
  current_price: z.coerce.number().min(0).optional(),
  month: z.string().regex(/^\d{4}-\d{2}$/).optional()
});

export async function getAiPricingAdvice(req, res) {
  const parsed = pricingSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid AI pricing payload", 400);

  const { recipe_id, current_price, month } = parsed.data;
  const costData = await calculateRecipeCost({ recipeId: recipe_id, user: req.user, month });

  const advice = await generatePricingAdvice({
    recipeName: costData.recipe.recipe_name,
    finalDishCost: costData.finalDishCost,
    currentPrice: current_price
  });

  await query(
    `UPDATE menu_items
     SET ai_suggested_price = $1,
         updated_at = now()
     WHERE recipe_id = $2
       AND ($3::text = 'admin' OR user_id = $4)`,
    [advice.recommendation.idealSellingPrice, recipe_id, req.user.role, req.user.id]
  );

  await incrementAiUsage(req.user.id);
  const todayUsage = await getTodayAiRequests(req.user.id);

  res.json({
    success: true,
    source: advice.source,
    costing: {
      ingredientCost: costData.ingredientCost,
      operationalAllocation: costData.operationalAllocation,
      salaryAllocation: costData.salaryAllocation,
      finalDishCost: costData.finalDishCost
    },
    recommendation: advice.recommendation,
    improvements: advice.improvements,
    warnings: advice.warnings,
    usage: {
      aiRequestsToday: todayUsage,
      aiQuotaPerDay: req.subscription.plan.aiRequestsPerDay
    }
  });
}

export async function listMyAiUsageLogs(req, res) {
  const result = await query(
    `SELECT id, request_count, log_date, created_at
     FROM ai_usage_logs
     WHERE user_id = $1
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user.id]
  );

  res.json({ success: true, logs: result.rows });
}
