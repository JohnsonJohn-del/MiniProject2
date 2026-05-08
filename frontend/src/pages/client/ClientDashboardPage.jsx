import { useEffect, useState } from "react";
import api from "../../services/api";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

export default function ClientDashboardPage() {
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

  const stats = [
    { label: "Total Recipes", value: data?.overview?.totalRecipes ?? 0 },
    { label: "Avg Margin", value: `${Number(data?.overview?.avgMargin || 0).toFixed(2)}%` },
    { label: "Menu Items", value: data?.overview?.menuItems ?? 0 },
    { label: "Avg Recipe Cost", value: `$${Number(data?.overview?.avgRecipeCost || 0).toFixed(2)}` }
  ];

  return (
    <div className="space-y-8">
      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} className="h-28" />)
          : stats.map((card) => (
              <article key={card.label} className="glass-card p-5">
                <p className="text-sm text-slate-500">{card.label}</p>
                <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
              </article>
            ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Top Profitable Dishes</h3>
          <div className="mt-4 space-y-3">
            {(data?.mostProfitable || []).map((dish) => (
              <div key={dish.id} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{dish.recipe_name}</p>
                <p className="mt-1 text-xs text-slate-500">Margin {Number(dish.profit_margin).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </article>

        <article className="glass-card p-6">
          <h3 className="text-lg font-bold text-slate-900">Margin Watchlist</h3>
          <div className="mt-4 space-y-3">
            {(data?.leastProfitable || []).map((dish) => (
              <div key={dish.id} className="rounded-xl border border-slate-200 px-4 py-3">
                <p className="text-sm font-semibold text-slate-900">{dish.recipe_name}</p>
                <p className="mt-1 text-xs text-slate-500">Margin {Number(dish.profit_margin).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="glass-card p-7">
        <h2 className="text-xl font-bold text-slate-900">AI Report Insight</h2>
        <p className="mt-3 text-sm text-slate-600">{data?.aiReportSummary || "Generate more data for detailed AI reports."}</p>
      </section>
    </div>
  );
}
