import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, CreditCard, ShoppingBag, Zap, Activity, Crown, Layers } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const kpiConfig = [
  { label: "Total Users", key: "total_users", icon: Activity, gradient: "from-brand-500 to-violet-500" },
  { label: "Paid Subscriptions", key: "paid_subscriptions", icon: Crown, gradient: "from-emerald-500 to-teal-500" },
  { label: "Total Recipes", key: "total_recipes", icon: ShoppingBag, gradient: "from-amber-500 to-orange-500" },
  { label: "AI Requests Today", key: "today_ai_requests", icon: Zap, gradient: "from-violet-500 to-purple-500" }
];

const secondaryConfig = [
  { label: "Active users", key: "active_users", icon: Activity, gradient: "from-sky-500 to-cyan-500" },
  { label: "Most used plan", key: "most_used_plan", icon: Layers, gradient: "from-rose-500 to-pink-500", format: (v) => String(v || "free").replace(/^./, (c) => c.toUpperCase()) },
  { label: "Total AI requests", key: "total_ai_requests", icon: BarChart3, gradient: "from-indigo-500 to-violet-500" }
];

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

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Admin Overview" description="Monitor platform growth, usage volume, and subscription performance in one place." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
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

      <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 3 }).map((_, index) => <SkeletonCard key={index} className="h-24" />)
          : secondaryConfig.map((card) => (
              <div key={card.label} className="glass-card-premium p-5">
                <div className="flex items-center gap-3">
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${card.gradient} p-2.5 text-white shadow-sm`}>
                    <card.icon size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{card.label}</p>
                    <p className="mt-0.5 text-2xl font-bold text-slate-900">
                      {card.format ? card.format(overview?.[card.key]) : overview?.[card.key] ?? 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
      </motion.section>
    </motion.div>
  );
}
