const stats = [
  { label: "Total Recipes", value: "0" },
  { label: "Avg Margin", value: "0%" },
  { label: "AI Requests Today", value: "0" },
  { label: "Monthly Cost", value: "$0" }
];

export default function ClientDashboardPage() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((card) => (
          <article key={card.label} className="glass-card p-5">
            <p className="text-sm text-slate-500">{card.label}</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{card.value}</p>
          </article>
        ))}
      </section>
      <section className="glass-card p-7">
        <h2 className="text-xl font-bold text-slate-900">Welcome to your profitability workspace</h2>
        <p className="mt-2 text-sm text-slate-600">
          Start by adding ingredient prices and creating recipes. Smart costing and analytics modules are being wired in the next phases.
        </p>
      </section>
    </div>
  );
}
