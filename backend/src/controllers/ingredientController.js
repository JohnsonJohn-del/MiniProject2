import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

const ingredientSchema = z.object({
  ingredient_name: z.string().min(2),
  unit: z.string().min(1),
  vendor_id: z.string().uuid().nullable().optional(),
  price_per_unit: z.coerce.number().min(0)
});

export async function listIngredients(req, res) {
  let sbQuery = supabaseAdmin
    .from("ingredients")
    .select("id, user_id, ingredient_name, unit, vendor_id, price_per_unit, created_at, vendors(vendor_name)")
    .order("created_at", { ascending: false });

  if (req.user.role === "admin") {
    if (req.query.user_id) {
      sbQuery = sbQuery.eq("user_id", req.query.user_id);
    }
  } else {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to fetch ingredients", 500);

  const ingredients = data.map((item) => ({
    ...item,
    vendor_name: item.vendors?.vendor_name || null,
    vendors: undefined
  }));

  res.json({ success: true, ingredients });
}

export async function createIngredient(req, res) {
  const parsed = ingredientSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid ingredient payload", 400);

  const targetUserId = getTargetUserId(req);
  const { ingredient_name, unit, vendor_id, price_per_unit } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("ingredients")
    .insert({
      user_id: targetUserId,
      ingredient_name,
      unit,
      vendor_id: vendor_id || null,
      price_per_unit
    })
    .select("id, user_id, ingredient_name, unit, vendor_id, price_per_unit, created_at")
    .single();

  if (error) throw new AppError("Failed to create ingredient", 500);
  res.status(201).json({ success: true, ingredient: data });
}

export async function updateIngredient(req, res) {
  const parsed = ingredientSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid ingredient payload", 400);

  const { id } = req.params;
  const { ingredient_name, unit, vendor_id, price_per_unit } = parsed.data;

  let sbQuery = supabaseAdmin
    .from("ingredients")
    .update({
      ingredient_name,
      unit,
      vendor_id: vendor_id || null,
      price_per_unit,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, user_id, ingredient_name, unit, vendor_id, price_per_unit, updated_at");

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to update ingredient", 500);
  if (!data || data.length === 0) throw new AppError("Ingredient not found", 404);

  // Fire and forget background task to update dependent recipes
  recalculateRecipesForIngredient(id).catch(err => console.error(err));

  res.json({ success: true, ingredient: data[0] });
}

// Helper: Recalculates total cost for all recipes containing a specific ingredient
async function recalculateRecipesForIngredient(ingredientId) {
  try {
    const { data: recipeIds } = await supabaseAdmin
      .from("recipe_ingredients")
      .select("recipe_id")
      .eq("ingredient_id", ingredientId);

    if (!recipeIds || recipeIds.length === 0) return;

    const uniqueRecipeIds = [...new Set(recipeIds.map(r => r.recipe_id))];

    for (const rid of uniqueRecipeIds) {
      const { data: recipeItems } = await supabaseAdmin
        .from("recipe_ingredients")
        .select("ingredient_id, quantity, ingredients(price_per_unit)")
        .eq("recipe_id", rid);

      if (!recipeItems) continue;

      let totalCost = 0;
      recipeItems.forEach(ri => {
        if (ri.ingredients && ri.ingredients.price_per_unit) {
          totalCost += Number(ri.quantity) * Number(ri.ingredients.price_per_unit);
        }
      });

      await supabaseAdmin
        .from("recipes")
        .update({ total_cost: totalCost.toFixed(2) })
        .eq("id", rid);
    }
  } catch (err) {
    console.error("Recipe recalculation failed:", err);
  }
}

export async function deleteIngredient(req, res) {
  const { id } = req.params;

  let sbQuery = supabaseAdmin
    .from("ingredients")
    .delete()
    .eq("id", id)
    .select("id");

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to delete ingredient", 500);
  if (!data || data.length === 0) throw new AppError("Ingredient not found", 404);

  res.json({ success: true, message: "Ingredient deleted" });
}
