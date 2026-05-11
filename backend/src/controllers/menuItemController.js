import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";
import { calculateRecipeCost } from "../services/costingService.js";

const menuItemSchema = z.object({
  recipe_id: z.string().uuid(),
  selling_price: z.coerce.number().min(0)
});

export async function listMenuItems(req, res) {
  let q = supabaseAdmin
    .from("menu_items")
    .select("id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, created_at, recipes(recipe_name)")
    .order("created_at", { ascending: false });

  if (req.user.role === "admin") {
    if (req.query.user_id) q = q.eq("user_id", req.query.user_id);
  } else {
    q = q.eq("user_id", req.user.id);
  }

  const { data, error } = await q;
  if (error) throw new AppError("Failed to fetch menu items", 500);

  const mapped = data.map(m => ({
    ...m,
    recipe_name: m.recipes?.recipe_name,
    recipes: undefined
  }));

  res.json({ success: true, menuItems: mapped });
}

export async function createMenuItem(req, res) {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid menu item payload", 400);

  const targetUserId = getTargetUserId(req);
  const { recipe_id, selling_price } = parsed.data;
  const costData = await calculateRecipeCost({ recipeId: recipe_id, user: req.user });

  const margin = selling_price === 0 ? 0 : ((selling_price - costData.finalDishCost) / selling_price) * 100;

  const { data, error } = await supabaseAdmin
    .from("menu_items")
    .insert({
      user_id: targetUserId,
      recipe_id,
      selling_price,
      profit_margin: margin.toFixed(2)
    })
    .select("id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, created_at")
    .single();

  if (error || !data) throw new AppError("Failed to create menu item", 500);

  res.status(201).json({ success: true, menuItem: data });
}

export async function updateMenuItem(req, res) {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid menu item payload", 400);

  const { id } = req.params;
  const { recipe_id, selling_price } = parsed.data;
  const costData = await calculateRecipeCost({ recipeId: recipe_id, user: req.user });
  const margin = selling_price === 0 ? 0 : ((selling_price - costData.finalDishCost) / selling_price) * 100;

  let updateQuery = supabaseAdmin
    .from("menu_items")
    .update({
      recipe_id,
      selling_price,
      profit_margin: margin.toFixed(2),
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, updated_at")
    .single();

  if (req.user.role !== "admin") updateQuery = updateQuery.eq("user_id", req.user.id);

  const { data, error } = await updateQuery;
  if (error || !data) throw new AppError("Menu item not found", 404);

  res.json({ success: true, menuItem: data });
}

export async function deleteMenuItem(req, res) {
  const { id } = req.params;
  
  let delQuery = supabaseAdmin.from("menu_items").delete().eq("id", id).select("id").single();
  if (req.user.role !== "admin") delQuery = delQuery.eq("user_id", req.user.id);

  const { data, error } = await delQuery;
  if (error || !data) throw new AppError("Menu item not found", 404);

  res.json({ success: true, message: "Menu item deleted" });
}
