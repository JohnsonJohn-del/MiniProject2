import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { normalizeQuantity } from "../utils/unitConverter.js";

const recipeSchema = z.object({
  recipe_name: z.string().min(2),
  items: z
    .array(
      z.object({
        ingredient_id: z.string().uuid(),
        quantity: z.coerce.number().positive(),
        unit: z.string().optional()
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

function getNormalizedItemMap(items, ingredientRows) {
  try {
    return items.reduce((acc, item) => {
      const baseIng = ingredientRows.find(i => i.id === item.ingredient_id);
      const normalizedQty = baseIng ? normalizeQuantity(item.quantity, item.unit || baseIng.unit, baseIng.unit) : item.quantity;
      return { ...acc, [item.ingredient_id]: normalizedQty };
    }, {});
  } catch (err) {
    throw new AppError(err.message, 400);
  }
}

export async function listRecipes(req, res) {
  let sbQuery = supabaseAdmin
    .from("recipes")
    .select("id, user_id, recipe_name, total_cost, created_at")
    .order("created_at", { ascending: false });

  if (req.user.role === "admin") {
    if (req.query.user_id) {
      sbQuery = sbQuery.eq("user_id", req.query.user_id);
    }
  } else {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data: recipes, error } = await sbQuery;
  if (error) throw new AppError("Failed to fetch recipes", 500);

  const recipeIds = recipes.map((r) => r.id);
  const { data: riData } = await supabaseAdmin
    .from("recipe_ingredients")
    .select("recipe_id")
    .in("recipe_id", recipeIds);

  const countMap = {};
  (riData || []).forEach((ri) => {
    countMap[ri.recipe_id] = (countMap[ri.recipe_id] || 0) + 1;
  });

  const result = recipes.map((r) => ({
    ...r,
    ingredient_count: countMap[r.id] || 0
  }));

  res.json({ success: true, recipes: result });
}

export async function getRecipeById(req, res) {
  const { id } = req.params;

  let sbQuery = supabaseAdmin
    .from("recipes")
    .select("id, user_id, recipe_name, total_cost, created_at")
    .eq("id", id);

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data: recipes, error: recipeError } = await sbQuery;
  if (recipeError) throw new AppError("Failed to fetch recipe", 500);
  if (!recipes || recipes.length === 0) throw new AppError("Recipe not found", 404);

  const recipe = recipes[0];

  const { data: items, error: itemsError } = await supabaseAdmin
    .from("recipe_ingredients")
    .select("ingredient_id, quantity")
    .eq("recipe_id", id);

  if (itemsError) throw new AppError("Failed to fetch recipe ingredients", 500);

  const ingredientIds = items.map((i) => i.ingredient_id);
  const { data: ingredientDetails } = await supabaseAdmin
    .from("ingredients")
    .select("id, ingredient_name, unit, price_per_unit")
    .in("id", ingredientIds);

  const detailMap = {};
  (ingredientDetails || []).forEach((d) => {
    detailMap[d.id] = d;
  });

  const enrichedItems = (items || []).map((item) => {
    const detail = detailMap[item.ingredient_id] || {};
    return {
      ingredient_id: item.ingredient_id,
      quantity: item.quantity,
      unit: item.unit || detail.unit || "",
      base_unit: detail.unit || "",
      ingredient_name: detail.ingredient_name || "",
      price_per_unit: Number(detail.price_per_unit || 0)
    };
  });

  res.json({
    success: true,
    recipe: {
      ...recipe,
      items: enrichedItems
    }
  });
}

export async function createRecipe(req, res) {
  const parsed = recipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid recipe payload", 400);

  const targetUserId = getTargetUserId(req);
  const { recipe_name, items } = parsed.data;

  const ingredientIds = items.map((item) => item.ingredient_id);

  let ingQuery = supabaseAdmin
    .from("ingredients")
    .select("id, user_id, unit, price_per_unit")
    .in("id", ingredientIds);

  if (req.user.role !== "admin") {
    ingQuery = ingQuery.eq("user_id", req.user.id);
  }

  const { data: ingredientRows, error: ingError } = await ingQuery;
  if (ingError) throw new AppError("Failed to validate ingredients", 500);

  if (!ingredientRows || ingredientRows.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid", 400);
  }

  const itemMap = getNormalizedItemMap(items, ingredientRows);

  const totalCost = calculateIngredientCost(ingredientRows, itemMap);

  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from("recipes")
    .insert({
      user_id: targetUserId,
      recipe_name,
      total_cost: totalCost.toFixed(2)
    })
    .select("id, user_id, recipe_name, total_cost, created_at")
    .single();

  if (recipeError) throw new AppError("Failed to create recipe", 500);

  const recipeIngredients = items.map((item) => {
    return {
      recipe_id: recipe.id,
      ingredient_id: item.ingredient_id,
      quantity: itemMap[item.ingredient_id]
    };
  });

  const { error: riError } = await supabaseAdmin
    .from("recipe_ingredients")
    .insert(recipeIngredients);

  if (riError) {
    console.error("Recipe Ingredient Insert Error:", riError);
    throw new AppError(`Failed to link ingredients: ${riError.message}`, 500);
  }

  const { count, error: countError } = await supabaseAdmin
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", recipe.user_id);

  if (!countError) {
    await supabaseAdmin
      .from("users")
      .update({ recipes_created: count })
      .eq("id", recipe.user_id);
  }

  res.status(201).json({ success: true, recipe });
}

export async function updateRecipe(req, res) {
  const parsed = recipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid recipe payload", 400);

  const { id } = req.params;
  const { recipe_name, items } = parsed.data;

  let checkQuery = supabaseAdmin
    .from("recipes")
    .select("id, user_id")
    .eq("id", id);

  if (req.user.role !== "admin") {
    checkQuery = checkQuery.eq("user_id", req.user.id);
  }

  const { data: ownedRecipe, error: checkError } = await checkQuery;
  if (checkError) throw new AppError("Failed to find recipe", 500);
  if (!ownedRecipe || ownedRecipe.length === 0) throw new AppError("Recipe not found", 404);

  const ingredientIds = items.map((item) => item.ingredient_id);

  let ingQuery = supabaseAdmin
    .from("ingredients")
    .select("id, unit, price_per_unit")
    .in("id", ingredientIds);

  if (req.user.role !== "admin") {
    ingQuery = ingQuery.eq("user_id", req.user.id);
  }

  const { data: ingredientRows, error: ingError } = await ingQuery;
  if (ingError) throw new AppError("Failed to validate ingredients", 500);
  if (!ingredientRows || ingredientRows.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid", 400);
  }

  const itemMap = getNormalizedItemMap(items, ingredientRows);

  const totalCost = calculateIngredientCost(ingredientRows, itemMap);

  const { data: recipe, error: updateError } = await supabaseAdmin
    .from("recipes")
    .update({
      recipe_name,
      total_cost: totalCost.toFixed(2),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, user_id, recipe_name, total_cost, updated_at");

  if (updateError) throw new AppError("Failed to update recipe", 500);

  const { error: deleteError } = await supabaseAdmin
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", id);

  if (deleteError) throw new AppError("Failed to update recipe ingredients", 500);

  const recipeIngredients = items.map((item) => {
    return {
      recipe_id: id,
      ingredient_id: item.ingredient_id,
      quantity: itemMap[item.ingredient_id]
    };
  });

  const { error: riError } = await supabaseAdmin
    .from("recipe_ingredients")
    .insert(recipeIngredients);

  if (riError) throw new AppError("Failed to link ingredients", 500);

  res.json({ success: true, recipe: recipe[0] });
}

export async function deleteRecipe(req, res) {
  const { id } = req.params;

  let sbQuery = supabaseAdmin
    .from("recipes")
    .delete()
    .eq("id", id)
    .select("user_id");

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to delete recipe", 500);
  if (!data || data.length === 0) throw new AppError("Recipe not found", 404);

  const { count } = await supabaseAdmin
    .from("recipes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", data[0].user_id);

  await supabaseAdmin
    .from("users")
    .update({ recipes_created: count })
    .eq("id", data[0].user_id);

  res.json({ success: true, message: "Recipe deleted" });
}

const previewSchema = z.object({
  items: z
    .array(
      z.object({
        ingredient_id: z.string().uuid(),
        quantity: z.coerce.number().positive(),
        unit: z.string().optional()
      })
    )
    .min(1)
});

export async function previewRecipeCost(req, res) {
  const parsed = previewSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid preview payload", 400);

  const { items } = parsed.data;
  const ingredientIds = items.map((item) => item.ingredient_id);

  let ingQuery = supabaseAdmin
    .from("ingredients")
    .select("id, unit, price_per_unit")
    .in("id", ingredientIds);

  if (req.user.role !== "admin") {
    ingQuery = ingQuery.eq("user_id", req.user.id);
  }

  const { data: ingredientRows, error: ingError } = await ingQuery;
  if (ingError) throw new AppError("Failed to validate ingredients", 500);

  if (!ingredientRows || ingredientRows.length !== ingredientIds.length) {
    throw new AppError("One or more ingredients are invalid", 400);
  }

  const itemMap = getNormalizedItemMap(items, ingredientRows);

  const totalCost = calculateIngredientCost(ingredientRows, itemMap);

  res.json({ success: true, food_cost: totalCost });
}
