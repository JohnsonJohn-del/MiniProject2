import { useEffect, useState } from "react";
import { AlertTriangle, Sparkles } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import TextInput from "../../components/ui/TextInput";
import EmptyState from "../../components/ui/EmptyState";
import { useCurrency } from "../../hooks/useCurrency";

export default function PricingAdvisorPage() {
  const { formatUsd } = useCurrency();
  const [recipes, setRecipes] = useState([]);
  const [logs, setLogs] = useState([]);
  const [form, setForm] = useState({ recipe_id: "", current_price: "", month: new Date().toISOString().slice(0, 7) });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      const [recipesRes, logsRes] = await Promise.all([api.get("/recipes"), api.get("/ai/usage")]);
      setRecipes(recipesRes.data.recipes);
      setLogs(logsRes.data.logs);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load AI advisor data");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getAdvice = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = {
        recipe_id: form.recipe_id,
        current_price: Number(form.current_price || 0),
        month: form.month
      };
      const { data } = await api.post("/ai/pricing-advice", payload);
      setResult(data);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to generate AI recommendation");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="AI Pricing Advisor"
        description="Generate margin-focused selling price recommendations with actionable profitability insights."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <form onSubmit={getAdvice} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">Generate Recommendation</h2>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Recipe</span>
            <select
              value={form.recipe_id}
              onChange={(event) => setForm((prev) => ({ ...prev, recipe_id: event.target.value }))}
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

          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Current selling price"
              type="number"
              step="0.01"
              min="0"
              value={form.current_price}
              onChange={(event) => setForm((prev) => ({ ...prev, current_price: event.target.value }))}
            />
            <label className="block space-y-2">
              <span className="text-sm font-medium text-slate-700">Month</span>
              <input
                type="month"
                value={form.month}
                onChange={(event) => setForm((prev) => ({ ...prev, month: event.target.value }))}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                required
              />
            </label>
          </div>

          <PrimaryButton type="submit" disabled={loading} className="w-full">
            {loading ? "Generating AI Advice..." : "Generate Pricing Advice"}
          </PrimaryButton>
        </form>

        {!result ? (
          <EmptyState
            title="No recommendation yet"
            description="Select a recipe and generate your first AI-assisted pricing recommendation."
          />
        ) : (
          <div className="space-y-4">
            <article className="glass-card p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{result.recommendation.recipeName}</h3>
                  <p className="text-sm text-slate-500">Source: {result.source === "openai" ? "OpenAI" : "Rule-based fallback"}</p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                  <Sparkles size={13} /> AI Insight
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Final Dish Cost</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatUsd(result.costing.finalDishCost)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Suggested Price</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{formatUsd(result.recommendation.idealSellingPrice)}</p>
                </div>
                <div className="rounded-xl border border-slate-200 p-3">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Current Margin</p>
                  <p className="mt-1 text-xl font-bold text-slate-900">{Number(result.recommendation.currentMargin).toFixed(2)}%</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-slate-600">
                Recommended range: {formatUsd(result.recommendation.suggestedRange.min)} - {formatUsd(result.recommendation.suggestedRange.max)}
              </p>
            </article>

            {result.warnings.length > 0 ? (
              <article className="glass-card p-6">
                <h4 className="flex items-center gap-2 font-semibold text-rose-600">
                  <AlertTriangle size={16} /> Risk Warnings
                </h4>
                <ul className="mt-3 space-y-2 text-sm text-slate-700">
                  {result.warnings.map((warning) => (
                    <li key={warning} className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2">
                      {warning}
                    </li>
                  ))}
                </ul>
              </article>
            ) : null}

            <article className="glass-card p-6">
              <h4 className="font-semibold text-slate-900">Pricing Improvements</h4>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {result.improvements.map((tip) => (
                  <li key={tip} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    {tip}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-xs text-slate-500">
                Daily AI usage: {result.usage.aiRequestsToday}/
                {Number.isFinite(result.usage.aiQuotaPerDay) ? result.usage.aiQuotaPerDay : "Unlimited"}
              </p>
            </article>
          </div>
        )}
      </section>

      <section className="glass-card overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4">
          <h3 className="font-bold text-slate-900">Recent AI Usage</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Request Count</th>
                <th className="px-6 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-6 py-3 text-slate-700">{String(log.log_date).slice(0, 10)}</td>
                  <td className="px-6 py-3 text-slate-700">{log.request_count}</td>
                  <td className="px-6 py-3 text-slate-500">{new Date(log.created_at).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
