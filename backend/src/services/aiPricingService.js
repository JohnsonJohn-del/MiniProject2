import { env } from "../config/env.js";

function round2(value) {
  return Number(value.toFixed(2));
}

function buildMockAdvice({ recipeName, finalDishCost, currentPrice }) {
  const safeCurrentPrice = Number(currentPrice || 0);
  const targetMargin = 0.65;
  const idealPrice = round2(finalDishCost / (1 - targetMargin));
  const currentMargin = safeCurrentPrice > 0 ? ((safeCurrentPrice - finalDishCost) / safeCurrentPrice) * 100 : 0;

  const warnings = [];
  if (currentMargin < 20) warnings.push("Low margin risk. Current price may not sustain overhead volatility.");
  if (safeCurrentPrice && safeCurrentPrice < finalDishCost)
    warnings.push("Selling below calculated dish cost. Immediate correction recommended.");

  return {
    source: "mock",
    recommendation: {
      recipeName,
      idealSellingPrice: idealPrice,
      suggestedRange: {
        min: round2(idealPrice * 0.95),
        max: round2(idealPrice * 1.1)
      },
      currentMargin: round2(currentMargin)
    },
    improvements: [
      "Bundle with high-margin side items to increase blended margin.",
      "Re-negotiate high-cost ingredient vendors to reduce raw material volatility.",
      "Track monthly utility drift and re-run pricing monthly for stability."
    ],
    warnings
  };
}

async function callOpenAiPricing({ recipeName, finalDishCost, currentPrice }) {
  const prompt = `
You are an expert restaurant pricing analyst.
Return strict JSON only with keys: idealSellingPrice, rangeMin, rangeMax, currentMargin, warnings (array), improvements (array).
Recipe: ${recipeName}
FinalDishCost: ${finalDishCost}
CurrentPrice: ${currentPrice || 0}
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
          content: "You provide conservative, profitability-focused restaurant pricing output in strict JSON."
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

  return {
    source: "openai",
    recommendation: {
      recipeName,
      idealSellingPrice: round2(Number(parsed.idealSellingPrice || finalDishCost)),
      suggestedRange: {
        min: round2(Number(parsed.rangeMin || finalDishCost)),
        max: round2(Number(parsed.rangeMax || finalDishCost * 1.2))
      },
      currentMargin: round2(Number(parsed.currentMargin || 0))
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
