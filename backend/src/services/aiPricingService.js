import { env } from "../config/env.js";

function round2(value) {
  return Number(value.toFixed(2));
}

function applyPsychologicalPricing(price) {
  const rounded = Math.round(price);
  if (rounded < 100) return Math.floor(rounded / 10) * 10 + 9;
  return Math.floor(rounded / 10) * 10 + 9; // e.g. 249, 299
}

function buildMockAdvice({ recipeName, finalDishCost, currentPrice }) {
  const safeCurrentPrice = Number(currentPrice || 0);
  
  // Target Food Cost ~ 32%
  const targetFoodCostPct = 0.32;
  const rawIdealPrice = finalDishCost / targetFoodCostPct;
  const idealPrice = applyPsychologicalPricing(rawIdealPrice);
  const aggregatorPrice = applyPsychologicalPricing(idealPrice * 1.20); // 20% higher for Zomato/Swiggy
  
  const currentMargin = safeCurrentPrice > 0 ? ((safeCurrentPrice - finalDishCost) / safeCurrentPrice) * 100 : 0;
  const idealMargin = ((idealPrice - finalDishCost) / idealPrice) * 100;

  const warnings = [];
  if (safeCurrentPrice > 0 && currentMargin < 20) warnings.push("Low margin risk. Current price is unviable for cloud kitchen ops.");
  if (safeCurrentPrice && safeCurrentPrice < finalDishCost)
    warnings.push("Selling below calculated dish cost. Immediate correction recommended.");

  return {
    source: "mock",
    recommendation: {
      recipeName,
      idealSellingPrice: idealPrice,
      aggregatorPrice: aggregatorPrice,
      suggestedRange: {
        min: applyPsychologicalPricing(rawIdealPrice * 0.9),
        max: applyPsychologicalPricing(rawIdealPrice * 1.15)
      },
      targetFoodCostPct: targetFoodCostPct * 100,
      currentMargin: round2(currentMargin),
      expectedMargin: round2(idealMargin),
      marketPosition: idealPrice < 150 ? "Budget" : idealPrice > 400 ? "Premium" : "Competitive"
    },
    improvements: [
      `Increase price to ₹${idealPrice} for dine-in to hit ${Math.round(idealMargin)}% margin target.`,
      `List at ₹${aggregatorPrice} on Swiggy/Zomato to absorb commission hits.`,
      "Bundle with high-margin side items to increase blended margin."
    ],
    warnings
  };
}

async function callOpenAiPricing({ recipeName, finalDishCost, currentPrice }) {
  const prompt = `
You are an expert restaurant pricing analyst for the Indian market.
Given:
Recipe: ${recipeName}
Final Per Serving Cost: ₹${finalDishCost}
Current Price: ₹${currentPrice || 0}

Rules:
1. Target Food Cost is generally 25-35%. Calculate ideal selling price using: Price = Cost / TargetFoodCost%.
2. Apply psychological pricing (e.g., ends in 49, 99 - like ₹249, ₹299).
3. Generate a Zomato/Swiggy aggregator price (usually 15-25% higher than dine-in).
4. Provide practical, realistic advice for the Indian market. Do not give impossible luxury prices for basic items.

Return strict JSON only with keys: 
idealSellingPrice (number), aggregatorPrice (number), rangeMin (number), rangeMax (number), currentMargin (number), expectedMargin (number), targetFoodCostPct (number), marketPosition (string), warnings (array), improvements (array).
`;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.openAiApiKey}`
    },
    body: JSON.stringify({
      model: env.openAiModel,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You provide practical, Indian-market viable, profitability-focused restaurant pricing output in strict JSON."
        },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  const parsed = JSON.parse(content);

  const idealPrice = applyPsychologicalPricing(Number(parsed.idealSellingPrice || finalDishCost * 3));

  return {
    source: "openai",
    recommendation: {
      recipeName,
      idealSellingPrice: idealPrice,
      aggregatorPrice: applyPsychologicalPricing(Number(parsed.aggregatorPrice || idealPrice * 1.2)),
      suggestedRange: {
        min: applyPsychologicalPricing(Number(parsed.rangeMin || idealPrice * 0.9)),
        max: applyPsychologicalPricing(Number(parsed.rangeMax || idealPrice * 1.15))
      },
      targetFoodCostPct: Number(parsed.targetFoodCostPct || 30),
      currentMargin: round2(Number(parsed.currentMargin || 0)),
      expectedMargin: round2(Number(parsed.expectedMargin || 65)),
      marketPosition: parsed.marketPosition || "Competitive"
    },
    improvements: Array.isArray(parsed.improvements) ? parsed.improvements : [],
    warnings: Array.isArray(parsed.warnings) ? parsed.warnings : []
  };
}

export async function generatePricingAdvice({ recipeName, finalDishCost, currentPrice }) {
  if (!env.openAiApiKey) {
    return buildMockAdvice({ recipeName, finalDishCost, currentPrice });
  }

  try {
    return await callOpenAiPricing({ recipeName, finalDishCost, currentPrice });
  } catch {
    return buildMockAdvice({ recipeName, finalDishCost, currentPrice });
  }
}
