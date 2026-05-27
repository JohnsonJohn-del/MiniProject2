import { env } from "../config/env.js";

function buildMockBillParse(ocrText) {
  const lines = ocrText.split("\n").filter(Boolean);
  const firstLine = lines[0] || "Unknown Vendor";
  const items = [];
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(/\s+/);
    const price = parseFloat(parts[parts.length - 1]);
    const qty = parseFloat(parts[parts.length - 2]);
    if (!isNaN(price) && price > 0) {
      items.push({
        ingredient_name: parts.slice(0, parts.length - 2).join(" ") || `Item ${i}`,
        quantity: isNaN(qty) ? 1 : qty,
        unit: "kg",
        price
      });
    }
  }
  return {
    source: "mock",
    vendor_name: firstLine,
    items: items.length > 0 ? items : [
      { ingredient_name: "Sample Ingredient", quantity: 1, unit: "kg", price: 100 }
    ]
  };
}

function buildMockRecipeParse(text) {
  const lines = text.split("\n").filter(Boolean);
  const title = lines[0] || "Imported Recipe";
  const ingredients = [];
  for (let i = 1; i < lines.length; i++) {
    const match = lines[i].match(/([\d.]+)\s*(kg|g|ltr|ml|pcs|tsp|tbsp|cups?|pieces?)\s+(.+)/i);
    if (match) {
      ingredients.push({
        ingredient_name: match[3].trim(),
        quantity: parseFloat(match[1]),
        unit: match[2].toLowerCase()
      });
    }
  }
  return {
    source: "mock",
    recipe_name: title,
    ingredients: ingredients.length > 0 ? ingredients : [
      { ingredient_name: "Sample Ingredient", quantity: 1, unit: "kg" }
    ]
  };
}

async function callOpenAIParse(prompt, systemPrompt) {
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
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`);
  }

  const payload = await response.json();
  const content = payload.choices?.[0]?.message?.content;
  return JSON.parse(content);
}

export async function parseBillWithAI(ocrText) {
  if (!env.openAiApiKey) {
    return buildMockBillParse(ocrText);
  }

  try {
    const result = await callOpenAIParse(
      `Extract vendor name and line items from this OCR text:\n\n${ocrText}`,
      `You extract structured bill data from OCR text. Return JSON with keys: vendor_name (string), items (array of {ingredient_name, quantity, unit, price}). All prices in the local currency. IMPORTANT: Handle Indian numbering formats carefully (e.g. 1,00,000.00). Remove commas before returning numeric values. If an OCR scan has misplaced commas or missing decimals (e.g. 99600 for 996.00), use your judgment based on realistic Indian grocery/hospitality ingredient pricing to correct it. Ensure quantity is numeric.`
    );
    return { source: "openai", ...result };
  } catch {
    return buildMockBillParse(ocrText);
  }
}

export async function parseRecipeWithAI(text) {
  if (!env.openAiApiKey) {
    return buildMockRecipeParse(text);
  }

  try {
    const result = await callOpenAIParse(
      `Parse this recipe text into structured data:\n\n${text}`,
      `You extract structured recipe data from text. Return JSON with keys: recipe_name (string), ingredients (array of {ingredient_name, quantity, unit}).`
    );
    return { source: "openai", ...result };
  } catch {
    return buildMockRecipeParse(text);
  }
}
