import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { getReadScope, getTargetUserId } from "../utils/tenantScope.js";

const expenseSchema = z.object({
  electricity_bill: z.coerce.number().min(0),
  gas_bill: z.coerce.number().min(0),
  salary_cost: z.coerce.number().min(0),
  month: z.string().regex(/^\d{4}-\d{2}$/)
});

export async function listOperationalExpenses(req, res) {
  const scope = getReadScope(req);
  const result = await query(
    `SELECT id, user_id, electricity_bill, gas_bill, salary_cost,
            TO_CHAR(month, 'YYYY-MM') AS month, created_at
     FROM operational_expenses${scope.clause}
     ORDER BY month DESC`,
    scope.values
  );
  res.json({ success: true, expenses: result.rows });
}

export async function upsertOperationalExpense(req, res) {
  const parsed = expenseSchema.safeParse(req.body);
  if (!parsed.success) throw new AppError("Invalid operational expense payload", 400);

  const targetUserId = getTargetUserId(req);
  const { electricity_bill, gas_bill, salary_cost, month } = parsed.data;
  const monthDate = `${month}-01`;

  const result = await query(
    `INSERT INTO operational_expenses (user_id, electricity_bill, gas_bill, salary_cost, month)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (user_id, month)
     DO UPDATE SET
       electricity_bill = EXCLUDED.electricity_bill,
       gas_bill = EXCLUDED.gas_bill,
       salary_cost = EXCLUDED.salary_cost,
       updated_at = now()
     RETURNING id, user_id, electricity_bill, gas_bill, salary_cost,
       TO_CHAR(month, 'YYYY-MM') AS month, updated_at`,
    [targetUserId, electricity_bill, gas_bill, salary_cost, monthDate]
  );

  res.json({ success: true, expense: result.rows[0] });
}

export async function deleteOperationalExpense(req, res) {
  const { id } = req.params;
  const result = await query(
    `DELETE FROM operational_expenses
     WHERE id = $1
       AND ($2::text = 'admin' OR user_id = $3)
     RETURNING id`,
    [id, req.user.role, req.user.id]
  );
  if (!result.rows[0]) throw new AppError("Expense record not found", 404);
  res.json({ success: true, message: "Operational expense deleted" });
}
