import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
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

  let updateQuery = supabaseAdmin
    .from("menu_items")
    .update({ ai_suggested_price: advice.recommendation.idealSellingPrice, updated_at: new Date().toISOString() })
    .eq("recipe_id", recipe_id);
    
  if (req.user.role !== "admin") {
    updateQuery = updateQuery.eq("user_id", req.user.id);
  }
  
  await updateQuery;

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
  const { data: logs, error } = await supabaseAdmin
    .from("ai_usage_logs")
    .select("id, request_count, log_date, created_at")
    .eq("user_id", req.user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw new AppError("Failed to fetch logs", 500);

  res.json({ success: true, logs });
}
