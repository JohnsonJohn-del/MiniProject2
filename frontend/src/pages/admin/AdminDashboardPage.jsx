import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/overview");
        setOverview(data.overview);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load admin analytics");
      }
    };
    load();
  }, []);

  const adminStats = [
    { label: "Total Users", value: overview?.total_users ?? 0 },
    { label: "Paid Subscriptions", value: overview?.paid_subscriptions ?? 0 },
    { label: "Total Recipes", value: overview?.total_recipes ?? 0 },
    { label: "AI Requests Today", value: overview?.today_ai_requests ?? 0 }
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        title="Admin Overview"
        description="Monitor platform growth, usage volume, and subscription performance in one place."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((card) => (
          <article key={card.label} className="glass-card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Active users</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{overview?.active_users ?? 0}</p>
        </article>
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Most used plan</p>
          <p className="mt-2 text-2xl font-bold capitalize text-slate-900">{overview?.most_used_plan ?? "free"}</p>
        </article>
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Total AI requests</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{overview?.total_ai_requests ?? 0}</p>
        </article>
      </section>
    </div>
  );
}
