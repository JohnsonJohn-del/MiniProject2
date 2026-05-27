import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Sparkles, Brain, TrendingUp, AlertCircle } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import TextInput from "../../components/ui/TextInput";
import EmptyState from "../../components/ui/EmptyState";
import { useCurrency } from "../../hooks/useCurrency";
import { useAi } from "../../context/AiContext";
import { Bot, ShieldAlert } from "lucide-react";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function PricingAdvisorPage() {
  const { formatUsd } = useCurrency();
  const { aiEnabled } = useAi();
  const [recipes, setRecipes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ recipe_id: "", current_price: "", month: new Date().toISOString().slice(0, 7) });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [recipesRes, logsRes] = await Promise.all([api.get("/recipes"), api.get("/ai/usage")]);
      setRecipes(recipesRes.data?.recipes || (Array.isArray(recipesRes.data) ? recipesRes.data : []));
      setLogs(logsRes.data?.logs || (Array.isArray(logsRes.data) ? logsRes.data : []));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load AI advisor data");
    }
  };

  useEffect(() => { loadData(); }, []);

  const getAdvice = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { recipe_id: form.recipe_id, current_price: Number(form.current_price || 0), month: form.month };
      const { data } = await api.post("/ai/pricing-advice", payload);
      setResult(data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate AI recommendation");
    } finally {
      setLoading(false);
    }
  };

  if (!aiEnabled) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 rounded-3xl bg-slate-100 p-8 text-slate-300">
          <Bot size={80} strokeWidth={1} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">AI Assistance is Off</h2>
        <p className="mt-2 max-w-md text-slate-500">
          Enable "AI Assist" in the top bar to unlock automated pricing recommendations,
          margin forecasting, and profitability insights.
        </p>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="AI Pricing Advisor" description="Generate margin-focused selling price recommendations with actionable profitability insights." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={getAdvice} className="glass-card-premium space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white shadow-sm">
              <Brain size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">Generate Recommendation</h2>
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Recipe</span>
            <select value={form.recipe_id}
              onChange={(event) => setForm((prev) => ({ ...prev, recipe_id: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100" required>
              <option value="">Select recipe</option>
              {recipes?.map?.((recipe) => (<option key={recipe.id} value={recipe.id}>{recipe.recipe_name}</option>))}
            </select>
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput label="Current selling price" type="number" step="0.01" min="0" value={form.current_price}
              onChange={(event) => setForm((prev) => ({ ...prev, current_price: event.target.value }))} />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Month</span>
              <input type="month" value={form.month}
                onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100" required />
            </label>
          </div>
          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? "Generating AI Advice..." : "Generate Pricing Advice"}
          </PrimaryButton>
        </form>

        {!result ? (
          <EmptyState title="No recommendation yet" description="Select a recipe and generate your first AI-assisted pricing recommendation." />
        ) : (
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{result.recommendation.recipeName}</h3>
                  <p className="text-xs text-slate-500">Source: {result.source === "openai" ? "OpenAI GPT-4o" : "Rule-based fallback"}</p>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-1 text-xs font-semibold text-amber-700">
                  <Sparkles size={13} /> AI Insight
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Dish Cost</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatUsd(result.costing.finalDishCost)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <p className="text-[11px] uppercase tracking-wide text-brand-500 font-semibold">Dine-in Price</p>
                  <p className="mt-1 text-xl font-bold text-brand-600">{formatUsd(result.recommendation.idealSellingPrice)}</p>
                </div>
                <div className="rounded-xl border border-rose-200/80 bg-rose-50/50 p-3.5">
                  <p className="text-[11px] uppercase tracking-wide text-rose-500 font-semibold">Zomato/Swiggy</p>
                  <p className="mt-1 text-xl font-bold text-rose-600">{formatUsd(result.recommendation.aggregatorPrice)}</p>
                </div>
                <div className="rounded-xl border border-slate-200/80 bg-white p-3.5">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Target Margin</p>
                  <p className="mt-1 text-xl font-bold text-emerald-600">
                    {Number(result.recommendation.expectedMargin || 65).toFixed(0)}%
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-2.5 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-slate-400" />
                  Recommended range: <span className="font-semibold text-slate-900">{formatUsd(result.recommendation.suggestedRange.min)}</span>
                  <span className="text-slate-300">—</span>
                  <span className="font-semibold text-slate-900">{formatUsd(result.recommendation.suggestedRange.max)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-200 text-xs font-medium text-slate-700">
                    {result.recommendation.marketPosition || "Competitive"} Market
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-brand-100 text-xs font-medium text-brand-700">
                    Target Food Cost: {result.recommendation.targetFoodCostPct || 30}%
                  </span>
                </div>
              </div>
            </motion.div>

            {(result?.warnings?.length || 0) > 0 ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-6">
                <h4 className="flex items-center gap-2 font-semibold text-rose-600">
                  <AlertTriangle size={16} /> Risk Warnings
                </h4>
                <ul className="mt-3 space-y-2">
                  {(result?.warnings || []).map((warning, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                      className="flex items-start gap-2 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2.5 text-sm text-rose-700">
                      <AlertCircle size={14} className="mt-0.5 shrink-0" />
                      {warning}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            ) : null}

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card-premium p-6">
              <h4 className="font-semibold text-slate-900">Pricing Improvements</h4>
              <ul className="mt-3 space-y-2">
                {(result?.improvements || []).map((tip, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-2 rounded-xl border border-slate-200/80 bg-slate-50/50 px-3 py-2.5 text-sm text-slate-700">
                    <Sparkles size={14} className="mt-0.5 shrink-0 text-brand-500" />
                    {tip}
                  </motion.li>
                ))}
              </ul>
              <div className="mt-4 border-t border-slate-200/60 pt-3 text-xs text-slate-500">
                Daily AI usage: {result?.usage?.aiRequestsToday || 0}/{Number.isFinite(result?.usage?.aiQuotaPerDay) ? result?.usage?.aiQuotaPerDay : "Unlimited"}
              </div>
            </motion.div>
          </div>
        )}
      </motion.section>

      <motion.section variants={fadeUp} className="glass-card-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-gradient-to-br from-slate-500 to-slate-600 p-2 text-white">
              <Brain size={14} />
            </div>
            <h3 className="font-bold text-slate-900">Recent AI Usage</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{logs?.length || 0}</span>
        </div>
        {!logs || logs.length === 0 ? (
          <div className="p-6 text-center text-sm text-slate-500">No recent AI usage logs.</div>
        ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Request Count</th>
                <th className="px-6 py-3 font-semibold">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs?.map?.((log, i) => (
                <motion.tr key={log.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                  <td className="px-6 py-3.5 text-slate-700">{String(log.log_date).slice(0, 10)}</td>
                  <td className="px-6 py-3.5 font-medium text-slate-900">{log.request_count}</td>
                  <td className="px-6 py-3.5 text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </motion.section>
    </motion.div>
  );
}
