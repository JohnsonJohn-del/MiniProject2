import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Crown, Layers, Zap } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { useCurrency } from "../../hooks/useCurrency";

const planLabels = { free: "Free", pro: "Pro", premium: "Premium" };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function SubscriptionPage() {
  const { region, formatNative } = useCurrency();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadSubscription = async () => {
      try {
        const response = await api.get("/subscription/me");
        setData(response.data.subscription);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load subscription usage");
      }
    };
    loadSubscription();
  }, []);

  const planColors = {
    free: { gradient: "from-slate-400 to-slate-500", badge: "bg-slate-100 text-slate-700" },
    pro: { gradient: "from-brand-500 to-blue-500", badge: "bg-brand-50 text-brand-700" },
    premium: { gradient: "from-amber-500 to-orange-500", badge: "bg-amber-50 text-amber-700" }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Subscription & Usage" description="Track feature access, recipe limits, and AI quota in real time." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      {!data ? (
        <div className="glass-card p-8 text-center text-sm text-slate-500">Loading subscription metrics...</div>
      ) : (
        <motion.section variants={fadeUp} className="grid gap-6 lg:grid-cols-3">
          <div className="glass-card-premium relative overflow-hidden p-6">
            <div className={`absolute inset-0 bg-gradient-to-br ${planColors[data.plan]?.gradient || "from-slate-400 to-slate-500"} opacity-[0.04]`} />
            <div className="relative">
              <div className="flex items-center gap-2">
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${planColors[data.plan]?.gradient} p-2.5 text-white shadow-sm`}>
                  <Crown size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Current plan</p>
                  <p className="mt-0.5 text-2xl font-bold capitalize text-slate-900">{planLabels[data.plan] || data.plan}</p>
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">
                {formatNative(region.planPrices[data.plan] || 0)} / month
              </p>
            </div>
          </div>

          <div className="glass-card-premium p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 p-2.5 text-white shadow-sm">
                <Layers size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recipe usage</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900">
                  {data.usage.recipesCreated}
                  <span className="text-base font-semibold text-slate-400">
                    /{Number.isFinite(data.limits.maxRecipes) ? data.limits.maxRecipes : "∞"}
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Recipes created under your current subscription.</p>
          </div>

          <div className="glass-card-premium p-6">
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white shadow-sm">
                <Zap size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">AI requests today</p>
                <p className="mt-0.5 text-2xl font-bold text-slate-900">
                  {data.usage.aiRequestsToday}
                  <span className="text-base font-semibold text-slate-400">
                    /{Number.isFinite(data.limits.aiRequestsPerDay) ? data.limits.aiRequestsPerDay : "∞"}
                  </span>
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-slate-500">Daily quota refreshes every midnight.</p>
          </div>
        </motion.section>
      )}

      {data ? (
        <motion.section variants={fadeUp} className="glass-card-premium p-6">
          <h2 className="text-lg font-bold text-slate-900">Feature Access</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(data.features).map(([key, enabled]) => (
              <div key={key}
                className={`flex items-center gap-3 rounded-xl border p-3.5 text-sm transition-all ${
                  enabled ? "border-emerald-200/80 bg-emerald-50/30" : "border-slate-200/80 bg-white"
                }`}>
                <span className={`rounded-full p-1.5 ${enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <Check size={13} />
                </span>
                <span className={`font-medium ${enabled ? "text-slate-900" : "text-slate-500"}`}>
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                </span>
                {enabled ? null : (
                  <span className="ml-auto rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                    Upgrade
                  </span>
                )}
              </div>
            ))}
          </div>
        </motion.section>
      ) : null}
    </motion.div>
  );
}
