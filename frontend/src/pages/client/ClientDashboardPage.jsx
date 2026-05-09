import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ChefHat, DollarSign, ShoppingBag, TrendingUp } from "lucide-react";
import api from "../../services/api";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { useCurrency } from "../../hooks/useCurrency";

const kpiConfig = [
  { label: "Total Recipes", key: "totalRecipes", icon: ChefHat, gradient: "from-brand-500 to-blue-500", format: (v) => String(v) },
  { label: "Avg Margin", key: "avgMargin", icon: TrendingUp, gradient: "from-emerald-500 to-teal-500", format: (v) => `${Number(v || 0).toFixed(2)}%` },
  { label: "Menu Items", key: "menuItems", icon: ShoppingBag, gradient: "from-amber-500 to-orange-500", format: (v) => String(v) },
  { label: "Avg Recipe Cost", key: "avgRecipeCost", icon: DollarSign, gradient: "from-violet-500 to-purple-500", format: null }
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

export default function ClientDashboardPage() {
  const { formatUsd } = useCurrency();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/analytics/client");
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard metrics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      {error ? (
        <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">
          {error}
        </motion.p>
      ) : null}

      <motion.section variants={fadeUp} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
          : kpiConfig.map((card) => {
              const rawValue = data?.overview?.[card.key];
              const displayValue = card.format ? card.format(rawValue) : formatUsd(rawValue || 0);
              return (
                <motion.article
                  key={card.label}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="glass-card-premium group relative overflow-hidden p-5"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{card.label}</p>
                      <p className="mt-2 text-3xl font-extrabold text-slate-900">{displayValue}</p>
                    </div>
                    <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 text-white shadow-sm transition-transform group-hover:scale-110`}>
                      <card.icon size={16} />
                    </div>
                  </div>
                </motion.article>
              );
            })}
      </motion.section>

      <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Top Profitable Dishes</h3>
            <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              High Margin
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {(data?.mostProfitable || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No dish data yet</p>
            ) : (
              (data?.mostProfitable || []).map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-xs font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{dish.recipe_name}</p>
                  </div>
                  <p className="text-sm font-medium text-emerald-600">{Number(dish.profit_margin).toFixed(2)}%</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="glass-card-premium p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Margin Watchlist</h3>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700">
              Needs Attention
            </span>
          </div>
          <div className="mt-4 space-y-2">
            {(data?.leastProfitable || []).length === 0 ? (
              <p className="py-4 text-center text-sm text-slate-500">No watchlist items yet</p>
            ) : (
              (data?.leastProfitable || []).map((dish, i) => (
                <motion.div
                  key={dish.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group flex items-center justify-between rounded-xl border border-slate-200/80 bg-white px-4 py-3 transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-xs font-bold text-rose-700">
                      {i + 1}
                    </span>
                    <p className="text-sm font-semibold text-slate-900">{dish.recipe_name}</p>
                  </div>
                  <p className="text-sm font-medium text-rose-600">{Number(dish.profit_margin).toFixed(2)}%</p>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="glass-card-premium overflow-hidden p-7">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-blue-500 p-2 text-white shadow-sm">
            <ArrowUpRight size={16} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">AI Report Insight</h2>
            <p className="text-xs text-slate-500">Automated profitability analysis</p>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-slate-600">
          {data?.aiReportSummary || "Generate more data by adding ingredients, recipes, menu items, and operational costs to unlock detailed AI-powered reports."}
        </p>
      </motion.section>
    </motion.div>
  );
}
