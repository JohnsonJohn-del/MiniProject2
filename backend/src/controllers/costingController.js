import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { calculateRecipeCost } from "../services/costingService.js";

export async function getRecipeCostBreakdown(req, res) {
  const { recipeId } = req.params;
  const { month } = req.query;

  const costData = await calculateRecipeCost({
    recipeId,
    user: req.user,
    month
  });

  await supabaseAdmin
    .from("recipes")
    .update({ total_cost: costData.ingredientCost.toFixed(2), updated_at: new Date().toISOString() })
    .eq("id", recipeId);

  res.json({
    success: true,
    ...costData
  });
}
