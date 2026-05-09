import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, RotateCcw, ToggleLeft, Users as UsersIcon } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

const planOptions = ["free", "pro", "premium"];

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
};

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

  useEffect(() => { loadUsers(); }, []);

  const applyFilters = async (event) => { event.preventDefault(); await loadUsers(); };

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
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Users" description="Search clients, manage plans, and control account status." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.form variants={fadeUp} onSubmit={applyFilters} className="glass-card-premium grid gap-4 p-5 md:grid-cols-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search name/email" value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100" />
        </div>
        <select value={filters.plan} onChange={(event) => setFilters((prev) => ({ ...prev, plan: event.target.value }))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400">
          <option value="">All plans</option>
          {planOptions.map((plan) => (<option key={plan} value={plan}>{plan}</option>))}
        </select>
        <select value={filters.status} onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-brand-400">
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <button className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800">Apply</button>
      </motion.form>

      <motion.div variants={fadeUp} className="glass-card-premium overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-lg bg-gradient-to-br from-brand-500 to-violet-500 p-2 text-white shadow-sm">
              <UsersIcon size={15} />
            </div>
            <h3 className="font-bold text-slate-900">Client Directory</h3>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{users.length}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 font-semibold">Client</th>
                <th className="px-4 py-3 font-semibold">Plan</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Recipes</th>
                <th className="px-4 py-3 font-semibold">AI Used</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
                  className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <select value={user.subscription_plan} onChange={(event) => setPlan(user.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold capitalize outline-none transition focus:border-brand-400">
                      {planOptions.map((plan) => (<option key={plan} value={plan}>{plan}</option>))}
                    </select>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                      user.is_active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                    }`}>{user.is_active ? "Active" : "Inactive"}</span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600">{user.recipes_created}</td>
                  <td className="px-4 py-3.5 text-slate-600">{user.ai_requests_used}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => toggleStatus(user)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100">
                        <ToggleLeft size={12} /> {user.is_active ? "Deactivate" : "Activate"}
                      </button>
                      <button type="button" onClick={() => resetAi(user.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 px-2.5 py-1.5 text-xs font-semibold text-brand-700 transition hover:bg-brand-50">
                        <RotateCcw size={12} /> Reset AI
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
