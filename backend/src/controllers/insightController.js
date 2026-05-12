import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";

/**
 * GET /api/import/price-history?ingredient_id=xxx
 * Returns price trend for a specific ingredient
 */
export async function getPriceHistory(req, res) {
  const targetUserId = getTargetUserId(req);
  const { ingredient_id, ingredient_name } = req.query;

  let query = supabaseAdmin
    .from("ingredient_price_history")
    .select("id, ingredient_name, price_per_unit, recorded_at, source, vendors(vendor_name)")
    .eq("user_id", targetUserId)
    .order("recorded_at", { ascending: true })
    .limit(60);

  if (ingredient_id) query = query.eq("ingredient_id", ingredient_id);
  else if (ingredient_name) query = query.ilike("ingredient_name", `%${ingredient_name}%`);

  const { data, error } = await query;
  if (error) throw new AppError("Failed to fetch price history", 500);

  const history = (data || []).map(h => ({
    id: h.id,
    ingredient_name: h.ingredient_name,
    price_per_unit: h.price_per_unit,
    recorded_at: h.recorded_at,
    source: h.source,
    vendor_name: h.vendors?.vendor_name || null
  }));

  res.json({ success: true, history });
}

/**
 * GET /api/import/price-trends
 * Returns aggregate price trends per ingredient (min/max/avg/latest/change%)
 */
export async function getPriceTrends(req, res) {
  const targetUserId = getTargetUserId(req);

  const { data: purchases, error } = await supabaseAdmin
    .from("ingredient_purchases")
    .select("ingredient_name, price, purchase_date, vendors(vendor_name)")
    .eq("user_id", targetUserId)
    .order("purchase_date", { ascending: true });

  if (error) throw new AppError("Failed to fetch price trends", 500);

  // Group by ingredient name
  const grouped = {};
  for (const p of purchases || []) {
    const name = p.ingredient_name;
    if (!grouped[name]) grouped[name] = [];
    grouped[name].push({
      price: Number(p.price),
      date: p.purchase_date,
      vendor: p.vendors?.vendor_name || null
    });
  }

  const trends = Object.entries(grouped).map(([name, records]) => {
    const prices = records.map(r => r.price);
    const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));
    const oldest = sorted[0];
    const latest = sorted[sorted.length - 1];
    const priceChange = oldest.price > 0
      ? (((latest.price - oldest.price) / oldest.price) * 100).toFixed(1)
      : "0.0";

    return {
      ingredient_name: name,
      min_price: Math.min(...prices),
      max_price: Math.max(...prices),
      avg_price: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(4),
      latest_price: latest.price,
      latest_date: latest.date,
      price_change_pct: parseFloat(priceChange),
      data_points: records.length,
      trend: parseFloat(priceChange) > 5 ? "rising" :
             parseFloat(priceChange) < -5 ? "falling" : "stable"
    };
  });

  res.json({ success: true, trends });
}

/**
 * GET /api/import/ai-insights
 * Returns deterministic business insights + optional AI summarization
 */
export async function getAiInsights(req, res) {
  const targetUserId = getTargetUserId(req);

  // Fetch all relevant data in parallel
  const [purchasesRes, opexRes, menuRes, recipesRes] = await Promise.all([
    supabaseAdmin
      .from("ingredient_purchases")
      .select("ingredient_name, price, quantity, purchase_date, vendors(vendor_name)")
      .eq("user_id", targetUserId)
      .order("purchase_date", { ascending: false })
      .limit(100),
    supabaseAdmin
      .from("operational_expenses")
      .select("month, electricity_bill, gas_bill, salary_cost")
      .eq("user_id", targetUserId)
      .order("month", { ascending: false })
      .limit(6),
    supabaseAdmin
      .from("menu_items")
      .select("selling_price, profit_margin, recipes(recipe_name, total_cost)")
      .eq("user_id", targetUserId),
    supabaseAdmin
      .from("recipes")
      .select("recipe_name, total_cost")
      .eq("user_id", targetUserId)
  ]);

  const purchases = purchasesRes.data || [];
  const opex = opexRes.data || [];
  const menuItems = menuRes.data || [];

  // === DETERMINISTIC ANALYSIS ENGINE ===

  // 1. Margin Analysis
  const margins = menuItems.map(m => ({
    recipe: m.recipes?.recipe_name || "Unknown",
    selling_price: Number(m.selling_price || 0),
    cost: Number(m.recipes?.total_cost || 0),
    margin: Number(m.profit_margin || 0)
  }));
  const avgMargin = margins.length
    ? (margins.reduce((sum, m) => sum + m.margin, 0) / margins.length).toFixed(1)
    : 0;
  const lowestMarginItem = margins.sort((a, b) => a.margin - b.margin)[0] || null;
  const highestMarginItem = [...margins].sort((a, b) => b.margin - a.margin)[0] || null;

  // 2. Price Trend Analysis (ingredient purchases)
  const ingredientGroups = {};
  for (const p of purchases) {
    const name = p.ingredient_name;
    if (!ingredientGroups[name]) ingredientGroups[name] = [];
    ingredientGroups[name].push({ price: Number(p.price), date: p.purchase_date });
  }

  const priceTrends = [];
  for (const [name, records] of Object.entries(ingredientGroups)) {
    if (records.length < 2) continue;
    const sorted = records.sort((a, b) => a.date.localeCompare(b.date));
    const first = sorted[0].price;
    const last = sorted[sorted.length - 1].price;
    const changePct = first > 0 ? (((last - first) / first) * 100).toFixed(1) : 0;
    if (Math.abs(parseFloat(changePct)) > 5) {
      priceTrends.push({
        ingredient: name,
        change_pct: parseFloat(changePct),
        from_price: first,
        to_price: last,
        direction: parseFloat(changePct) > 0 ? "up" : "down"
      });
    }
  }
  priceTrends.sort((a, b) => Math.abs(b.change_pct) - Math.abs(a.change_pct));

  // 3. Operational Cost Trend
  const opexTrend = opex.slice(0, 2).map(o => ({
    month: o.month,
    total: Number(o.electricity_bill || 0) + Number(o.gas_bill || 0) + Number(o.salary_cost || 0)
  }));
  const opexChange = opexTrend.length >= 2
    ? (((opexTrend[0].total - opexTrend[1].total) / opexTrend[1].total) * 100).toFixed(1)
    : null;

  // 4. Vendor Analysis
  const vendorSpend = {};
  for (const p of purchases) {
    const vendor = p.vendors?.vendor_name || "Unknown";
    vendorSpend[vendor] = (vendorSpend[vendor] || 0) + Number(p.price || 0);
  }
  const topVendor = Object.entries(vendorSpend)
    .sort((a, b) => b[1] - a[1])[0] || null;

  // 5. Build insight cards
  const insights = [];

  if (lowestMarginItem && lowestMarginItem.margin < 40) {
    insights.push({
      type: "warning",
      title: "Low Margin Alert",
      message: `${lowestMarginItem.recipe} has only ${lowestMarginItem.margin.toFixed(1)}% margin. Consider raising the price or reducing ingredient cost.`,
      metric: `${lowestMarginItem.margin.toFixed(1)}%`,
      action: "Review pricing"
    });
  }

  if (priceTrends.length > 0) {
    const rising = priceTrends.filter(t => t.direction === "up").slice(0, 2);
    for (const t of rising) {
      insights.push({
        type: "info",
        title: "Ingredient Price Rising",
        message: `${t.ingredient} has increased by ${t.change_pct}% (from £${t.from_price.toFixed(2)} to £${t.to_price.toFixed(2)}). Review recipes using this ingredient.`,
        metric: `+${t.change_pct}%`,
        action: "Update recipes"
      });
    }
  }

  if (opexChange !== null && parseFloat(opexChange) > 5) {
    insights.push({
      type: "warning",
      title: "Operational Cost Spike",
      message: `Monthly operational costs increased by ${opexChange}% vs last month (£${opexTrend[1].total.toFixed(0)} → £${opexTrend[0].total.toFixed(0)}).`,
      metric: `+${opexChange}%`,
      action: "Audit utilities"
    });
  }

  if (highestMarginItem && highestMarginItem.margin > 60) {
    insights.push({
      type: "success",
      title: "High-Margin Star",
      message: `${highestMarginItem.recipe} delivers ${highestMarginItem.margin.toFixed(1)}% margin — your most profitable dish. Consider promoting it.`,
      metric: `${highestMarginItem.margin.toFixed(1)}%`,
      action: "Promote dish"
    });
  }

  if (topVendor) {
    insights.push({
      type: "info",
      title: "Top Vendor by Spend",
      message: `${topVendor[0]} accounts for your highest ingredient spend at £${topVendor[1].toFixed(2)}. Consider negotiating bulk discounts.`,
      metric: `£${topVendor[1].toFixed(2)}`,
      action: "Negotiate terms"
    });
  }

  if (parseFloat(avgMargin) > 0 && parseFloat(avgMargin) < 35) {
    insights.push({
      type: "warning",
      title: "Portfolio Margin Below Target",
      message: `Average menu margin is ${avgMargin}%, below the recommended 35–50% range. Review your overall pricing strategy.`,
      metric: `${avgMargin}%`,
      action: "Revise pricing"
    });
  }

  res.json({
    success: true,
    summary: {
      avg_margin: parseFloat(avgMargin),
      total_menu_items: menuItems.length,
      ingredients_tracked: Object.keys(ingredientGroups).length,
      opex_change_pct: opexChange ? parseFloat(opexChange) : null,
      top_vendor: topVendor ? topVendor[0] : null
    },
    insights,
    price_trends: priceTrends.slice(0, 5),
    margin_breakdown: margins
  });
}

/**
 * POST /api/import/record-price
 * Manually record a price update for an ingredient (and store in history)
 */
export async function recordIngredientPrice(req, res) {
  const targetUserId = getTargetUserId(req);
  const { ingredient_id, price_per_unit, vendor_id } = req.body;

  if (!ingredient_id || !price_per_unit) {
    throw new AppError("ingredient_id and price_per_unit are required", 400);
  }

  // Update the ingredient's current price
  const { data: ingredient, error: ingErr } = await supabaseAdmin
    .from("ingredients")
    .update({ price_per_unit: Number(price_per_unit) })
    .eq("id", ingredient_id)
    .eq("user_id", targetUserId)
    .select("id, ingredient_name")
    .single();

  if (ingErr) throw new AppError("Failed to update ingredient price", 500);

  // Record to history (table may not exist — fail silently)
  try {
    await supabaseAdmin.from("ingredient_price_history").insert({
      user_id: targetUserId,
      ingredient_id,
      ingredient_name: ingredient.ingredient_name,
      price_per_unit: Number(price_per_unit),
      vendor_id: vendor_id || null,
      source: "manual"
    });
  } catch {
    // Fail silently if table doesn't exist yet
  }

  res.json({ success: true, ingredient });
}
