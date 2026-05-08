import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { getReadScope, getTargetUserId } from "../utils/tenantScope.js";

const recipeSchema = z.object({
  recipe_name: z.string().min(2),
  items: z
    .array(
      z.object({
        ingredient_id: z.string().uuid(),
        quantity: z.coerce.number().positive()
      })
    )
    .min(1)
});

function calculateIngredientCost(ingredients, itemMap) {
  return ingredients.reduce((sum, row) => {
    const quantity = itemMap[row.id];
    return sum + Number(row.price_per_unit) * quantity;
  }, 0);
}

export async function listRecipes(req, res) {
  const scope = getReadScope(req, "r.user_id");
  const result = await query(
    `SELECT r.id, r.user_id, r.recipe_name, r.total_cost, r.created_at,
            COUNT(ri.ingredient_id)::int AS ingredient_count
     FROM recipes r
     LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
     ${scope.clause.replace("WHERE", "WHERE")}
     GROUP BY r.id
     ORDER BY r.created_at DESC`,
    scope.values
  );
  res.json({ success: true, recipes: result.rows });
}

export async function getRecipeById(req, res) {
  const { id } = req.params;

  const recipeResult = await query(
    `SELECT id, user_id, recipe_name, total_cost, created_at
     FROM recipes
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)`,
    [id, req.user.role, req.user.id]
  );

  if (!recipeResult.rows[0]) throw new AppError("Recipe not found", 404);

  const ingredientsResult = await query(
    `SELECT ri.ingredient_id, ri.quantity, i.ingredient_name, i.unit, i.price_per_unit
     FROM recipe_ingredients ri
     JOIN ingredients i ON i.id = ri.ingredient_id
     WHERE ri.recipe_id = $1`,
    [id]
  );

  res.json({
    success: true,
    recipe: {
      ...recipeResult.rows[0],
      items: ingredientsResult.rows
    }
  });
}

export async function createRecipe(req, res) {
  const parsed = recipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid recipe payload", 400);

  const targetUserId = getTargetUserId(req);
  const { recipe_name, items } = parsed.data;

  const ingredientIds = items.map((item) => item.ingredient_id);
  const ingredientRows = await query(
    `SELECT id, user_id, price_per_unit
     FROM ingredients
     WHERE id = ANY($1::uuid[])
       AND ($2::text = 'admin' OR user_id = $3)`,
    [ingredientIds, req.user.role, req.user.id]
  );

  if (ingredientRows.rows.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid", 400);
  }

  const itemMap = items.reduce((acc, item) => ({ ...acc, [item.ingredient_id]: item.quantity }), {});
  const totalCost = calculateIngredientCost(ingredientRows.rows, itemMap);

  const recipeResult = await query(
    `INSERT INTO recipes (user_id, recipe_name, total_cost)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, recipe_name, total_cost, created_at`,
    [targetUserId, recipe_name, totalCost.toFixed(2)]
  );

  const recipe = recipeResult.rows[0];
  const valueChunks = items
    .map((item, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`)
    .join(",");
  const params = [recipe.id, ...items.flatMap((item) => [item.ingredient_id, item.quantity])];

  await query(
    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
     VALUES ${valueChunks}`,
    params
  );

  await query(
    `UPDATE users
     SET recipes_created = (
       SELECT COUNT(*)::int FROM recipes WHERE user_id = $1
     )
     WHERE id = $1`,
    [recipe.user_id]
  );

  res.status(201).json({ success: true, recipe });
}

export async function updateRecipe(req, res) {
  const parsed = recipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid recipe payload", 400);

  const { id } = req.params;
  const { recipe_name, items } = parsed.data;

  const ownedRecipe = await query(
    `SELECT id, user_id FROM recipes
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)`,
    [id, req.user.role, req.user.id]
  );
  if (!ownedRecipe.rows[0]) throw new AppError("Recipe not found", 404);

  const ingredientIds = items.map((item) => item.ingredient_id);
  const ingredientRows = await query(
    `SELECT id, price_per_unit
     FROM ingredients
     WHERE id = ANY($1::uuid[])
       AND ($2::text = 'admin' OR user_id = $3)`,
    [ingredientIds, req.user.role, req.user.id]
  );
  if (ingredientRows.rows.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid", 400);
  }

  const itemMap = items.reduce((acc, item) => ({ ...acc, [item.ingredient_id]: item.quantity }), {});
  const totalCost = calculateIngredientCost(ingredientRows.rows, itemMap);

  const recipeResult = await query(
    `UPDATE recipes
     SET recipe_name = $1,
         total_cost = $2,
         updated_at = now()
     WHERE id = $3
     RETURNING id, user_id, recipe_name, total_cost, updated_at`,
    [recipe_name, totalCost.toFixed(2), id]
  );

  await query("DELETE FROM recipe_ingredients WHERE recipe_id = $1", [id]);

  const valueChunks = items
    .map((item, index) => `($1, $${index * 2 + 2}, $${index * 2 + 3})`)
    .join(",");
  const params = [id, ...items.flatMap((item) => [item.ingredient_id, item.quantity])];

  await query(
    `INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity)
     VALUES ${valueChunks}`,
    params
  );

  res.json({ success: true, recipe: recipeResult.rows[0] });
}

export async function deleteRecipe(req, res) {
  const { id } = req.params;
  const result = await query(
    `DELETE FROM recipes
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)
     RETURNING user_id`,
    [id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Recipe not found", 404);

  await query(
    `UPDATE users
     SET recipes_created = (
       SELECT COUNT(*)::int FROM recipes WHERE user_id = $1
     )
     WHERE id = $1`,
    [result.rows[0].user_id]
  );

  res.json({ success: true, message: "Recipe deleted" });
}
