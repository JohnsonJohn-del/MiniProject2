import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";

const vendorSchema = z.object({
  vendor_name: z.string().min(2),
  contact: z.string().optional().nullable()
});

export async function listVendors(req, res) {
  let sbQuery = supabaseAdmin
    .from("vendors")
    .select("id, user_id, vendor_name, contact, created_at")
    .order("created_at", { ascending: false });

  if (req.user.role === "admin") {
    if (req.query.user_id) {
      sbQuery = sbQuery.eq("user_id", req.query.user_id);
    }
  } else {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to fetch vendors", 500);

  res.json({ success: true, vendors: data });
}

export async function createVendor(req, res) {
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid vendor payload", 400);

  const targetUserId = getTargetUserId(req);
  const { vendor_name, contact } = parsed.data;

  const { data, error } = await supabaseAdmin
    .from("vendors")
    .insert({
      user_id: targetUserId,
      vendor_name,
      contact: contact || null
    })
    .select("id, user_id, vendor_name, contact, created_at")
    .single();

  if (error) throw new AppError("Failed to create vendor", 500);
  res.status(201).json({ success: true, vendor: data });
}

export async function updateVendor(req, res) {
  const parsed = vendorSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid vendor payload", 400);

  const { id } = req.params;
  const { vendor_name, contact } = parsed.data;

  let sbQuery = supabaseAdmin
    .from("vendors")
    .update({
      vendor_name,
      contact: contact || null,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select("id, user_id, vendor_name, contact, updated_at");

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to update vendor", 500);
  if (!data || data.length === 0) throw new AppError("Vendor not found", 404);

  res.json({ success: true, vendor: data[0] });
}

export async function deleteVendor(req, res) {
  const { id } = req.params;

  let sbQuery = supabaseAdmin
    .from("vendors")
    .delete()
    .eq("id", id)
    .select("id");

  if (req.user.role !== "admin") {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to delete vendor", 500);
  if (!data || data.length === 0) throw new AppError("Vendor not found", 404);

  res.json({ success: true, message: "Vendor deleted" });
}
