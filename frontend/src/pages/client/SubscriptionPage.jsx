import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { useCurrency } from "../../hooks/useCurrency";

const planLabels = {
  free: "Free",
  pro: "Pro",
  premium: "Premium"
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

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription & Usage"
        description="Track feature access, recipe limits, and AI quota in real time."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      {!data ? (
        <div className="glass-card p-8 text-sm text-slate-500">Loading subscription metrics...</div>
      ) : (
        <section className="grid gap-6 lg:grid-cols-3">
          <article className="glass-card p-6">
            <p className="text-sm text-slate-500">Current plan</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{planLabels[data.plan] || data.plan}</p>
            <p className="mt-1 text-sm font-semibold text-brand-700">
              {formatNative(region.planPrices[data.plan] || 0)} / month
            </p>
            <p className="mt-2 text-sm text-slate-600">Upgrade to unlock more recipes, AI requests, and analytics.</p>
          </article>

          <article className="glass-card p-6">
            <p className="text-sm text-slate-500">Recipe usage</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {data.usage.recipesCreated}
              <span className="text-lg font-semibold text-slate-500">
                /{Number.isFinite(data.limits.maxRecipes) ? data.limits.maxRecipes : "Unlimited"}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">Recipes created under your current subscription.</p>
          </article>

          <article className="glass-card p-6">
            <p className="text-sm text-slate-500">AI requests today</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {data.usage.aiRequestsToday}
              <span className="text-lg font-semibold text-slate-500">
                /{Number.isFinite(data.limits.aiRequestsPerDay) ? data.limits.aiRequestsPerDay : "Unlimited"}
              </span>
            </p>
            <p className="mt-2 text-sm text-slate-600">Daily quota refreshes every midnight.</p>
          </article>
        </section>
      )}

      {data ? (
        <section className="glass-card p-6">
          <h2 className="text-lg font-bold text-slate-900">Feature access</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {Object.entries(data.features).map(([key, enabled]) => (
              <div key={key} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-sm">
                <span className={`rounded-full p-1 ${enabled ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                  <Check size={14} />
                </span>
                <span className="font-medium text-slate-700">
                  {key.replace(/([A-Z])/g, " $1").replace(/^./, (char) => char.toUpperCase())}
                </span>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
