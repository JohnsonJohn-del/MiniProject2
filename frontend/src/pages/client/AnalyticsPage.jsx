import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

const colors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#3b82f6", "#1d4ed8", "#93c5fd"];

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/analytics/client");
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load analytics");
      }
    };
    load();
  }, []);

  const profitabilityData = useMemo(() => {
    if (!data) return [];
    return [
      ...(data.mostProfitable || []).map((item) => ({ name: item.recipe_name, margin: Number(item.profit_margin) })),
      ...(data.leastProfitable || []).map((item) => ({ name: item.recipe_name, margin: Number(item.profit_margin) }))
    ].slice(0, 8);
  }, [data]);

  const ingredientCostData = (data?.ingredientCostImpact || []).map((item) => ({
    name: item.ingredient_name,
    value: Number(item.cost_impact)
  }));

  return (
    <div className="space-y-8">
      <PageHeader
        title="Analytics"
        description="Track profitability distribution, ingredient cost impact, and margin movement by dish."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <article className="glass-card p-6">
          <h3 className="font-bold text-slate-900">Dish Margin Distribution</h3>
          <div className="mt-5 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={profitabilityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="margin" radius={[8, 8, 0, 0]}>
                  {profitabilityData.map((_, index) => (
                    <Cell key={index} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="glass-card p-6">
          <h3 className="font-bold text-slate-900">Ingredient Cost Impact</h3>
          <div className="mt-5 h-80">
            {ingredientCostData.length === 0 ? (
              <div className="grid h-full place-items-center text-sm text-slate-500">
                Upgrade to Premium to view full ingredient impact analytics.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ingredientCostData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60}>
                    {ingredientCostData.map((_, index) => (
                      <Cell key={index} fill={colors[index % colors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </article>
      </section>

      <section className="glass-card p-7">
        <h3 className="font-bold text-slate-900">AI Executive Insight</h3>
        <p className="mt-3 text-sm text-slate-600">{data?.aiReportSummary || "No report available yet."}</p>
      </section>
    </div>
  );
}
