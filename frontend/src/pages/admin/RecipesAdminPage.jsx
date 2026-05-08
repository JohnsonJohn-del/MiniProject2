import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

export default function RecipesAdminPage() {
  const [records, setRecords] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/records/recipes");
        setRecords(data.records);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load recipe records");
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="Recipes Monitor" description="Review all client recipes and baseline cost values." />
      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Recipe</th>
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Total Cost</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-900">{record.recipe_name}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{record.user_id}</td>
                  <td className="px-4 py-3 text-slate-700">${Number(record.total_cost).toFixed(2)}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(record.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
