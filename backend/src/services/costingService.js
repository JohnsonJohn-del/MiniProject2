import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";
import { normalizeQuantity } from "../utils/unitConverter.js";

function toMonthDate(month) {
  return month ? `${month}-01` : `${new Date().toISOString().slice(0, 7)}-01`;
}

export async function calculateRecipeCost({ recipeId, user, month }) {
  let rQuery = supabaseAdmin.from("recipes").select("id, user_id, recipe_name, total_cost").eq("id", recipeId);
  if (user.role !== "admin") rQuery = rQuery.eq("user_id", user.id);
  
  const { data: recipe, error: recipeError } = await rQuery.single();

  if (recipeError || !recipe) throw new AppError("Recipe not found", 404);

  let { data: ingredientsData, error: riError } = await supabaseAdmin
    .from("recipe_ingredients")
    .select("quantity, unit, ingredients(id, price_per_unit, unit)")
    .eq("recipe_id", recipeId);

  // Fallback if unit column doesn't exist yet in recipe_ingredients
  if (riError && riError.message?.includes("unit")) {
    const res2 = await supabaseAdmin
      .from("recipe_ingredients")
      .select("quantity, ingredient_id, ingredients(id, price_per_unit, unit)")
      .eq("recipe_id", recipeId);
    // Treat quantity as already in base unit
    ingredientsData = (res2.data || []).map(r => ({ ...r, unit: r.ingredients?.unit || "kg" }));
  }

  let ingredientCost = 0;
  (ingredientsData || []).forEach(ri => {
    if (ri.ingredients) {
      const baseIng = ri.ingredients;
      // ri.unit falls back to base ingredient unit so normalizeQuantity is a no-op
      const normalizedQty = normalizeQuantity(ri.quantity, ri.unit || baseIng.unit, baseIng.unit);
      ingredientCost += normalizedQty * Number(baseIng.price_per_unit);
    }
  });


  const selectedMonth = toMonthDate(month);

  // Fetch operational expenses for the selected month (or latest)
  let { data: opexData, error: opexError } = await supabaseAdmin
    .from("operational_expenses")
    .select("electricity_bill, gas_bill, water_bill, salary_cost")
    .eq("user_id", recipe.user_id)
    .order("month", { ascending: false })
    .limit(1)
    .maybeSingle();

  // Fallback if water_bill column not yet migrated in DB
  if (opexError || !opexData) {
    const { data: opexFallback } = await supabaseAdmin
      .from("operational_expenses")
      .select("electricity_bill, gas_bill, salary_cost")
      .eq("user_id", recipe.user_id)
      .order("month", { ascending: false })
      .limit(1)
      .maybeSingle();
    opexData = opexFallback ? { ...opexFallback, water_bill: 0 } : null;
  }

  const electricity = Number(opexData?.electricity_bill || 0);
  const gas = Number(opexData?.gas_bill || 0);
  const water = Number(opexData?.water_bill || 0);
  const salary = Number(opexData?.salary_cost || 0);
  
  const totalMonthlyOpex = electricity + gas + water; 
  const totalMonthlySalary = salary;

  // Assume standard 5000 dishes/month volume for realistic per-serving allocation if not specified
  const assumedMonthlyVolume = 5000;
  
  // Per-serving breakdown
  const packagingCost = 15;
  const operationalAllocation = (totalMonthlyOpex / assumedMonthlyVolume) || (ingredientCost * 0.15); // Fallback to 15% if no opex recorded
  const salaryAllocation = (totalMonthlySalary / assumedMonthlyVolume) || (ingredientCost * 0.10); // Fallback to 10% if no salary recorded

  const finalDishCost = ingredientCost + packagingCost + operationalAllocation + salaryAllocation;

  return {
    recipe,
    month: selectedMonth,
    ingredientCost,
    packagingCost,
    operationalAllocation,
    salaryAllocation,
    finalDishCost
  };
}
