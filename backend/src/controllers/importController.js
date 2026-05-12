import { z } from "zod";
import { AppError } from "../utils/appError.js";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { extractTextFromImage } from "../services/ocrService.js";
import { parseBillWithAI, parseRecipeWithAI } from "../services/aiImportService.js";
import { getTargetUserId } from "../utils/tenantScope.js";

export async function uploadBill(req, res) {
  if (!req.file) throw new AppError("No image file provided", 400);

  const ocrText = await extractTextFromImage(req.file.path);

  const { data: doc, error } = await supabaseAdmin
    .from("uploaded_documents")
    .insert({
      user_id: req.user.id,
      image_url: req.file.filename,
      ocr_text: ocrText,
      document_type: "bill",
      status: "ocr_done"
    })
    .select("id, ocr_text, status, created_at")
    .single();

  if (error) throw new AppError("Failed to save document", 500);

  res.json({ success: true, document: doc });
}

// OCR a recipe image — just return the extracted text (no DB save needed)
export async function uploadRecipeImage(req, res) {
  if (!req.file) throw new AppError("No image file provided", 400);
  const ocrText = await extractTextFromImage(req.file.path);
  res.json({ success: true, ocr_text: ocrText });
}

export async function parseBill(req, res) {
  const { ocr_text } = req.body;
  if (!ocr_text) throw new AppError("OCR text is required", 400);

  const parsed = await parseBillWithAI(ocr_text);

  res.json({ success: true, ...parsed });
}

const saveBillSchema = z.object({
  vendor_name: z.string().min(1),
  items: z.array(
    z.object({
      ingredient_name: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unit: z.string().min(1),
      price: z.coerce.number().min(0)
    })
  ).min(1)
});

export async function saveBillImport(req, res) {
  const parsed = saveBillSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid bill data", 400);

  const { vendor_name, items } = parsed.data;
  const targetUserId = getTargetUserId(req);

  const { data: vendor } = await supabaseAdmin
    .from("vendors")
    .insert({ user_id: targetUserId, vendor_name })
    .select("id, vendor_name")
    .single();

  const purchases = [];
  for (const item of items) {
    const { data: purchase, error } = await supabaseAdmin
      .from("ingredient_purchases")
      .insert({
        user_id: targetUserId,
        vendor_id: vendor.id,
        ingredient_name: item.ingredient_name,
        quantity: item.quantity,
        unit: item.unit,
        price: item.price,
        purchase_date: new Date().toISOString().split("T")[0]
      })
      .select("id, ingredient_name, quantity, unit, price")
      .single();

    if (!error) purchases.push(purchase);
  }

  res.status(201).json({ success: true, vendor, purchases });
}

const parseRecipeSchema = z.object({
  text: z.string().min(10)
});

export async function parseRecipe(req, res) {
  const parsed = parseRecipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Recipe text must be at least 10 characters", 400);

  const result = await parseRecipeWithAI(parsed.data.text);

  res.json({ success: true, ...result });
}

const saveRecipeSchema = z.object({
  recipe_name: z.string().min(2),
  ingredients: z.array(
    z.object({
      ingredient_name: z.string().min(1),
      quantity: z.coerce.number().positive(),
      unit: z.string().min(1)
    })
  ).min(1)
});

export async function saveRecipeImport(req, res) {
  const parsed = saveRecipeSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid recipe data", 400);

  const { recipe_name, ingredients } = parsed.data;
  const targetUserId = getTargetUserId(req);

  const ingredientIds = [];
  for (const ing of ingredients) {
    const { data: existing } = await supabaseAdmin
      .from("ingredients")
      .select("id, price_per_unit")
      .eq("ingredient_name", ing.ingredient_name)
      .eq("user_id", targetUserId)
      .maybeSingle();

    if (existing) {
      ingredientIds.push({ id: existing.id, price: existing.price_per_unit, quantity: ing.quantity });
    } else {
      const { data: created } = await supabaseAdmin
        .from("ingredients")
        .insert({
          user_id: targetUserId,
          ingredient_name: ing.ingredient_name,
          unit: ing.unit,
          price_per_unit: 0
        })
        .select("id, price_per_unit")
        .single();
      ingredientIds.push({ id: created.id, price: created.price_per_unit, quantity: ing.quantity });
    }
  }

  const totalCost = ingredientIds.reduce((sum, i) => sum + Number(i.price || 0) * i.quantity, 0);

  const { data: recipe, error: recipeError } = await supabaseAdmin
    .from("recipes")
    .insert({
      user_id: targetUserId,
      recipe_name,
      total_cost: totalCost.toFixed(2)
    })
    .select("id, recipe_name, total_cost")
    .single();

  if (recipeError) throw new AppError("Failed to create recipe", 500);

  const links = await Promise.all(
    ingredientIds.map((ing) =>
      supabaseAdmin
        .from("recipe_ingredients")
        .insert({ recipe_id: recipe.id, ingredient_id: ing.id, quantity: ing.quantity })
    )
  );

  const linkErrors = links.filter((l) => l.error);
  if (linkErrors.length > 0) {
    await supabaseAdmin.from("recipes").delete().eq("id", recipe.id);
    throw new AppError("Failed to link ingredients", 500);
  }

  res.status(201).json({ success: true, recipe });
}

export async function listPurchases(req, res) {
  let sbQuery = supabaseAdmin
    .from("ingredient_purchases")
    .select("id, ingredient_name, quantity, unit, price, purchase_date, created_at, vendors(vendor_name)")
    .order("created_at", { ascending: false });

  if (req.user.role === "admin") {
    if (req.query.user_id) sbQuery = sbQuery.eq("user_id", req.query.user_id);
  } else {
    sbQuery = sbQuery.eq("user_id", req.user.id);
  }

  const { data, error } = await sbQuery;
  if (error) throw new AppError("Failed to fetch purchases", 500);

  const purchases = (data || []).map((p) => ({
    ...p,
    vendor_name: p.vendors?.vendor_name || null,
    vendors: undefined
  }));

  res.json({ success: true, purchases });
}
