import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

export default function SubscriptionsPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/users");
        setUsers(data.users);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load subscription distribution");
      }
    };
    load();
  }, []);

  const distribution = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        acc[user.subscription_plan] = (acc[user.subscription_plan] || 0) + 1;
        return acc;
      },
      { free: 0, pro: 0, premium: 0 }
    );
  }, [users]);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Subscription Management"
        description="Plan distribution and billing-tier adoption across client workspaces."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-4 md:grid-cols-3">
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Free</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{distribution.free}</p>
        </article>
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Pro</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{distribution.pro}</p>
        </article>
        <article className="glass-card p-6">
          <p className="text-sm text-slate-500">Premium</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{distribution.premium}</p>
        </article>
      </section>

      <section className="glass-card p-7">
        <h2 className="text-lg font-bold text-slate-900">Operational note</h2>
        <p className="mt-3 text-sm text-slate-600">
          Plan changes are managed from the Users panel for direct per-client updates and AI quota reset controls.
        </p>
      </section>
    </div>
  );
}
