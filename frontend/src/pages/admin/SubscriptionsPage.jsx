import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Crown, CreditCard, Users as UsersIcon } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

const planConfig = {
  free: { gradient: "from-slate-400 to-slate-500", icon: UsersIcon, badge: "bg-slate-100 text-slate-700" },
  pro: { gradient: "from-brand-500 to-blue-500", icon: CreditCard, badge: "bg-brand-50 text-brand-700" },
  premium: { gradient: "from-amber-500 to-orange-500", icon: Crown, badge: "bg-amber-50 text-amber-700" }
};

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
    return users.reduce((acc, user) => {
      acc[user.subscription_plan] = (acc[user.subscription_plan] || 0) + 1;
      return acc;
    }, { free: 0, pro: 0, premium: 0 });
  }, [users]);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Subscription Management" description="Plan distribution and billing-tier adoption across client workspaces." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-4 md:grid-cols-3">
        {Object.entries(distribution).map(([plan, count]) => {
          const config = planConfig[plan] || planConfig.free;
          return (
            <motion.div key={plan}
              whileHover={{ y: -4, scale: 1.01 }}
              className="glass-card-premium relative overflow-hidden p-6"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-[0.04]`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wide text-slate-500 capitalize">{plan}</p>
                  <p className="mt-2 text-4xl font-extrabold text-slate-900">{count}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {users.length > 0 ? `${((count / users.length) * 100).toFixed(1)}% of clients` : "No clients yet"}
                  </p>
                </div>
                <div className={`inline-flex rounded-xl bg-gradient-to-br ${config.gradient} p-3 text-white shadow-sm`}>
                  {<config.icon size={20} />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.section>

      <motion.section variants={fadeUp} className="glass-card-premium p-7">
        <h2 className="text-lg font-bold text-slate-900">Plan Management</h2>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Plan changes are managed from the Users panel for direct per-client updates and AI quota reset controls.
          Use the <strong>Users</strong> section to adjust individual subscription tiers, activate or deactivate accounts,
          and reset daily AI usage limits.
        </p>
      </motion.section>
    </motion.div>
  );
}
