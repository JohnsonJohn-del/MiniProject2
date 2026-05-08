import { useEffect, useMemo, useState } from "react";
import { Calculator, Trash2 } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useCurrency } from "../../hooks/useCurrency";

const initialExpense = {
  month: "",
  electricity_bill: "",
  gas_bill: "",
  salary_cost: ""
};

const menuInitial = {
  recipe_id: "",
  selling_price: ""
};

function getCurrentMonth() {
  return new Date().toISOString().slice(0, 7);
}

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

  const recipeLookup = useMemo(
    () => Object.fromEntries(recipes.map((item) => [item.id, item.recipe_name])),
    [recipes]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [expensesRes, recipesRes, menuRes] = await Promise.all([
        api.get("/operational-expenses"),
        api.get("/recipes"),
        api.get("/menu-items")
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

  useEffect(() => {
    loadData();
  }, []);

  const saveExpense = async (event) => {
    event.preventDefault();
    await api.post("/operational-expenses", {
      ...expenseForm,
      electricity_bill: Number(expenseForm.electricity_bill || 0),
      gas_bill: Number(expenseForm.gas_bill || 0),
      salary_cost: Number(expenseForm.salary_cost || 0)
    });
    setExpenseForm({ ...initialExpense, month: expenseForm.month });
    await loadData();
  };

  const createMenuItem = async (event) => {
    event.preventDefault();
    await api.post("/menu-items", {
      recipe_id: menuForm.recipe_id,
      selling_price: Number(menuForm.selling_price || 0)
    });
    setMenuForm(menuInitial);
    await loadData();
  };

  const previewCosting = async () => {
    if (!menuForm.recipe_id) return;
    const { data } = await api.get(`/costing/recipes/${menuForm.recipe_id}?month=${expenseForm.month}`);
    setCostingPreview(data);
  };

  const deleteExpense = async (id) => {
    await api.delete(`/operational-expenses/${id}`);
    await loadData();
  };

  const deleteMenuItem = async (id) => {
    await api.delete(`/menu-items/${id}`);
    await loadData();
  };

  if (loading) {
    return <div className="glass-card p-8 text-sm text-slate-500">Loading operational costing workspace...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Operational Costing"
        description="Allocate utility and salary overhead into dish-level costing and menu margin decisions."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={saveExpense} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">Monthly Operational Expenses</h2>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Input values in {region.currency}</p>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Month</span>
            <input
              type="month"
              value={expenseForm.month}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, month: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              required
            />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Electricity bill"
              type="number"
              min="0"
              step="0.01"
              value={expenseForm.electricity_bill}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, electricity_bill: event.target.value }))}
              required
            />
            <TextInput
              label="Gas bill"
              type="number"
              min="0"
              step="0.01"
              value={expenseForm.gas_bill}
              onChange={(event) => setExpenseForm((prev) => ({ ...prev, gas_bill: event.target.value }))}
              required
            />
          </div>
          <TextInput
            label="Salary cost"
            type="number"
            min="0"
            step="0.01"
            value={expenseForm.salary_cost}
            onChange={(event) => setExpenseForm((prev) => ({ ...prev, salary_cost: event.target.value }))}
            required
          />
          <PrimaryButton type="submit">Save Monthly Cost</PrimaryButton>
        </form>

        <form onSubmit={createMenuItem} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">Menu Pricing</h2>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Recipe</span>
            <select
              value={menuForm.recipe_id}
              onChange={(event) => setMenuForm((prev) => ({ ...prev, recipe_id: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              required
            >
              <option value="">Select recipe</option>
              {recipes.map((recipe) => (
                <option key={recipe.id} value={recipe.id}>
                  {recipe.recipe_name}
                </option>
              ))}
            </select>
          </label>
          <TextInput
            label="Selling price"
            type="number"
            min="0"
            step="0.01"
            value={menuForm.selling_price}
            onChange={(event) => setMenuForm((prev) => ({ ...prev, selling_price: event.target.value }))}
            required
          />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit">Create Menu Item</PrimaryButton>
            <button
              type="button"
              onClick={previewCosting}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Calculator size={15} /> Preview Costing
            </button>
          </div>
          {costingPreview ? (
            <div className="rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-800">
              <p className="font-semibold">Costing Preview ({costingPreview.month})</p>
              <p className="mt-1">Ingredient Cost: {formatUsd(costingPreview.ingredientCost)}</p>
              <p>Operational Allocation: {formatUsd(costingPreview.operationalAllocation)}</p>
              <p>Salary Allocation: {formatUsd(costingPreview.salaryAllocation)}</p>
              <p className="mt-1 font-semibold">Final Dish Cost: {formatUsd(costingPreview.finalDishCost)}</p>
            </div>
          ) : null}
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Operational Expense Records</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Month</th>
                  <th className="px-6 py-3">Electricity</th>
                  <th className="px-6 py-3">Gas</th>
                  <th className="px-6 py-3">Salary</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 font-medium text-slate-900">{expense.month}</td>
                    <td className="px-6 py-3 text-slate-600">{formatUsd(expense.electricity_bill)}</td>
                    <td className="px-6 py-3 text-slate-600">{formatUsd(expense.gas_bill)}</td>
                    <td className="px-6 py-3 text-slate-600">{formatUsd(expense.salary_cost)}</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteExpense(expense.id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Menu Items & Margin</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-6 py-3">Recipe</th>
                  <th className="px-6 py-3">Selling Price</th>
                  <th className="px-6 py-3">Margin</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {menuItems.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 font-medium text-slate-900">{recipeLookup[item.recipe_id] || "-"}</td>
                    <td className="px-6 py-3 text-slate-600">{formatUsd(item.selling_price)}</td>
                    <td className="px-6 py-3 text-slate-600">{Number(item.profit_margin).toFixed(2)}%</td>
                    <td className="px-6 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => deleteMenuItem(item.id)}
                        className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
