import { query } from "../config/db.js";
import { calculateRecipeCost } from "../services/costingService.js";

export async function getRecipeCostBreakdown(req, res) {
  const { recipeId } = req.params;
  const { month } = req.query;

  const costData = await calculateRecipeCost({
    recipeId,
    user: req.user,
    month
  });

  await query("UPDATE recipes SET total_cost = $1, updated_at = now() WHERE id = $2", [
    costData.finalDishCost.toFixed(2),
    recipeId
  ]);

  res.json({
    success: true,
    ...costData
  });
}
