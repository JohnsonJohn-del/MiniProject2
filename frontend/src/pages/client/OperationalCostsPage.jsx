import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, PiggyBank, Trash2, Zap } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useCurrency } from "../../hooks/useCurrency";

const initialExpense = { month: "", electricity_bill: "", gas_bill: "", salary_cost: "" };
const menuInitial = { recipe_id: "", selling_price: "" };

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function OperationalCostsPage() {
  const { formatUsd, region } = useCurrency();
  const [expenseForm, setExpenseForm] = useState({ ...initialExpense, month: getCurrentMonth() });
  const [menuForm, setMenuForm] = useState(menuInitial);
  const [expenses, setExpenses] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [costingPreview, setCostingPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const recipeLookup = useMemo(() => Object.fromEntries(recipes.map((item) => [item.id, item.recipe_name])), [recipes]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [expensesRes, recipesRes, menuRes] = await Promise.all([
        api.get("/operational-expenses"), api.get("/recipes"), api.get("/menu-items")
      ]);
      setExpenses(expensesRes.data.expenses);
      setRecipes(recipesRes.data.recipes);
      setMenuItems(menuRes.data.menuItems);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load costing workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveExpense = async (event) => {
    event.preventDefault();
    try {
      await api.post("/operational-expenses", {
        ...expenseForm,
        electricity_bill: Number(expenseForm.electricity_bill || 0),
        gas_bill: Number(expenseForm.gas_bill || 0),
        salary_cost: Number(expenseForm.salary_cost || 0)
      });
      setExpenseForm({ ...initialExpense, month: expenseForm.month });
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save operational expense");
    }
  };

  const createMenuItem = async (event) => {
    event.preventDefault();
    try {
      await api.post("/menu-items", { recipe_id: menuForm.recipe_id, selling_price: Number(menuForm.selling_price || 0) });
      setMenuForm(menuInitial);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create menu item");
    }
  };

  const previewCosting = async () => {
    if (!menuForm.recipe_id) return;
    try {
      const { data } = await api.get(`/costing/recipes/${menuForm.recipe_id}?month=${expenseForm.month}`);
      setCostingPreview(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate costing preview");
    }
  };

  const deleteExpense = async (id) => { 
    try {
      await api.delete(`/operational-expenses/${id}`); 
      await loadData(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const deleteMenuItem = async (id) => { 
    try {
      await api.delete(`/menu-items/${id}`); 
      await loadData(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete menu item");
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-72 animate-pulse rounded-3xl bg-slate-200/60" />)}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Operational Costing" description="Allocate utility and salary overhead into dish-level costing and menu margin decisions." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={saveExpense} className="glass-card-premium space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-2.5 text-white shadow-sm">
              <PiggyBank size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Monthly Operational Expenses</h2>
          </div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input values in {region.currency}</p>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Month</span>
            <input
              type="month" value={expenseForm.month}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, month: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Electricity bill" type="number" min="0" step="0.01" value={expenseForm.electricity_bill}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, electricity_bill: event.target.value }))} required />
            <TextInput label="Gas bill" type="number" min="0" step="0.01" value={expenseForm.gas_bill}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, gas_bill: event.target.value }))} required />
          </div>
          <TextInput label="Salary cost" type="number" min="0" step="0.01" value={expenseForm.salary_cost}
            onChange={(event) => setExpenseForm((prev) => ({ ...prev, salary_cost: event.target.value }))} required />
          <PrimaryButton type="submit">Save Monthly Cost</PrimaryButton>
        </form>

        <form onSubmit={createMenuItem} className="glass-card-premium space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm">
              <Calculator size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Menu Pricing</h2>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Recipe</span>
            <select value={menuForm.recipe_id}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, recipe_id: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              required>
              <option value="">Select recipe</option>
              {recipes.map((recipe) => (<option key={recipe.id} value={recipe.id}>{recipe.recipe_name}</option>))}
            </select>
          </label>
          <TextInput label="Selling price" type="number" min="0" step="0.01" value={menuForm.selling_price}
            onChange={(event) => setMenuForm((prev) => ({ ...prev, selling_price: event.target.value }))} required />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit">Create Menu Item</PrimaryButton>
            <button type="button" onClick={previewCosting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Calculator size={15} /> Preview Costing
            </button>
          </div>
          {costingPreview ? (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-brand-200/80 bg-brand-50/80 p-4 text-sm text-brand-800 backdrop-blur-sm">
              <p className="flex items-center gap-2 font-bold"><Zap size={14} /> Costing Preview ({costingPreview.month})</p>
              <div className="mt-2 space-y-1">
                <p>Ingredient Cost: <span className="font-semibold">{formatUsd(costingPreview.ingredientCost)}</span></p>
                <p>Operational Allocation: <span className="font-semibold">{formatUsd(costingPreview.operationalAllocation)}</span></p>
                <p>Salary Allocation: <span className="font-semibold">{formatUsd(costingPreview.salaryAllocation)}</span></p>
                <p className="mt-2 border-t border-brand-200/60 pt-2 font-bold">Final Dish Cost: {formatUsd(costingPreview.finalDishCost)}</p>
              </div>
            </motion.div>
          ) : null}
        </form>
      </motion.section>

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Operational Expense Records</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{expenses.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-semibold">Month</th>
                  <th className="px-6 py-3 font-semibold">Electricity</th>
                  <th className="px-6 py-3 font-semibold">Gas</th>
                  <th className="px-6 py-3 font-semibold">Salary</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense, i) => (
                  <motion.tr key={expense.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{expense.month}</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.electricity_bill)}</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.gas_bill)}</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.salary_cost)}</td>
                    <td className="px-6 py-3.5 text-right">
                      <button type="button" onClick={() => deleteExpense(expense.id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Menu Items & Margin</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{menuItems.length}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-semibold">Recipe</th>
                  <th className="px-6 py-3 font-semibold">Selling Price</th>
                  <th className="px-6 py-3 font-semibold">Margin</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item, i) => (
                  <motion.tr key={item.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{recipeLookup[item.recipe_id] || "-"}</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatUsd(item.selling_price)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        Number(item.profit_margin) > 50 ? "bg-emerald-50 text-emerald-700" :
                        Number(item.profit_margin) > 30 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {Number(item.profit_margin).toFixed(2)}%
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <button type="button" onClick={() => deleteMenuItem(item.id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
