import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";

function toMonthDate(month) {
  return month ? `${month}-01` : `${new Date().toISOString().slice(0, 7)}-01`;
}

export async function calculateRecipeCost({ recipeId, user, month }) {
  const recipeResult = await query(
    `SELECT id, user_id, recipe_name, total_cost
     FROM recipes
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)`,
    [recipeId, user.role, user.id]
  );

  const recipe = recipeResult.rows[0];
  if (!recipe) throw new AppError("Recipe not found", 404);

  const ingredientsResult = await query(
    `SELECT SUM(ri.quantity * i.price_per_unit) AS ingredient_cost
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1`,
    [recipeId]
  );

  const ingredientCost = Number(ingredientsResult.rows[0].ingredient_cost || 0);
  const selectedMonth = toMonthDate(month);

  const expenseResult = await query(
    `SELECT electricity_bill, gas_bill, salary_cost
     FROM operational_expenses
     WHERE user_id = $1 AND month = $2`,
    [recipe.user_id, selectedMonth]
  );

  const expenses = expenseResult.rows[0] || { electricity_bill: 0, gas_bill: 0, salary_cost: 0 };

  const recipeCountResult = await query("SELECT COUNT(*)::int AS count FROM recipes WHERE user_id = $1", [
    recipe.user_id
  ]);
  const recipeCount = Math.max(Number(recipeCountResult.rows[0].count || 1), 1);

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
