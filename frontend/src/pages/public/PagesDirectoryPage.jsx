import { Link, useNavigate } from "react-router-dom";
import { BadgeCheck, ExternalLink, Lock, Unlock } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

const routeGroups = [
  {
    title: "Public Routes",
    description: "Marketing, authentication, and open-access pages.",
    routes: [
      { path: "/", label: "Landing", description: "Product launch page", auth: "public" },
      { path: "/pricing", label: "Pricing", description: "Plan comparison", auth: "public" },
      { path: "/login", label: "Login", description: "Sign-in form", auth: "public" },
      { path: "/register", label: "Register", description: "Account creation", auth: "public" },
      { path: "/pages", label: "Pages Hub", description: "Developer navigation", auth: "public" }
    ]
  },
  {
    title: "Client Routes",
    description: "Restaurant workspace pages (requires client login).",
    routes: [
      { path: "/app", label: "Dashboard", description: "KPI and profitability snapshot", auth: "client" },
      { path: "/app/ingredients", label: "Ingredients", description: "Vendor and ingredient pricing", auth: "client" },
      { path: "/app/recipes", label: "Recipes", description: "Recipe builder and cost map", auth: "client" },
      { path: "/app/operational-costs", label: "Operational Costs", description: "Overhead allocation and menu margin", auth: "client" },
      { path: "/app/pricing-advisor", label: "Pricing Advisor", description: "AI suggestions and warnings", auth: "client" },
      { path: "/app/analytics", label: "Analytics", description: "Charts and executive insight", auth: "client" },
      { path: "/app/subscription", label: "Subscription", description: "Plan usage and limits", auth: "client" }
    ]
  },
  {
    title: "Admin Routes",
    description: "Platform control pages (requires admin login).",
    routes: [
      { path: "/admin", label: "Overview", description: "Platform-wide KPIs", auth: "admin" },
      { path: "/admin/users", label: "Users", description: "User and plan controls", auth: "admin" },
      { path: "/admin/subscriptions", label: "Subscriptions", description: "Plan distribution", auth: "admin" },
      { path: "/admin/recipes", label: "Recipes", description: "Cross-tenant records", auth: "admin" },
      { path: "/admin/ingredients", label: "Ingredients", description: "Ingredient monitoring", auth: "admin" },
      { path: "/admin/ai-usage", label: "AI Usage", description: "AI request logs", auth: "admin" },
      { path: "/admin/reports", label: "Reports", description: "Operational reports", auth: "admin" }
    ]
  },
  {
    title: "Experimental Components",
    description: "Internal UX and demo-only utility surfaces.",
    routes: [
      { path: "/pages", label: "Route Hub", description: "Navigation and demo launcher", auth: "public" }
    ]
  }
];

export default function PagesDirectoryPage() {
  const { loginAsDemo, isDemo } = useAuth();
  const navigate = useNavigate();
  const [loadingDemo, setLoadingDemo] = useState("");

  const openDemo = async (role) => {
    setLoadingDemo(role);
    try {
      await loginAsDemo(role);
      navigate(role === "admin" ? "/admin" : "/app");
    } finally {
      setLoadingDemo("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-16 pt-8">
      <div className="glass-card p-8 md:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-700">Developer Navigation</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">Route Directory Hub</h1>
        <p className="mt-3 max-w-2xl text-sm text-slate-600 md:text-base">
          Use this internal page to quickly access all current routes across public, client, and admin surfaces.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => openDemo("client")}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            disabled={loadingDemo === "client"}
          >
            {loadingDemo === "client" ? "Opening..." : "Continue as Demo Client"}
          </button>
          <button
            type="button"
            onClick={() => openDemo("admin")}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
            disabled={loadingDemo === "admin"}
          >
            {loadingDemo === "admin" ? "Opening..." : "Continue as Demo Admin"}
          </button>
          {isDemo ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
              <BadgeCheck size={13} /> Demo mode active
            </span>
          ) : null}
        </div>
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
                  className="group rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p>{route.label}</p>
                      <p className="mt-1 text-xs font-medium text-slate-500">{route.description}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-500">
                      {route.auth === "public" ? <Unlock size={11} /> : <Lock size={11} />}
                      {route.auth}
                    </span>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs text-slate-500">
                    {route.path}
                    <ExternalLink size={13} className="transition group-hover:translate-x-0.5" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
