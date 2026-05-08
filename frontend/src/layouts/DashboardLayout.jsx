import { Link, NavLink, Outlet } from "react-router-dom";
import {
  BarChart3,
  ChefHat,
  CreditCard,
  LogOut,
  Menu,
  Sparkles,
  Wallet,
  Wheat,
  Users,
  Bot
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import Logo from "../components/ui/Logo";

const clientLinks = [
  { to: "/app", label: "Dashboard", icon: BarChart3 },
  { to: "/app/ingredients", label: "Ingredients", icon: Wheat },
  { to: "/app/recipes", label: "Recipes", icon: ChefHat },
  { to: "/app/operational-costs", label: "Operational Costs", icon: Wallet },
  { to: "/app/pricing-advisor", label: "Pricing Advisor", icon: Sparkles },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/subscription", label: "Subscription", icon: CreditCard }
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
  { to: "/admin/recipes", label: "Recipes", icon: ChefHat },
  { to: "/admin/ingredients", label: "Ingredients", icon: Wheat },
  { to: "/admin/ai-usage", label: "AI Usage", icon: Bot },
  { to: "/admin/reports", label: "Reports", icon: Sparkles }
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const links = user?.role === "admin" ? adminLinks : clientLinks;

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-10 bg-slate-900/30 md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}
        <aside
          className={`fixed z-20 h-full w-72 border-r border-slate-200 bg-white p-5 transition duration-200 md:static md:translate-x-0 ${
            open ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-10">
            <Logo />
          </div>
          <nav className="space-y-2">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? "bg-slate-900 text-white"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button
            type="button"
            onClick={logout}
            className="mt-8 flex w-full items-center gap-3 rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            <LogOut size={16} /> Sign out
          </button>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-8">
            <button
              type="button"
              className="rounded-lg border border-slate-200 p-2 md:hidden"
              onClick={() => setOpen((prev) => !prev)}
            >
              <Menu size={18} />
            </button>
            <p className="text-sm font-semibold text-slate-700">
              {user?.role === "admin" ? "Admin Panel" : "Client Workspace"}
            </p>
            <Link to="/pricing" className="text-sm text-slate-600 hover:text-slate-900">
              Plans
            </Link>
          </header>
          <main className="flex-1 p-4 md:p-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
