import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { calculateRecipeCost } from "../services/costingService.js";

const r2 = (num) => Math.round((num || 0) * 100) / 100;

export const getEngineeringData = async (req, res) => {
  try {
    const { id: userId } = req.user;

    const { data: menuItems, error: menuErr } = await supabaseAdmin
      .from("menu_items")
      .select(`
        id, selling_price, ai_suggested_price, profit_margin, recipe_id,
        recipes (
          id, recipe_name, total_cost,
          recipe_ingredients (
            quantity, ingredient_id,
            ingredients ( price_per_unit, unit )
          )
        )
      `)
      .eq("user_id", userId);

    if (menuErr) throw menuErr;

    const engineeringData = [];
    let totalMargin = 0;
    let totalPopularity = 0;
    let validItemsCount = 0;

    for (const item of menuItems) {
      if (!item.recipes) continue;

      const costBreakdown = await calculateRecipeCost({ 
        recipeId: item.recipe_id, 
        user: req.user 
      });

      const trueCost = costBreakdown.finalDishCost;
      const ingredientCost = costBreakdown.ingredientCost;
      const packagingCost = costBreakdown.packagingCost;
      const operationalAlloc = costBreakdown.operationalAllocation;
      const salaryAlloc = costBreakdown.salaryAllocation;

      const dineInPrice = Number(item.selling_price) || trueCost * 3;
      const takeawayPrice = dineInPrice + packagingCost;
      const targetNetProfit = dineInPrice - trueCost;
      const swiggyPrice = Math.ceil(dineInPrice / 0.75);
      const zomatoPrice = Math.ceil(dineInPrice / 0.72);

      const marginPct = ((dineInPrice - trueCost) / dineInPrice) * 100;
      const foodCostPct = (ingredientCost / dineInPrice) * 100;

      const popularity = item.popularity_score || Math.floor(Math.random() * 100);

      const dishData = {
        id: item.id,
        name: item.recipes.recipe_name,
        category: "General",
        popularity: popularity,
        costs: {
          ingredient: r2(ingredientCost),
          packaging: r2(packagingCost),
          operational: r2(operationalAlloc),
          salary: r2(salaryAlloc),
          gas: r2(operationalAlloc * 0.4),
          electricity: r2(operationalAlloc * 0.5),
          water: r2(operationalAlloc * 0.1),
          totalTrueCost: r2(trueCost)
        },
        pricing: {
          dineIn: r2(dineInPrice),
          takeaway: r2(takeawayPrice),
          swiggy: r2(swiggyPrice),
          zomato: r2(zomatoPrice)
        },
        metrics: {
          marginPct: r2(marginPct),
          foodCostPct: r2(foodCostPct),
          netProfit: r2(targetNetProfit)
        }
      };

      totalMargin += marginPct;
      totalPopularity += popularity;
      validItemsCount++;
      engineeringData.push(dishData);
    }

    const avgMargin = validItemsCount > 0 ? totalMargin / validItemsCount : 0;
    const avgPopularity = validItemsCount > 0 ? totalPopularity / validItemsCount : 0;

    engineeringData.forEach(dish => {
      const isHighMargin = dish.metrics.marginPct >= avgMargin;
      const isHighPop = dish.popularity >= avgPopularity;

      if (isHighMargin && isHighPop) dish.matrixClass = "Star";
      else if (!isHighMargin && isHighPop) dish.matrixClass = "Plow Horse";
      else if (isHighMargin && !isHighPop) dish.matrixClass = "Puzzle";
      else dish.matrixClass = "Dog";
      
      if (dish.metrics.marginPct >= 65) dish.profitBadge = "Excellent";
      else if (dish.metrics.marginPct >= 50) dish.profitBadge = "Good";
      else if (dish.metrics.marginPct >= 35) dish.profitBadge = "Moderate";
      else dish.profitBadge = "Poor";
    });

    const insights = [];
    const stars = engineeringData.filter(d => d.matrixClass === "Star");
    const dogs = engineeringData.filter(d => d.matrixClass === "Dog");
    const plowHorses = engineeringData.filter(d => d.matrixClass === "Plow Horse");
    const puzzles = engineeringData.filter(d => d.matrixClass === "Puzzle");

    if (stars.length > 0) {
      insights.push({
        type: "positive",
        message: `${stars[0].name} is a Star! It has a strong ${stars[0].metrics.marginPct.toFixed(1)}% margin. Promote this heavily.`
      });
    }
    if (plowHorses.length > 0) {
      insights.push({
        type: "warning",
        message: `${plowHorses[0].name} is popular but has a lower margin. Consider a ₹10-₹15 price increase to improve profitability.`
      });
    }
    if (puzzles.length > 0) {
      insights.push({
        type: "info",
        message: `${puzzles[0].name} has great margins but low sales. Try bundling it or featuring it as a Chef's Special.`
      });
    }
    if (dogs.length > 0) {
      insights.push({
        type: "negative",
        message: `${dogs[0].name} is underperforming in both sales and margin. Consider reworking the recipe or removing it from the menu.`
      });
    }

    const avgFoodCost = validItemsCount > 0 ? engineeringData.reduce((acc, curr) => acc + curr.metrics.foodCostPct, 0) / validItemsCount : 0;
    if (avgFoodCost > 35) {
      insights.push({
        type: "negative",
        message: `Overall Food Cost is at ${r2(avgFoodCost)}%, which exceeds the ideal 30-32% range. Audit portion sizes and ingredient waste.`
      });
    } else {
      insights.push({
        type: "positive",
        message: `Overall Food Cost is well-managed at ${r2(avgFoodCost)}%.`
      });
    }

    res.json({
      success: true,
      data: engineeringData,
      insights,
      summary: {
        totalDishes: validItemsCount,
        avgMargin: r2(avgMargin),
        avgFoodCost: r2(avgFoodCost),
        starsCount: stars.length,
        plowHorsesCount: plowHorses.length,
        puzzlesCount: puzzles.length,
        dogsCount: dogs.length
      }
    });

  } catch (error) {
    console.error("Engineering data error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
