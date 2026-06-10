import { motion } from "framer-motion";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  BarChart3,
  ChefHat,
  CreditCard,
  FileText,
  LogOut,
  Menu,
  Sparkles,
  Wallet,
  Wheat,
  Users,
  Bot,
  X,
  LineChart,
  UserCircle2,
  Layers
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useAi } from "../context/AiContext";
import Logo from "../components/ui/Logo";
import DemoModeChip from "../components/ui/DemoModeChip";
import ErrorBoundary from "../components/ui/ErrorBoundary";
import Toggle from "../components/ui/Toggle";

const clientLinks = [
  { to: "/app", label: "Dashboard", icon: BarChart3 },
  { to: "/app/menu-engineering", label: "Profitability Studio", icon: LineChart },
  { to: "/app/ingredients", label: "Ingredients", icon: Wheat },
  { to: "/app/recipes", label: "Recipes", icon: ChefHat },
  { to: "/app/import", label: "Smart Import", icon: FileText, ai: true },
  { to: "/app/operational-costs", label: "Operational Costs", icon: Wallet },
  { to: "/app/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/app/profile", label: "Profile Settings", icon: UserCircle2 }
];

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: BarChart3 },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/recipes", label: "Recipes", icon: ChefHat },
  { to: "/admin/ingredients", label: "Ingredients", icon: Wheat },
  { to: "/admin/menu-items", label: "Menu Items", icon: Layers },
  { to: "/admin/operational-costs", label: "Operational Costs", icon: Wallet },
  { to: "/admin/ai-usage", label: "AI Usage", icon: Bot },
  { to: "/admin/reports", label: "Reports", icon: Sparkles }
];

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const { aiEnabled, toggleAi } = useAi();
  const { user, logout } = useAuth();
  
  const links = user?.role === "admin" 
    ? adminLinks 
    : clientLinks.filter(l => !l.ai || aiEnabled);

  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // This is async but we don't need to await it for the UI to redirect
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        {open ? (
          <button
            type="button"
            className="fixed inset-0 z-10 bg-slate-900/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <aside
          className={`fixed z-20 flex h-full w-72 flex-col border-r border-white/30 bg-white/80 shadow-glass backdrop-blur-xl transition-all duration-300 md:static md:translate-x-0 ${
            open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5">
            <Logo />
            <button
              type="button"
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 md:hidden"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
          </div>

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-6">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-400">
              {user?.role === "admin" ? "Admin Panel" : "Client Workspace"}
            </p>
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-md"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`
                }
                onClick={() => setOpen(false)}
              >
                <Icon size={16} className="transition-transform group-hover:scale-110" />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-100 p-3">
            <button
              type="button"
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-rose-50 hover:text-rose-600"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
        </aside>

        <div className="flex flex-1 flex-col">
          <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/30 bg-white/60 px-4 py-3 shadow-glass backdrop-blur-xl md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 md:hidden"
                onClick={() => setOpen((prev) => !prev)}
              >
                <Menu size={18} />
              </button>
              <div className="hidden items-center gap-3 md:flex">
                <div className="h-6 w-px bg-slate-200" />
                <DemoModeChip />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-2xl bg-slate-100/80 px-3 py-1.5 backdrop-blur-md">
                <Bot size={14} className={aiEnabled ? "text-brand-600" : "text-slate-400"} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">AI Assist</span>
                <Toggle 
                  enabled={aiEnabled} 
                  onChange={toggleAi}
                  className="scale-75"
                />
              </div>

              {/* User identity pill */}
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                <UserCircle2 size={16} className="text-brand-500" />
                <span className="hidden max-w-[140px] truncate text-xs font-semibold text-slate-700 sm:block">
                  {user?.email}
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="hidden items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-rose-50 hover:text-rose-600 md:flex"
              >
                <LogOut size={13} /> Sign out
              </button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-8">
              <ErrorBoundary>
                <Outlet />
              </ErrorBoundary>
          </main>
        </div>
      </div>
    </div>
  );
}
