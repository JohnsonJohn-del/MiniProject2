const adminStats = [
  { label: "Total Users", value: "0" },
  { label: "Active Plans", value: "0" },
  { label: "Recipes Created", value: "0" },
  { label: "AI Requests", value: "0" }
];

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {adminStats.map((card) => (
          <article key={card.label} className="glass-card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>
      <section className="glass-card p-7">
        <h2 className="text-xl font-bold text-slate-900">Admin Control Panel</h2>
        <p className="mt-2 text-sm text-slate-600">
          User, subscription, and monitoring modules are ready for progressive enhancement in upcoming phases.
        </p>
      </section>
    </div>
  );
}
