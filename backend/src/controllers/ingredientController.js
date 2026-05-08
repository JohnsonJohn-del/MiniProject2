import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { getReadScope, getTargetUserId } from "../utils/tenantScope.js";

const ingredientSchema = z.object({
  ingredient_name: z.string().min(2),
  unit: z.string().min(1),
  vendor_id: z.string().uuid().nullable().optional(),
  price_per_unit: z.coerce.number().min(0)
});

export async function listIngredients(req, res) {
  const scope = getReadScope(req, "i.user_id");
  const result = await query(
    `SELECT i.id, i.user_id, i.ingredient_name, i.unit, i.vendor_id, i.price_per_unit,
            v.vendor_name, i.created_at
     FROM ingredients i
     LEFT JOIN vendors v ON v.id = i.vendor_id
     ${scope.clause.replace("WHERE", "WHERE")}
     ORDER BY i.created_at DESC`,
    scope.values
  );
  res.json({ success: true, ingredients: result.rows });
}

export async function createIngredient(req, res) {
  const parsed = ingredientSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid ingredient payload", 400);

  const targetUserId = getTargetUserId(req);
  const { ingredient_name, unit, vendor_id, price_per_unit } = parsed.data;

  const result = await query(
    `INSERT INTO ingredients (user_id, ingredient_name, unit, vendor_id, price_per_unit)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, ingredient_name, unit, vendor_id, price_per_unit, created_at`,
    [targetUserId, ingredient_name, unit, vendor_id || null, price_per_unit]
  );

  res.status(201).json({ success: true, ingredient: result.rows[0] });
}

export async function updateIngredient(req, res) {
  const parsed = ingredientSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid ingredient payload", 400);

  const { id } = req.params;
  const { ingredient_name, unit, vendor_id, price_per_unit } = parsed.data;

  const result = await query(
    `UPDATE ingredients
     SET ingredient_name = $1,
         unit = $2,
         vendor_id = $3,
         price_per_unit = $4,
         updated_at = now()
     WHERE id = $5
       AND ($6::text = 'admin' OR user_id = $7)
     RETURNING id, user_id, ingredient_name, unit, vendor_id, price_per_unit, updated_at`,
    [ingredient_name, unit, vendor_id || null, price_per_unit, id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Ingredient not found", 404);
  res.json({ success: true, ingredient: result.rows[0] });
}

export async function deleteIngredient(req, res) {
  const { id } = req.params;
  const result = await query(
    `DELETE FROM ingredients
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)
     RETURNING id`,
    [id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Ingredient not found", 404);
  res.json({ success: true, message: "Ingredient deleted" });
}
