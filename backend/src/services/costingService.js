import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";

function toMonthDate(month) {
  return month ? `${month}-01` : `${new Date().toISOString().slice(0, 7)}-01`;
}

export async function calculateRecipeCost({ recipeId, user, month }) {
  let rQuery = supabaseAdmin.from("recipes").select("id, user_id, recipe_name, total_cost").eq("id", recipeId);
  if (user.role !== "admin") rQuery = rQuery.eq("user_id", user.id);
  
  const { data: recipe, error: recipeError } = await rQuery.single();

  if (recipeError || !recipe) throw new AppError("Recipe not found", 404);

  const { data: ingredientsData } = await supabaseAdmin
    .from("recipe_ingredients")
    .select("quantity, ingredients(id, price_per_unit)")
    .eq("recipe_id", recipeId);

  let ingredientCost = 0;
  (ingredientsData || []).forEach(ri => {
    if (ri.ingredients) {
      ingredientCost += Number(ri.quantity) * Number(ri.ingredients.price_per_unit);
    }
  });

  const selectedMonth = toMonthDate(month);

  const { data: expense } = await supabaseAdmin
    .from("operational_expenses")
    .select("electricity_bill, gas_bill, salary_cost")
    .eq("user_id", recipe.user_id)
    .eq("month", selectedMonth)
    .maybeSingle();

  const expenses = expense || { electricity_bill: 0, gas_bill: 0, salary_cost: 0 };

  const { count } = await supabaseAdmin
    .from("recipes")
    .select("*", { count: 'exact', head: true })
    .eq("user_id", recipe.user_id);
    
  const recipeCount = Math.max(count || 1, 1);

  const operationalAllocation = (Number(expenses.electricity_bill) + Number(expenses.gas_bill)) / recipeCount;
  const salaryAllocation = Number(expenses.salary_cost) / recipeCount;
  const finalDishCost = ingredientCost + operationalAllocation + salaryAllocation;

  return {
    recipe,
    month: selectedMonth,
    ingredientCost,
    operationalAllocation,
    salaryAllocation,
    finalDishCost
  };
}
