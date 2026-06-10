import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, Wallet, User } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import { useCurrency } from "../../hooks/useCurrency";
import { SkeletonCard } from "../../components/ui/SkeletonCard";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
};

export default function OperationalExpensesAdminPage() {
  const { formatUsd } = useCurrency();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("created_at");
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/records/operational_expenses");
        setRecords(data.records);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load operational expense records");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const processedRecords = useMemo(() => {
    return records.map((r) => {
      const electricity = Number(r.electricity_bill || 0);
      const gas = Number(r.gas_bill || 0);
      const water = Number(r.water_bill || 0);
      const salaries = Number(r.salary_cost || 0);
      const total = electricity + gas + water + salaries;
      return {
        ...r,
        electricity,
        gas,
        water,
        salaries,
        total
      };
    });
  }, [records]);

  const filteredAndSorted = useMemo(() => {
    let result = [...processedRecords];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.month?.toLowerCase().includes(q) ||
          r.owner_name?.toLowerCase().includes(q) ||
          r.owner_email?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      // Handle nulls
      if (valA === null || valA === undefined) valA = 0;
      if (valB === null || valB === undefined) valB = 0;

      // Handle case insensitivity for string values
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

    return result;
  }, [processedRecords, search, sortField, sortAsc]);

  const formatMonth = (dateStr) => {
    if (!dateStr) return "—";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Operational Costs Monitor" description="Monitor client fixed monthly bills, utilities, and salary cost allocations." />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            placeholder="Search month or owner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl self-end sm:self-auto">
          {filteredAndSorted.length} operational records found
        </span>
      </motion.div>

      {loading ? (
        <SkeletonCard className="h-64" />
      ) : (
        <motion.div variants={fadeUp} className="glass-card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("month")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Month <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("electricity")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Electricity <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("gas")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Gas <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("water")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Water <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("salaries")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Salaries <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("total")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Total Costs <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("owner_name")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Owned By <ArrowUpDown size={12} />
                    </button>
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    <button onClick={() => handleSort("created_at")} className="flex items-center gap-1.5 hover:text-slate-900">
                      Created At <ArrowUpDown size={12} />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSorted.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-slate-500">
                      No operational expenses match your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredAndSorted.map((record, i) => (
                    <motion.tr
                      key={record.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.01 }}
                      className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-4 font-semibold text-slate-950 flex items-center gap-2">
                        <Wallet size={14} className="text-brand-500" />
                        {formatMonth(record.month)}
                      </td>
                      <td className="px-6 py-4 text-slate-700">{formatUsd(record.electricity)}</td>
                      <td className="px-6 py-4 text-slate-700">{formatUsd(record.gas)}</td>
                      <td className="px-6 py-4 text-slate-700">{formatUsd(record.water)}</td>
                      <td className="px-6 py-4 text-slate-700">{formatUsd(record.salaries)}</td>
                      <td className="px-6 py-4 font-bold text-slate-800">{formatUsd(record.total)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={13} className="text-slate-400" />
                          <div>
                            <p className="font-semibold text-slate-800">{record.owner_name}</p>
                            <p className="text-xs text-slate-500">{record.owner_email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {new Date(record.created_at).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
