import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BarChart3, PieChart as PieChartIcon, Sparkles, AlertCircle } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

const colors = ["#0f172a", "#334155", "#64748b", "#94a3b8", "#cbd5e1", "#3b82f6", "#1d4ed8", "#93c5fd"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/analytics/client");
        setData(response.data);
      } catch (err) {
        console.warn("Unable to load analytics:", err);
        setError("Database server is waking up (Render cold start). Connection is slow or timed out.");
      } finally {
        setLoading(false);
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
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Analytics" description="Track profitability distribution, ingredient cost impact, and margin movement by dish." />

      {error ? (
        <motion.div
          variants={fadeUp}
          className="rounded-2xl border border-amber-100 bg-amber-50/50 backdrop-blur-md px-5 py-4 text-sm text-amber-900 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <span className="text-xl mt-0.5">⚠️</span>
            <div>
              <p className="font-bold text-amber-950">Connection Notice</p>
              <p className="text-xs text-amber-800/90 mt-0.5">{error}</p>
            </div>
          </div>
        </motion.div>
      ) : null}

      {loading ? (
        <section className="grid gap-6 xl:grid-cols-2">
          <SkeletonCard className="h-80" />
          <SkeletonCard className="h-80" />
        </section>
      ) : null}

      {!loading ? (
        <>
          <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
            <div className="glass-card-premium p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm">
                  <BarChart3 size={18} />
                </div>
                <h3 className="font-bold text-slate-900">Dish Margin Distribution</h3>
              </div>
              <div className="mt-5 h-80">
                {profitabilityData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                    <AlertCircle size={24} className="text-slate-300" />
                    <p>No dish margins available yet. Add recipes and menu items to track.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={profitabilityData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
                      <Bar dataKey="margin" radius={[8, 8, 0, 0]}>
                        {profitabilityData.map((_, index) => (<Cell key={index} fill={colors[index % colors.length]} />))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="glass-card-premium p-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm">
                  <PieChartIcon size={18} />
                </div>
                <h3 className="font-bold text-slate-900">Ingredient Cost Impact</h3>
              </div>
              <div className="mt-5 h-80">
                {ingredientCostData.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-slate-500">
                    <AlertCircle size={24} className="text-slate-300" />
                    <p>Upgrade to Premium to view full ingredient impact analytics.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ingredientCostData} dataKey="value" nameKey="name" outerRadius={110} innerRadius={60}>
                        {ingredientCostData.map((_, index) => (<Cell key={index} fill={colors[index % colors.length]} />))}
                      </Pie>
                      <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.section>

          <motion.section variants={fadeUp} className="glass-card-premium p-7">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2 text-white shadow-sm">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">AI Executive Insight</h3>
                <p className="text-xs text-slate-500">Automated profitability analysis</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-600">
              {data?.aiReportSummary || "No report available yet. Add more data to unlock AI-powered insights."}
            </p>
          </motion.section>
        </>
      ) : null}
    </motion.div>
  );
}
