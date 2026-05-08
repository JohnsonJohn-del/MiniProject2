import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

export default function ReportsPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/overview");
        setOverview(data.overview);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load reports");
      }
    };
    load();
  }, []);

  const cards = [
    { label: "Ingredients Records", value: overview?.ingredients ?? 0 },
    { label: "Menu Items", value: overview?.menu_items ?? 0 },
    { label: "Operational Expenses", value: overview?.operational_expenses ?? 0 },
    { label: "AI Log Records", value: overview?.ai_logs ?? 0 }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Platform Reports"
        description="High-level system monitoring across ingredients, recipes, menu pricing, and AI activity."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="glass-card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="glass-card p-7">
        <h2 className="text-lg font-bold text-slate-900">Admin Insight</h2>
        <p className="mt-3 text-sm text-slate-600">
          {overview
            ? `The ${overview.most_used_plan} plan is currently most adopted. Monitor AI usage spikes (${overview.today_ai_requests} today) and ensure subscription mix aligns with platform profitability.`
            : "Insights will appear once platform metrics are loaded."}
        </p>
      </section>
    </div>
  );
}
