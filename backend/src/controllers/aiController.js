import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";
import { calculateRecipeCost } from "../services/costingService.js";
import { generatePricingAdvice } from "../services/aiPricingService.js";
import { getTodayAiRequests, incrementAiUsage, getPlanConfig } from "../services/subscriptionService.js";
import { env } from "../config/env.js";

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
      aiQuotaPerDay: getPlanConfig().aiRequestsPerDay
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

function getHeuristicUnitRecommendation(ingredientName) {
  const name = (ingredientName || "").toLowerCase().trim();
  if (!name) return null;

  const liquidKeywords = [
    "water", "milk", "oil", "vinegar", "sauce", "syrup", "cream", "juice",
    "wine", "beer", "honey", "liquid", "puree", "paste", "dressing",
    "extract", "broth", "stock", "ghee", "soda", "coke", "pepsi", "sprite",
    "beverage", "drink", "yogurt", "curd", "buttermilk"
  ];
  
  const solidKeywords = [
    "flour", "maida", "atta", "rice", "sugar", "salt", "butter", "paneer",
    "cheese", "chicken", "mutton", "fish", "meat", "beef", "pork", "onion",
    "tomato", "potato", "garlic", "ginger", "masala", "spices", "powder",
    "yeast", "chocolate", "cocoa", "nuts", "almond", "cashew", "raisin",
    "baking", "chili", "pepper", "cardamom", "clove", "cinnamon", "turmeric",
    "coriander", "cumin", "mustard", "grain", "lentil", "dal", "paneer",
    "vegetable", "fruit", "herb", "leaf", "leaves", "carrot", "cabbage",
    "cauliflower", "spinach", "broccoli", "mushroom"
  ];

  for (const keyword of liquidKeywords) {
    if (name.includes(keyword)) {
      return { unit_type: "liquid", suggested_unit: "l" };
    }
  }

  for (const keyword of solidKeywords) {
    if (name.includes(keyword)) {
      return { unit_type: "weight", suggested_unit: "kg" };
    }
  }

  return null;
}

async function callOpenAiRecommendUnit(ingredientName) {
  if (!env.openAiApiKey) {
    return { unit_type: "weight", suggested_unit: "kg" };
  }

  const prompt = `
Determine if the following ingredient is primarily a liquid (measured by volume) or a solid/semi-solid (measured by weight) in a standard professional kitchen recipe context.

Ingredient: ${ingredientName}

Return strict JSON only with keys:
- unit_type: either "weight" or "volume"
- suggested_unit: either "kg" (for weight) or "l" (for volume)
`;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${env.openAiApiKey}`
      },
      body: JSON.stringify({
        model: env.openAiModel,
        temperature: 0.1,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "You classify kitchen ingredients into weight (kg) or volume (l) and respond in strict JSON."
          },
          { role: "user", content: prompt }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI request failed: ${response.status}`);
    }

    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    const unit_type = parsed.unit_type === "volume" || parsed.unit_type === "liquid" ? "liquid" : "weight";
    const suggested_unit = unit_type === "liquid" ? "l" : "kg";

    return { unit_type, suggested_unit };
  } catch (err) {
    console.error("OpenAI unit advisor failure:", err);
    return { unit_type: "weight", suggested_unit: "kg" };
  }
}

const recommendUnitSchema = z.object({
  ingredient_name: z.string().min(1)
});

export async function recommendUnit(req, res) {
  const parsed = recommendUnitSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid payload. ingredient_name is required.", 400);

  const { ingredient_name } = parsed.data;

  // 1. Check local heuristics
  let recommendation = getHeuristicUnitRecommendation(ingredient_name);
  let source = "heuristic";

  // 2. Fall back to OpenAI
  if (!recommendation) {
    recommendation = await callOpenAiRecommendUnit(ingredient_name);
    source = "openai";
  }

  res.json({
    success: true,
    source,
    unit_type: recommendation.unit_type,
    suggested_unit: recommendation.suggested_unit
  });
}
