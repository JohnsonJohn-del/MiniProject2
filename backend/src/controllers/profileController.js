import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";

const profileSchema = z.object({
  business_name: z.string().min(2),
  business_type: z.string().min(2),
  phone_number: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default("India"),
  postal_code: z.string().optional(),
  tax_id: z.string().optional(),
  website: z.string().optional(),
  online_platforms: z.array(z.string()).optional(),
  currency_code: z.string().optional(),
  timezone: z.string().optional()
});

export async function upsertProfile(req, res) {
  const parsed = profileSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("Invalid profile data", 400);
  }

  const profileData = {
    user_id: req.user.id,
    ...parsed.data
  };

  const { data, error } = await supabaseAdmin
    .from("restaurant_profiles")
    .upsert(profileData, { onConflict: "user_id" })
    .select()
    .single();

  if (error) {
    throw new AppError("Failed to save profile", 500);
  }

  res.status(200).json({ success: true, profile: data });
}

export async function getProfile(req, res) {
  const { data, error } = await supabaseAdmin
    .from("restaurant_profiles")
    .select("*")
    .eq("user_id", req.user.id)
    .maybeSingle();

  if (error) {
    throw new AppError("Database error", 500);
  }

  res.status(200).json({ success: true, profile: data });
}
