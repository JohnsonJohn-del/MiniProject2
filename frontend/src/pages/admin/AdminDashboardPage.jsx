import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, CreditCard, ShoppingBag, Zap, Activity, Crown, Layers, Wheat, Wallet } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#6366f1"];

const kpiConfig = [
  { label: "Total Users", key: "total_users", icon: Activity, gradient: "from-brand-500 to-blue-500" },
  { label: "Paid Subscriptions", key: "paid_subscriptions", icon: Crown, gradient: "from-emerald-500 to-teal-500" },
  { label: "Total Recipes", key: "total_recipes", icon: ShoppingBag, gradient: "from-amber-500 to-orange-500" },
  { label: "Total Ingredients", key: "ingredients", icon: Wheat, gradient: "from-sky-500 to-cyan-500" },
  { label: "Menu Items", key: "menu_items", icon: Layers, gradient: "from-violet-500 to-indigo-500" },
  { label: "Operational Expenses", key: "operational_expenses", icon: Wallet, gradient: "from-pink-500 to-rose-500" },
  { label: "AI Requests Today", key: "today_ai_requests", icon: Zap, gradient: "from-yellow-500 to-amber-500" },
  { label: "Total AI Requests", key: "total_ai_requests", icon: BarChart3, gradient: "from-purple-500 to-indigo-500" }
];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/overview");
        setOverview(data.overview);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load admin analytics");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const planChartData = useMemo(() => {
    if (!overview?.plan_counts) return [];
    return Object.entries(overview.plan_counts).map(([name, value]) => ({
      name: name.toUpperCase(),
      value
    }));
  }, [overview]);

  const activityChartData = useMemo(() => {
    if (!overview) return [];
    return [
      { name: "Recipes", count: overview.total_recipes || 0 },
      { name: "Ingredients", count: overview.ingredients || 0 },
      { name: "Menu Items", count: overview.menu_items || 0 },
      { name: "Expenses", count: overview.operational_expenses || 0 }
    ];
  }, [overview]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Admin Overview" description="Monitor platform growth, usage volume, and subscription performance in one place." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading
          ? Array.from({ length: 8 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
          : kpiConfig.map((card) => (
              <motion.article
                key={card.label}
                whileHover={{ y: -4, scale: 1.01 }}
                className="glass-card-premium relative overflow-hidden p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{card.label}</p>
                    <p className="mt-2 text-3xl font-extrabold text-slate-900">
                      {overview?.[card.key] ?? 0}
                    </p>
                  </div>
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 text-white shadow-sm`}>
                    <card.icon size={16} />
                  </div>
                </div>
              </motion.article>
            ))}
      </motion.section>

      {!loading && (
        <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-2">
          {/* Plan Mix Pie Chart */}
          <div className="glass-card-premium p-6">
            <h3 className="font-bold text-slate-900">User Plan Distribution</h3>
            <div className="mt-5 h-80 flex items-center justify-center">
              {planChartData.length === 0 ? (
                <p className="text-sm text-slate-500">No plan data available</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={planChartData} dataKey="value" nameKey="name" outerRadius={100} innerRadius={60}>
                      {planChartData.map((_, index) => (<Cell key={index} fill={colors[index % colors.length]} />))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Activity comparison Bar Chart */}
          <div className="glass-card-premium p-6">
            <h3 className="font-bold text-slate-900">Platform Data Volumetrics</h3>
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activityChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 8px 32px rgba(0,0,0,0.08)" }} />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {activityChartData.map((_, index) => (<Cell key={index} fill={colors[(index + 3) % colors.length]} />))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
}
