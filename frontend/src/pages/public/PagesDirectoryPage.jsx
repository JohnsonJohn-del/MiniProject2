import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

const routeGroups = [
  {
    title: "Public Routes",
    description: "Marketing, authentication, and open-access pages.",
    routes: [
      { path: "/", label: "Landing" },
      { path: "/pricing", label: "Pricing" },
      { path: "/login", label: "Login" },
      { path: "/register", label: "Register" },
      { path: "/pages", label: "Pages Hub" }
    ]
  },
  {
    title: "Client Routes",
    description: "Restaurant workspace pages (requires client login).",
    routes: [
      { path: "/app", label: "Dashboard" },
      { path: "/app/ingredients", label: "Ingredients" },
      { path: "/app/recipes", label: "Recipes" },
      { path: "/app/operational-costs", label: "Operational Costs" },
      { path: "/app/pricing-advisor", label: "Pricing Advisor" },
      { path: "/app/analytics", label: "Analytics" },
      { path: "/app/subscription", label: "Subscription" }
    ]
  },
  {
    title: "Admin Routes",
    description: "Platform control pages (requires admin login).",
    routes: [
      { path: "/admin", label: "Overview" },
      { path: "/admin/users", label: "Users" },
      { path: "/admin/subscriptions", label: "Subscriptions" },
      { path: "/admin/recipes", label: "Recipes" },
      { path: "/admin/ingredients", label: "Ingredients" },
      { path: "/admin/ai-usage", label: "AI Usage" },
      { path: "/admin/reports", label: "Reports" }
    ]
  }
];

export default function PagesDirectoryPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
      <div className="glass-card p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Developer Navigation</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Route Directory Hub</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
          Use this internal page to quickly access all current routes across public, client, and admin surfaces.
        </p>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {routeGroups.map((group) => (
          <section key={group.title} className="glass-card p-6">
            <h2 className="text-lg font-bold text-slate-900">{group.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{group.description}</p>
            <div className="mt-5 space-y-2">
              {group.routes.map((route) => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  <span>{route.label}</span>
                  <span className="inline-flex items-center gap-2 text-xs text-slate-500">
                    {route.path}
                    <ExternalLink size={13} className="transition group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
