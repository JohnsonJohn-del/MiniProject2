import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, PencilLine, PiggyBank, Trash2, Zap, Coins, Info, Sparkles, TrendingUp, Save } from "lucide-react";
import api from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useCurrency } from "../../hooks/useCurrency";

const initialExpense = { month: "", electricity_bill: "", gas_bill: "", water_bill: "", salary_cost: "" };
const menuInitial = { recipe_id: "", selling_price: "" };

function getCurrentMonth() { return new Date().toISOString().slice(0, 7); }

const stagger = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function OperationalCostsPage() {
  const { formatUsd, region } = useCurrency();
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [expenseForm, setExpenseForm] = useState({ ...initialExpense, month: getCurrentMonth() });
  const [menuForm, setMenuForm] = useState(menuInitial);
  const [expenses, setExpenses] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [costingPreview, setCostingPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [inlineExpense, setInlineExpense] = useState(null); // row being edited inline
  const [assumedServings, setAssumedServings] = useState(5000);
  const [platformSettings, setPlatformSettings] = useState({});
  const [showOverheadModal, setShowOverheadModal] = useState(false);
  const [packagingCostInput, setPackagingCostInput] = useState(15);

  useEffect(() => {
    if (user?.packaging_cost !== undefined && user?.packaging_cost !== null) {
      setPackagingCostInput(Number(user.packaging_cost));
    }
  }, [user?.packaging_cost]);

  const savePackagingCostToProfile = async () => {
    try {
      const { data } = await api.get("/profile");
      if (data && data.profile) {
        const p = data.profile;
        let clean_platforms = [];
        if (Array.isArray(p.online_platforms)) {
          p.online_platforms.forEach(plat => {
            if (plat && typeof plat === "string" && !plat.startsWith("__pkg_cost:")) {
              clean_platforms.push(plat);
            }
          });
        }
        
        const pkgCostNum = parseFloat(packagingCostInput);
        if (!isNaN(pkgCostNum)) {
          clean_platforms.push(`__pkg_cost:${pkgCostNum.toFixed(2)}`);
        }

        await api.put("/profile", {
          ...p,
          online_platforms: clean_platforms
        });
        
        if (refreshProfile) {
          await refreshProfile();
        }
      }
    } catch (err) {
      console.error("Failed to save packaging cost to profile:", err);
      setError("Failed to save packaging cost default.");
    }
  };

  const recipeLookup = useMemo(() => Object.fromEntries((recipes || []).map((item) => [item.id, item.recipe_name])), [recipes]);

  const sortedExpenses = useMemo(() => {
    return [...expenses].sort((a, b) => b.month.localeCompare(a.month));
  }, [expenses]);

  const userPlatforms = useMemo(() => {
    return (user?.online_platforms && user.online_platforms.length > 0)
      ? user.online_platforms
      : ["Zomato", "Swiggy"];
  }, [user?.online_platforms]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [expensesRes, recipesRes, menuRes] = await Promise.all([
        api.get("/operational-expenses"), api.get("/recipes"), api.get("/menu-items")
      ]);
      setExpenses(expensesRes.data?.expenses || (Array.isArray(expensesRes.data) ? expensesRes.data : []));
      setRecipes(recipesRes.data?.recipes || (Array.isArray(recipesRes.data) ? recipesRes.data : []));
      setMenuItems(menuRes.data?.menuItems || (Array.isArray(menuRes.data) ? menuRes.data : []));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load costing workspace");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const saveExpense = async (event) => {
    event.preventDefault();
    if (user?.subscription_plan === "free") {
      navigate("/pricing");
      return;
    }
    try {
      await api.post("/operational-expenses", {
        ...expenseForm,
        electricity_bill: Number(expenseForm.electricity_bill || 0),
        gas_bill: Number(expenseForm.gas_bill || 0),
        water_bill: Number(expenseForm.water_bill || 0),
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
    if (user?.subscription_plan === "free") {
      navigate("/pricing");
      return;
    }
    try {
      await api.post("/menu-items", { recipe_id: menuForm.recipe_id, selling_price: Number(menuForm.selling_price || 0) });
      setMenuForm(menuInitial);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create menu item");
    }
  };

  const previewCosting = async (recipeId) => {
    const id = recipeId || menuForm.recipe_id;
    if (!id) return;
    try {
      setCostingPreview(null); // reset before fetching
      const { data } = await api.get(`/costing/recipes/${id}?month=${expenseForm.month}`);
      setCostingPreview(data);
      if (data && data.finalDishCost) {
        const suggestedDineIn = Math.round(data.finalDishCost * 3);
        setMenuForm((prev) => ({ ...prev, selling_price: suggestedDineIn.toString() }));
        
        const userPlatforms = (user?.online_platforms && user.online_platforms.length > 0)
          ? user.online_platforms
          : ["Zomato", "Swiggy"];
          
        const initialSettings = {};
        userPlatforms.forEach(platform => {
          let defaultComm = 20;
          if (platform.toLowerCase().includes("zomato")) defaultComm = 22;
          else if (platform.toLowerCase().includes("swiggy")) defaultComm = 20;
          else if (platform.toLowerCase().includes("deliveroo")) defaultComm = 25;
          else if (platform.toLowerCase().includes("uber")) defaultComm = 30;
          else if (platform.toLowerCase().includes("talabat")) defaultComm = 25;
          else if (platform.toLowerCase().includes("foodpanda")) defaultComm = 22;
          else if (platform.toLowerCase().includes("other")) defaultComm = 15;
          
          let markup = 1.25;
          if (platform.toLowerCase().includes("swiggy")) markup = 1.22;
          else if (platform.toLowerCase().includes("other")) markup = 1.15;
          
          initialSettings[platform] = {
            price: Math.round(suggestedDineIn * markup).toString(),
            commission: defaultComm
          };
        });
        setPlatformSettings(initialSettings);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate costing preview");
    }
  };

  const handleDineInPriceChange = (val) => {
    setMenuForm((prev) => ({ ...prev, selling_price: val }));
    const num = Number(val || 0);
    const userPlatforms = (user?.online_platforms && user.online_platforms.length > 0)
      ? user.online_platforms
      : ["Zomato", "Swiggy"];

    if (num > 0) {
      setPlatformSettings(prev => {
        const next = { ...prev };
        userPlatforms.forEach(platform => {
          let markup = 1.25;
          if (platform.toLowerCase().includes("swiggy")) markup = 1.22;
          else if (platform.toLowerCase().includes("other")) markup = 1.15;
          
          next[platform] = {
            ...next[platform],
            price: Math.round(num * markup).toString()
          };
        });
        return next;
      });
    } else {
      setPlatformSettings(prev => {
        const next = { ...prev };
        userPlatforms.forEach(platform => {
          next[platform] = {
            ...next[platform],
            price: ""
          };
        });
        return next;
      });
    }
  };

  const handlePlatformPriceChange = (platform, val) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        price: val
      }
    }));
  };

  const handlePlatformCommissionChange = (platform, val) => {
    setPlatformSettings(prev => ({
      ...prev,
      [platform]: {
        ...prev[platform],
        commission: Number(val)
      }
    }));
  };

  const deleteExpense = async (id) => { 
    try {
      await api.delete(`/operational-expenses/${id}`); 
      await loadData(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  const saveInlineExpense = async () => {
    if (!inlineExpense) return;
    try {
      await api.post("/operational-expenses", {
        month: inlineExpense.month,
        electricity_bill: Number(inlineExpense.electricity_bill || 0),
        gas_bill: Number(inlineExpense.gas_bill || 0),
        water_bill: Number(inlineExpense.water_bill || 0),
        salary_cost: Number(inlineExpense.salary_cost || 0)
      });
      setInlineExpense(null);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update expense");
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

  // Get expense matching costingPreview month or latest fallback
  const previewMonth = costingPreview?.month ? costingPreview.month.slice(0, 7) : "";
  const selectedMonthExpense = expenses.find(e => e.month === previewMonth) || sortedExpenses[0];

  const electricity = Number(selectedMonthExpense?.electricity_bill || 0);
  const gas = Number(selectedMonthExpense?.gas_bill || 0);
  const water = Number(selectedMonthExpense?.water_bill || 0);
  const salary = Number(selectedMonthExpense?.salary_cost || 0);

  const totalMonthlyOpex = electricity + gas + water;
  const totalMonthlySalary = salary;

  const servings = Number(assumedServings || 5000) || 1; // avoid divide by zero

  // Operational overhead per serving
  const operationalAllocation = (totalMonthlyOpex > 0)
    ? (totalMonthlyOpex / servings)
    : ((costingPreview?.ingredientCost || 0) * 0.15);

  // Salary overhead per serving
  const salaryAllocation = (totalMonthlySalary > 0)
    ? (totalMonthlySalary / servings)
    : ((costingPreview?.ingredientCost || 0) * 0.10);

  const packagingCost = Number(packagingCostInput || 0);

  const finalDishCost = (costingPreview?.ingredientCost || 0) + packagingCost + operationalAllocation + salaryAllocation;

  const dineInPrice = Number(menuForm.selling_price || 0);
  const dineInProfit = dineInPrice - finalDishCost;
  const dineInMargin = dineInPrice > 0 ? (dineInProfit / dineInPrice) * 100 : 0;



  const getMarginProgressColor = (margin) => {
    if (margin < 30) return "bg-rose-500";
    if (margin < 50) return "bg-amber-500";
    return "bg-emerald-500";
  };

  return (
    <motion.div key="content" variants={stagger} initial="hidden" animate="show" className="space-y-8">
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
            <TextInput label="Water bill" type="number" min="0" step="0.01" value={expenseForm.water_bill}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, water_bill: event.target.value }))} required />
            <TextInput label="Salary cost" type="number" min="0" step="0.01" value={expenseForm.salary_cost}
                onChange={(event) => setExpenseForm((prev) => ({ ...prev, salary_cost: event.target.value }))} required />
          </div>
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
              onChange={(event) => {
                const newId = event.target.value;
                setMenuForm((prev) => ({ ...prev, recipe_id: newId }));
                if (newId) {
                  previewCosting(newId);
                } else {
                  setCostingPreview(null);
                }
              }}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
              required>
              <option value="">Select recipe</option>
              {recipes?.map?.((recipe) => (<option key={recipe.id} value={recipe.id}>{recipe.recipe_name}</option>))}
            </select>
          </label>
          <TextInput label="Selling price" type="number" min="0" step="0.01" value={menuForm.selling_price}
            onChange={(event) => handleDineInPriceChange(event.target.value)} required />
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit">Create Menu Item</PrimaryButton>
            <button type="button" onClick={() => previewCosting()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50">
              <Calculator size={15} /> Preview Costing
            </button>
          </div>
        </form>
      </motion.section>

      {/* ── INTERACTIVE PRICING & MARGINS SIMULATOR ── */}
      {costingPreview && (
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="show"
          className="glass-card-premium p-6 space-y-6 border border-brand-200 bg-gradient-to-b from-white to-brand-50/10"
        >
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white shadow-sm">
                <Sparkles size={18} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Interactive Pricing & Margin Simulator
                </h2>
                <p className="text-xs text-slate-500">
                  Simulating margin, profit, and platforms for {recipeLookup[menuForm.recipe_id] || "Selected Recipe"} ({costingPreview.month})
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setCostingPreview(null);
                setMenuForm(menuInitial);
              }}
              className="text-xs font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Reset Selection
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* COLUMN 1: Costing Details & Breakdown */}
            <div className="space-y-4 lg:border-r lg:border-slate-200/80 lg:pr-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coins size={16} className="text-brand-500" /> Volume & Overhead Setup
              </h3>

              {/* Assumed Servings Input */}
              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                <label className="block">
                  <span className="text-xs font-semibold text-slate-700">Overall Monthly Servings (All Dishes)</span>
                  <input
                    type="number"
                    min="1"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200 mt-1 font-bold"
                    value={assumedServings}
                    onChange={(e) => setAssumedServings(Math.max(1, Number(e.target.value) || 1))}
                  />
                </label>
                <p className="text-[10px] text-slate-500 leading-normal">
                  Input the total combined volume of all dishes and drinks served at the cafe per month. This distributes fixed overheads across all transactions.
                </p>
              </div>
              
              <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Ingredient Cost</span>
                  <span className="font-semibold text-slate-900">{formatUsd(costingPreview.ingredientCost || 0)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600">Packaging Cost</span>
                  <div className="flex items-center gap-2">
                    <div className="relative rounded-lg border border-slate-200 bg-white px-2 py-1 flex items-center gap-1 w-24">
                      <span className="text-xs text-slate-400">₹</span>
                      <input
                        id="simulator_packaging_cost"
                        name="simulator_packaging_cost"
                        type="number"
                        min="0"
                        step="0.01"
                        value={packagingCostInput}
                        onChange={(e) => setPackagingCostInput(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-transparent text-right text-xs font-bold outline-none text-slate-900 focus:ring-1 focus:ring-brand-200"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={savePackagingCostToProfile}
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition"
                      title="Save as workspace default"
                    >
                      <Save size={14} />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600">Operational Overhead</span>
                  <span className="font-semibold text-slate-900">{formatUsd(operationalAllocation)}</span>
                </div>
                <div className="flex justify-between text-sm items-center">
                  <span className="text-slate-600">Salary Overhead</span>
                  <span className="font-semibold text-slate-900">{formatUsd(salaryAllocation)}</span>
                </div>
                <div className="border-t border-slate-200/80 pt-3 flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900">Total Serving Cost</span>
                    <button
                      type="button"
                      onClick={() => setShowOverheadModal(true)}
                      className="text-slate-400 hover:text-brand-500 hover:bg-slate-100 p-0.5 rounded transition"
                      title="View overhead allocation details"
                    >
                      <Info size={14} />
                    </button>
                  </div>
                  <span className="text-lg font-black text-brand-600">{formatUsd(finalDishCost)}</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: Dine-In Simulator */}
            <div className="space-y-4 lg:border-r lg:border-slate-200/80 lg:pr-6">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp size={16} className="text-brand-500" /> Dine-in Channel Simulator
              </h3>

              <div className="space-y-4">
                {/* Input / Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-700">Simulated Dine-in Price</span>
                    <span className={`font-bold ${
                      dineInPrice > Math.round(finalDishCost / 0.20) ? "text-rose-600 font-black" : "text-brand-600"
                    }`}>{formatUsd(dineInPrice)}</span>
                  </div>
                  <input
                    type="range"
                    min={Math.round(finalDishCost)}
                    max={Math.round(finalDishCost * 6)}
                    value={dineInPrice}
                    onChange={(e) => handleDineInPriceChange(e.target.value)}
                    className="w-full accent-brand-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min ({formatUsd(Math.round(finalDishCost))})</span>
                    <span className="text-rose-500 font-bold">Ceiling ({formatUsd(Math.round(finalDishCost / 0.20))})</span>
                    <span>Max ({formatUsd(Math.round(finalDishCost * 6))})</span>
                  </div>
                  
                  {dineInPrice > Math.round(finalDishCost / 0.20) && (
                    <div className="text-[11px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-lg p-2.5 flex items-start gap-1.5 mt-2">
                      <span className="shrink-0 text-xs">⚠️</span>
                      <span>
                        <strong>Demand Risk:</strong> Simulated price exceeds the maximum viable ceiling ({formatUsd(Math.round(finalDishCost / 0.20))}). Customers may resist buying this dish.
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={menuForm.selling_price}
                      onChange={(e) => handleDineInPriceChange(e.target.value)}
                      className={`w-full rounded-lg border bg-white px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-200 ${
                        dineInPrice > Math.round(finalDishCost / 0.20) ? "border-rose-300 ring-rose-100 ring-2" : "border-slate-200"
                      }`}
                    />
                  </div>
                </div>

                {/* Range Recommendation */}
                <div className="rounded-lg bg-brand-50/50 border border-brand-100 p-2.5 text-[11px] text-brand-800">
                  <span className="font-semibold">Recommended Price Range: </span>
                  {formatUsd(Math.round(finalDishCost / 0.4))} — {formatUsd(Math.round(finalDishCost / 0.25))}
                  <div className="mt-1 text-slate-500">
                    Based on standard 25% to 40% Target Food Cost.
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border border-slate-200/60 p-2 bg-slate-50 text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Net Profit</p>
                    <p className="mt-0.5 text-sm font-bold text-slate-900">
                      {formatUsd(Math.max(0, dineInProfit))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200/60 p-2 bg-slate-50 flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] uppercase tracking-wide text-slate-500">Profit Margin</p>
                    <div className="mt-0.5 flex items-center gap-1.5 justify-center">
                      <span className={`h-2.5 w-2.5 rounded-full ${
                        dineInMargin > 50 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                        dineInMargin > 30 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                        "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                      }`} />
                      <span className={`text-sm font-extrabold ${
                        dineInMargin > 50 ? "text-emerald-600" : dineInMargin > 30 ? "text-amber-500" : "text-rose-500"
                      }`}>
                        {dineInMargin.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUMN 3: Delivery Platforms Simulator (Stacked) */}
            <div className="space-y-6 max-h-[600px] overflow-y-auto pr-2">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 sticky top-0 bg-white/95 backdrop-blur-sm py-1 z-10">
                <Sparkles size={16} className="text-rose-500" /> Delivery Platform Economics
              </h3>

              {userPlatforms.map(platform => {
                const settings = platformSettings[platform] || { price: "", commission: 20 };
                const priceNum = Number(settings.price || 0);
                const commission = settings.commission;
                const payout = priceNum * (1 - commission / 100);
                const profit = payout - finalDishCost;
                const margin = payout > 0 ? (profit / payout) * 100 : 0;
                
                let markup = 1.25;
                if (platform.toLowerCase().includes("swiggy")) markup = 1.22;
                else if (platform.toLowerCase().includes("other")) markup = 1.15;
                
                const ceiling = Math.round((finalDishCost / 0.20) * markup);

                return (
                  <div key={platform} className="rounded-xl border border-slate-200 bg-white p-4 space-y-3.5 shadow-sm">
                    {/* Platform Title */}
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">{platform} Channel</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500">Comm:</span>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={commission}
                          onChange={(e) => handlePlatformCommissionChange(platform, e.target.value)}
                          className="w-10 rounded border border-slate-200 bg-slate-50 px-1 py-0.5 text-center text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-300"
                        />
                        <span className="text-[10px] text-slate-500">%</span>
                      </div>
                    </div>

                    {/* Price Input & Ceiling Warning */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-medium text-slate-600">Simulated Price</span>
                        <div className="relative rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 flex items-center gap-1 w-28">
                          <span className="text-xs text-slate-400">₹</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={settings.price}
                            onChange={(e) => handlePlatformPriceChange(platform, e.target.value)}
                            className={`w-full bg-transparent text-right text-xs font-bold outline-none ${
                              priceNum > ceiling ? "text-rose-600 font-extrabold" : "text-slate-800"
                            }`}
                          />
                        </div>
                      </div>
                      
                      {priceNum > ceiling ? (
                        <div className="text-[10px] font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-md p-2 flex items-start gap-1 leading-normal">
                          <span>⚠️</span>
                          <span>Exceeds customer willingness ({formatUsd(ceiling)}).</span>
                        </div>
                      ) : (
                        <div className="text-[9px] text-slate-400 text-right">
                          Ceiling: <span className="font-semibold text-slate-500">{formatUsd(ceiling)}</span>
                        </div>
                      )}
                    </div>

                    {/* Payout & Margins Grid with solid background badges */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-100">
                      <div className="rounded-lg bg-slate-50 p-1.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">Payout</p>
                        <p className="text-xs font-bold text-slate-800">{formatUsd(payout)}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-1.5">
                        <p className="text-[9px] uppercase tracking-wide text-slate-400">Profit</p>
                        <p className="text-xs font-bold text-slate-800">{formatUsd(Math.max(0, profit))}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 p-1.5 flex flex-col items-center justify-center">
                        <p className="text-[9px] uppercase tracking-wide text-slate-400 mb-0.5">Margin</p>
                        <div className="flex items-center gap-1.5">
                          <span className={`h-2.5 w-2.5 rounded-full ${
                            margin > 50 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                            margin > 30 ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]" :
                            "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
                          }`} />
                          <span className={`text-xs font-extrabold ${
                            margin > 50 ? "text-emerald-600" :
                            margin > 30 ? "text-amber-600" :
                            "text-rose-600"
                          }`}>
                            {margin.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Save Action */}
          <div className="pt-4 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-xs text-slate-500">
              Saving will create a new item in your Menu List with the simulated Dine-in Price: <strong>{formatUsd(Number(menuForm.selling_price || 0))}</strong>.
            </div>
            <button
              type="button"
              onClick={createMenuItem}
              className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2.5 text-sm font-bold text-white hover:from-emerald-600 hover:to-teal-700 transition shadow-sm flex items-center gap-2"
            >
              <Calculator size={15} /> Save Menu Item
            </button>
          </div>
        </motion.div>
      )}

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Operational Expense Records</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{expenses?.length || 0}</span>
          </div>
          {!expenses || expenses.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No operational expenses recorded.</div>
          ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-3 font-semibold">Month</th>
                  <th className="px-6 py-3 font-semibold">Electricity</th>
                  <th className="px-6 py-3 font-semibold">Gas</th>
                  <th className="px-6 py-3 font-semibold">Water</th>
                  <th className="px-6 py-3 font-semibold">Salary</th>
                  <th className="px-6 py-3 text-right font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {expenses?.map?.((expense, i) => (
                  inlineExpense?.id === expense.id ? (
                    // ── Inline edit row ──
                    <tr key={expense.id} className="border-b border-brand-100 bg-brand-50/40">
                      <td className="px-3 py-2">
                        <input type="month"
                          className="w-full rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
                          value={inlineExpense.month}
                          onChange={e => setInlineExpense(p => ({ ...p, month: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0"
                          className="w-full rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                          value={inlineExpense.electricity_bill}
                          onChange={e => setInlineExpense(p => ({ ...p, electricity_bill: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0"
                          className="w-full rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                          value={inlineExpense.gas_bill}
                          onChange={e => setInlineExpense(p => ({ ...p, gas_bill: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0"
                          className="w-full rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                          value={inlineExpense.water_bill}
                          onChange={e => setInlineExpense(p => ({ ...p, water_bill: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input type="number" step="0.01" min="0"
                          className="w-full rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                          value={inlineExpense.salary_cost}
                          onChange={e => setInlineExpense(p => ({ ...p, salary_cost: e.target.value }))}
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-1">
                          <button type="button" onClick={saveInlineExpense}
                            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-brand-700 transition">Update</button>
                          <button type="button" onClick={() => setInlineExpense(null)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition">Cancel</button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    // ── Normal row ──
                    <motion.tr key={expense.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                      <td className="px-6 py-3.5 font-medium text-slate-900">{expense.month}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.electricity_bill || 0)}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.gas_bill || 0)}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.water_bill || 0)}</td>
                      <td className="px-6 py-3.5 text-slate-600">{formatUsd(expense.salary_cost || 0)}</td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex justify-end gap-1">
                          <button type="button"
                            onClick={() => setInlineExpense({ id: expense.id, month: expense.month, electricity_bill: expense.electricity_bill, gas_bill: expense.gas_bill, water_bill: expense.water_bill || 0, salary_cost: expense.salary_cost })}
                            className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:bg-brand-50 hover:text-brand-600 hover:border-brand-200"><PencilLine size={14} /></button>
                          <button type="button" onClick={() => deleteExpense(expense.id)}
                            className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                ))}

              </tbody>
            </table>
          </div>
          )}
        </div>

        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Menu Items & Margin</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{menuItems?.length || 0}</span>
          </div>
          {!menuItems || menuItems.length === 0 ? (
            <div className="p-6 text-center text-sm text-slate-500">No menu items created.</div>
          ) : (
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
                {menuItems?.map?.((item, i) => (
                  <motion.tr key={item.id || i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                    <td className="px-6 py-3.5 font-medium text-slate-900">{recipeLookup[item.recipe_id] || "-"}</td>
                    <td className="px-6 py-3.5 text-slate-600">{formatUsd(item.selling_price || 0)}</td>
                    <td className="px-6 py-3.5">
                      <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                        Number(item.profit_margin || 0) > 50 ? "bg-emerald-50 text-emerald-700" :
                        Number(item.profit_margin || 0) > 30 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700"
                      }`}>
                        {Number(item.profit_margin || 0).toFixed(2)}%
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
          )}
        </div>
      </motion.section>

      {/* Overhead Explanation Modal */}
      {showOverheadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Overlay background */}
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setShowOverheadModal(false)}
          />
          {/* Modal box */}
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <Info className="text-brand-500" size={18} />
                <h3 className="font-bold text-slate-900 text-base">Overhead Allocation Details</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowOverheadModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition font-bold"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4 text-xs sm:text-sm text-slate-600">
              <p className="leading-relaxed">
                To calculate the exact cost of serving a single dish, your monthly operational expenses and staff salaries are allocated on a per-dish basis.
              </p>
              
              <div className="space-y-3 rounded-xl bg-slate-50 p-4 border border-slate-100 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900 mb-1">Overall Monthly Servings (All Dishes)</h4>
                  <p className="text-slate-500 leading-normal">
                    This represents the <strong>total overall servings of all dishes/drinks combined</strong> sold in your cafe per month. This volume is used to distribute fixed monthly bills.
                  </p>
                </div>
                
                <div className="border-t border-slate-200/60 pt-2.5">
                  <h4 className="font-bold text-slate-900 mb-1">Operational Overhead Allocation</h4>
                  <p className="text-slate-500 leading-normal">
                    Electricity ({formatUsd(electricity)}) + Gas ({formatUsd(gas)}) + Water ({formatUsd(water)}) divided by overall monthly servings ({servings.toLocaleString()}).
                    {totalMonthlyOpex === 0 && <span className="text-amber-600 font-medium"> (No expenses logged; using 15% ingredient cost fallback)</span>}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-2.5">
                  <h4 className="font-bold text-slate-900 mb-1">Salary Allocation</h4>
                  <p className="text-slate-500 leading-normal">
                    Total salary costs ({formatUsd(salary)}) divided by overall monthly servings ({servings.toLocaleString()}).
                    {totalMonthlySalary === 0 && <span className="text-amber-600 font-medium"> (No salaries logged; using 10% ingredient cost fallback)</span>}
                  </p>
                </div>

                <div className="border-t border-slate-200/60 pt-2.5">
                  <h4 className="font-bold text-slate-900 mb-1">Packaging Cost</h4>
                  <p className="text-slate-500 leading-normal">
                    A fixed standard packaging cost of {formatUsd(15)} per serving.
                  </p>
                </div>
              </div>
              
              <p className="text-[11px] text-slate-400 leading-relaxed italic border-l-2 border-slate-200 pl-2">
                Note: If overall monthly servings drop, the overhead cost per serving increases because fixed costs are shared over fewer sales.
              </p>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowOverheadModal(false)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
