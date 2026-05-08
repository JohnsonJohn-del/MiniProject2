import { useEffect, useState } from "react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";

export default function AiUsagePage() {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/admin/ai-usage");
        setLogs(data.logs);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load AI usage");
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-8">
      <PageHeader title="AI Usage" description="Monitor AI request activity across all client workspaces." />
      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Count</th>
                <th className="px-4 py-3">Logged At</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{log.name}</p>
                    <p className="text-xs text-slate-500">{log.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{String(log.log_date).slice(0, 10)}</td>
                  <td className="px-4 py-3 text-slate-600">{log.request_count}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(log.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
