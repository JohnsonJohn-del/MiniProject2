import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

const planOptions = ["free", "pro", "premium"];

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ search: "", plan: "", status: "" });
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.search) params.append("search", filters.search);
      if (filters.plan) params.append("plan", filters.plan);
      if (filters.status) params.append("status", filters.status);

      const { data } = await api.get(`/admin/users?${params.toString()}`);
      setUsers(data.users);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users");
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const applyFilters = async (event) => {
    event.preventDefault();
    await loadUsers();
  };

  const setPlan = async (userId, subscription_plan) => {
    await api.patch(`/admin/users/${userId}/plan`, { subscription_plan });
    await loadUsers();
  };

  const toggleStatus = async (user) => {
    await api.patch(`/admin/users/${user.id}/active`, { is_active: !user.is_active });
    await loadUsers();
  };

  const resetAi = async (userId) => {
    await api.post(`/admin/users/${userId}/reset-ai`);
    await loadUsers();
  };

  return (
    <div className="space-y-8">
      <PageHeader title="Users" description="Search clients, manage plans, and control account status." />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <form onSubmit={applyFilters} className="glass-card grid gap-4 p-5 md:grid-cols-4">
        <input
          placeholder="Search name/email"
          value={filters.search}
          onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        />
        <select
          value={filters.plan}
          onChange={(event) => setFilters((prev) => ({ ...prev, plan: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">All plans</option>
          {planOptions.map((plan) => (
            <option key={plan} value={plan}>
              {plan}
            </option>
          ))}
        </select>
        <select
          value={filters.status}
          onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
        >
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Apply</button>
      </form>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Recipes</th>
                <th className="px-4 py-3">AI Used</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={user.subscription_plan}
                      onChange={(event) => setPlan(user.id, event.target.value)}
                      className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold capitalize"
                    >
                      {planOptions.map((plan) => (
                        <option key={plan} value={plan}>
                          {plan}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold">
                    <span
                      className={`rounded-full px-2 py-1 ${
                        user.is_active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {user.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{user.recipes_created}</td>
                  <td className="px-4 py-3 text-slate-600">{user.ai_requests_used}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700"
                      >
                        {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button
                        type="button"
                        onClick={() => resetAi(user.id)}
                        className="rounded-lg border border-brand-200 px-2 py-1 text-xs font-semibold text-brand-700"
                      >
                        Reset AI
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
