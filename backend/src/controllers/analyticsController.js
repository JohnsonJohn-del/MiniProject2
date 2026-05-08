import { query } from "../config/db.js";
import { getPlanConfig } from "../services/subscriptionService.js";

function buildAiReportSummary({ topIngredient, lowMarginDish }) {
  if (!topIngredient && !lowMarginDish) {
    return "Data is still sparse. Add more recipes and menu prices for stronger insight quality.";
  }

  if (topIngredient && lowMarginDish) {
    return `${topIngredient.ingredient_name} has the highest ingredient cost impact, and ${lowMarginDish.recipe_name} shows the weakest margin. Review pricing and procurement immediately.`;
  }

  if (topIngredient) {
    return `${topIngredient.ingredient_name} currently drives the largest cost impact across your recipes. Consider alternate vendors or portion optimization.`;
  }

  return `${lowMarginDish.recipe_name} has the lowest profit margin. Recalculate selling price using the advisor to avoid margin leakage.`;
}

export async function getClientAnalytics(req, res) {
  const recipeStatsResult = await query(
    `SELECT COUNT(*)::int AS total_recipes,
            COALESCE(AVG(total_cost), 0)::numeric(12,2) AS avg_recipe_cost
     FROM recipes
     WHERE user_id = $1`,
    [req.user.id]
  );

  const topMarginsResult = await query(
    `SELECT m.id, r.recipe_name, m.selling_price, m.profit_margin
     FROM menu_items m
     JOIN recipes r ON r.id = m.recipe_id
     WHERE m.user_id = $1
     ORDER BY m.profit_margin DESC
     LIMIT 5`,
    [req.user.id]
  );

  const lowMarginsResult = await query(
    `SELECT m.id, r.recipe_name, m.selling_price, m.profit_margin
     FROM menu_items m
     JOIN recipes r ON r.id = m.recipe_id
     WHERE m.user_id = $1
     ORDER BY m.profit_margin ASC
     LIMIT 5`,
    [req.user.id]
  );

  const ingredientImpactResult = await query(
    `SELECT i.ingredient_name,
            SUM(ri.quantity * i.price_per_unit)::numeric(12,2) AS cost_impact
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     JOIN recipes r ON r.id = ri.recipe_id
     WHERE r.user_id = $1
     GROUP BY i.ingredient_name
     ORDER BY cost_impact DESC
     LIMIT 8`,
    [req.user.id]
  );

  const marginSummaryResult = await query(
    `SELECT COALESCE(AVG(profit_margin), 0)::numeric(7,2) AS avg_margin,
            COUNT(*)::int AS menu_items
     FROM menu_items
     WHERE user_id = $1`,
    [req.user.id]
  );

  const planResult = await query("SELECT subscription_plan FROM users WHERE id = $1", [req.user.id]);
  const plan = getPlanConfig(planResult.rows[0]?.subscription_plan || "free");

  const limitedData = {
    overview: {
      totalRecipes: recipeStatsResult.rows[0].total_recipes,
      avgRecipeCost: Number(recipeStatsResult.rows[0].avg_recipe_cost),
      avgMargin: Number(marginSummaryResult.rows[0].avg_margin),
      menuItems: marginSummaryResult.rows[0].menu_items
    },
    mostProfitable: topMarginsResult.rows.slice(0, 3),
    leastProfitable: lowMarginsResult.rows.slice(0, 3)
  };

  if (!plan.features.fullAnalytics) {
    return res.json({
      success: true,
      tier: "limited",
      ...limitedData,
      aiReportSummary: "Upgrade to Premium for full cost impact analytics and AI reports."
    });
  }

  const aiReportSummary = buildAiReportSummary({
    topIngredient: ingredientImpactResult.rows[0],
    lowMarginDish: lowMarginsResult.rows[0]
  });

  res.json({
    success: true,
    tier: "full",
    ...limitedData,
    ingredientCostImpact: ingredientImpactResult.rows,
    aiReportSummary
  });
}
