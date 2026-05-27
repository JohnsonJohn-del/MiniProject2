import { z } from "zod";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { AppError } from "../utils/appError.js";
import { getTargetUserId } from "../utils/tenantScope.js";

const expenseSchema = z.object({
  electricity_bill: z.coerce.number().min(0),
  gas_bill: z.coerce.number().min(0),
  water_bill: z.coerce.number().min(0).optional().default(0),
  salary_cost: z.coerce.number().min(0),
  month: z.string().regex(/^\d{4}-\d{2}$/)
});

export async function listOperationalExpenses(req, res) {
  let q = supabaseAdmin
    .from("operational_expenses")
    .select("id, user_id, electricity_bill, gas_bill, water_bill, salary_cost, month, created_at")
    .order("month", { ascending: false });

  if (req.user.role === "admin" && req.query.user_id) {
    q = q.eq("user_id", req.query.user_id);
  } else if (req.user.role !== "admin") {
    q = q.eq("user_id", req.user.id);
  }

  let { data, error } = await q;

  // Graceful fallback if water_bill column not yet migrated
  if (error && error.message?.includes("water_bill")) {
    let q2 = supabaseAdmin
      .from("operational_expenses")
      .select("id, user_id, electricity_bill, gas_bill, salary_cost, month, created_at")
      .order("month", { ascending: false });
    if (req.user.role === "admin" && req.query.user_id) q2 = q2.eq("user_id", req.query.user_id);
    else if (req.user.role !== "admin") q2 = q2.eq("user_id", req.user.id);
    const res2 = await q2;
    data = (res2.data || []).map(d => ({ ...d, water_bill: 0 }));
    error = res2.error;
  }

  if (error) throw new AppError("Failed to fetch expenses", 500);

  const mapped = (data || []).map(d => ({
    ...d,
    water_bill: d.water_bill ?? 0,
    month: typeof d.month === 'string' ? d.month.substring(0, 7) : d.month
  }));

  res.json({ success: true, expenses: mapped });
}

export async function upsertOperationalExpense(req, res) {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid operational expense payload", 400);

  const targetUserId = getTargetUserId(req);
  const { electricity_bill, gas_bill, water_bill, salary_cost, month } = parsed.data;
  const monthDate = `${month}-01`;

  const payload = { user_id: targetUserId, electricity_bill, gas_bill, water_bill, salary_cost, month: monthDate, updated_at: new Date().toISOString() };

  let { data, error } = await supabaseAdmin
    .from("operational_expenses")
    .upsert(payload, { onConflict: "user_id,month" })
    .select("id, user_id, electricity_bill, gas_bill, water_bill, salary_cost, month, updated_at")
    .single();

  // Graceful fallback if water_bill column not yet migrated
  if (error && error.message?.includes("water_bill")) {
    const { water_bill: _w, ...payloadNoWater } = payload;
    const res2 = await supabaseAdmin
      .from("operational_expenses")
      .upsert(payloadNoWater, { onConflict: "user_id,month" })
      .select("id, user_id, electricity_bill, gas_bill, salary_cost, month, updated_at")
      .single();
    data = res2.data ? { ...res2.data, water_bill: 0 } : null;
    error = res2.error;
  }

  if (error || !data) throw new AppError("Failed to save operational expense", 500);

  res.json({ 
    success: true, 
    expense: {
      ...data,
      water_bill: data.water_bill ?? 0,
      month: data.month.substring(0, 7)
    } 
  });
}

export async function deleteOperationalExpense(req, res) {
  const { id } = req.params;
  
  let q = supabaseAdmin.from("operational_expenses").delete().eq("id", id).select("id").single();
  if (req.user.role !== "admin") q = q.eq("user_id", req.user.id);

  const { data, error } = await q;
  if (error || !data) throw new AppError("Expense record not found", 404);

  res.json({ success: true, message: "Operational expense deleted" });
}
