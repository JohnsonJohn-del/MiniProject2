import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { getReadScope, getTargetUserId } from "../utils/tenantScope.js";
import { calculateRecipeCost } from "../services/costingService.js";

const menuItemSchema = z.object({
  recipe_id: z.string().uuid(),
  selling_price: z.coerce.number().min(0)
});

export async function listMenuItems(req, res) {
  const scope = getReadScope(req, "m.user_id");
  const result = await query(
    `SELECT m.id, m.user_id, m.recipe_id, r.recipe_name,
            m.selling_price, m.profit_margin, m.ai_suggested_price,
            m.created_at
     FROM menu_items m
     LEFT JOIN recipes r ON r.id = m.recipe_id
     ${scope.clause.replace("WHERE", "WHERE")}
     ORDER BY m.created_at DESC`,
    scope.values
  );
  res.json({ success: true, menuItems: result.rows });
}

export async function createMenuItem(req, res) {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid menu item payload", 400);

  const targetUserId = getTargetUserId(req);
  const { recipe_id, selling_price } = parsed.data;
  const costData = await calculateRecipeCost({ recipeId: recipe_id, user: req.user });

  const margin = selling_price === 0 ? 0 : ((selling_price - costData.finalDishCost) / selling_price) * 100;

  const result = await query(
    `INSERT INTO menu_items (user_id, recipe_id, selling_price, profit_margin)
     VALUES ($1, $2, $3, $4)
     RETURNING id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, created_at`,
    [targetUserId, recipe_id, selling_price, margin.toFixed(2)]
  );

  res.status(201).json({ success: true, menuItem: result.rows[0] });
}

export async function updateMenuItem(req, res) {
  const parsed = menuItemSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid menu item payload", 400);

  const { id } = req.params;
  const { recipe_id, selling_price } = parsed.data;
  const costData = await calculateRecipeCost({ recipeId: recipe_id, user: req.user });
  const margin = selling_price === 0 ? 0 : ((selling_price - costData.finalDishCost) / selling_price) * 100;

  const result = await query(
    `UPDATE menu_items
     SET recipe_id = $1,
         selling_price = $2,
         profit_margin = $3,
         updated_at = now()
     WHERE id = $4
       AND ($5::text = 'admin' OR user_id = $6)
     RETURNING id, user_id, recipe_id, selling_price, profit_margin, ai_suggested_price, updated_at`,
    [recipe_id, selling_price, margin.toFixed(2), id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Menu item not found", 404);
  res.json({ success: true, menuItem: result.rows[0] });
}

export async function deleteMenuItem(req, res) {
  const { id } = req.params;
  const result = await query(
    `DELETE FROM menu_items
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)
     RETURNING id`,
    [id, req.user.role, req.user.id]
  );
  if (!result.rows[0]) throw new AppError("Menu item not found", 404);
  res.json({ success: true, message: "Menu item deleted" });
}
