import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { getReadScope, getTargetUserId } from "../utils/tenantScope.js";

const vendorSchema = z.object({
  vendor_name: z.string().min(2),
  contact: z.string().optional().nullable()
});

export async function listVendors(req, res) {
  const scope = getReadScope(req);
  const result = await query(
    `SELECT id, user_id, vendor_name, contact, created_at
     FROM vendors${scope.clause}
     ORDER BY created_at DESC`,
    scope.values
  );
  res.json({ success: true, vendors: result.rows });
}

export async function createVendor(req, res) {
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid vendor payload", 400);

  const targetUserId = getTargetUserId(req);
  const { vendor_name, contact } = parsed.data;

  const result = await query(
    `INSERT INTO vendors (user_id, vendor_name, contact)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, vendor_name, contact, created_at`,
    [targetUserId, vendor_name, contact || null]
  );

  res.status(201).json({ success: true, vendor: result.rows[0] });
}

export async function updateVendor(req, res) {
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid vendor payload", 400);

  const { id } = req.params;
  const { vendor_name, contact } = parsed.data;

  const result = await query(
    `UPDATE vendors
     SET vendor_name = $1, contact = $2, updated_at = now()
     WHERE id = $3
       AND ($4::text = 'admin' OR user_id = $5)
     RETURNING id, user_id, vendor_name, contact, updated_at`,
    [vendor_name, contact || null, id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Vendor not found", 404);
  res.json({ success: true, vendor: result.rows[0] });
}

export async function deleteVendor(req, res) {
  const { id } = req.params;
  const result = await query(
    `DELETE FROM vendors
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)
     RETURNING id`,
    [id, req.user.role, req.user.id]
  );

  if (!result.rows[0]) throw new AppError("Vendor not found", 404);
  res.json({ success: true, message: "Vendor deleted" });
}
