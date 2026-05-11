import { supabaseAdmin } from "../config/supabaseAdmin.js";
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
  // Fetch recipes
  const { data: recipes } = await supabaseAdmin
    .from("recipes")
    .select("id, recipe_name, total_cost")
    .eq("user_id", req.user.id);

  // Fetch menu items
  const { data: menuItems } = await supabaseAdmin
    .from("menu_items")
    .select("id, recipe_id, selling_price, profit_margin")
    .eq("user_id", req.user.id);

  // Calculate recipe stats
  let total_cost_sum = 0;
  (recipes || []).forEach(r => total_cost_sum += Number(r.total_cost || 0));
  const avg_recipe_cost = recipes?.length ? (total_cost_sum / recipes.length) : 0;

  // Merge menu items with recipes
  const mappedMenuItems = (menuItems || []).map(m => {
    const r = recipes?.find(rec => rec.id === m.recipe_id);
    return {
      id: m.id,
      recipe_name: r ? r.recipe_name : "Unknown",
      selling_price: m.selling_price,
      profit_margin: Number(m.profit_margin || 0)
    };
  });

  const topMargins = [...mappedMenuItems].sort((a, b) => b.profit_margin - a.profit_margin).slice(0, 5);
  const lowMargins = [...mappedMenuItems].sort((a, b) => a.profit_margin - b.profit_margin).slice(0, 5);

  let margin_sum = 0;
  mappedMenuItems.forEach(m => margin_sum += m.profit_margin);
  const avg_margin = mappedMenuItems.length ? (margin_sum / mappedMenuItems.length) : 0;

  // Fetch ingredient impact using recipes and recipe_ingredients
  const { data: recipeIdsData } = await supabaseAdmin
    .from("recipes")
    .select("id")
    .eq("user_id", req.user.id);
    
  const recipeIds = recipeIdsData?.map(r => r.id) || [];
  
  let ingredientImpact = [];
  if (recipeIds.length > 0) {
    const { data: riData } = await supabaseAdmin
      .from("recipe_ingredients")
      .select("quantity, ingredients(id, ingredient_name, price_per_unit)")
      .in("recipe_id", recipeIds);

    const impactMap = {};
    (riData || []).forEach(ri => {
      const ing = ri.ingredients;
      if (!ing) return;
      const cost = Number(ri.quantity) * Number(ing.price_per_unit);
      if (!impactMap[ing.ingredient_name]) impactMap[ing.ingredient_name] = 0;
      impactMap[ing.ingredient_name] += cost;
    });

    ingredientImpact = Object.entries(impactMap)
      .map(([name, cost]) => ({ ingredient_name: name, cost_impact: Number(cost.toFixed(2)) }))
      .sort((a, b) => b.cost_impact - a.cost_impact)
      .slice(0, 8);
  }

  const plan = getPlanConfig(req.user.subscription_plan || "free");

  const limitedData = {
    overview: {
      totalRecipes: recipes?.length || 0,
      avgRecipeCost: Number(avg_recipe_cost.toFixed(2)),
      avgMargin: Number(avg_margin.toFixed(2)),
      menuItems: mappedMenuItems.length
    },
    mostProfitable: topMargins.slice(0, 3),
    leastProfitable: lowMargins.slice(0, 3)
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
    topIngredient: ingredientImpact[0],
    lowMarginDish: lowMargins[0]
  });

  res.json({
    success: true,
    tier: "full",
    ...limitedData,
    ingredientCostImpact: ingredientImpact,
    aiReportSummary
  });
}
