import { AnimatePresence, motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "../components/ui/Logo";
import CurrencySelector from "../components/ui/CurrencySelector";
import DemoModeChip from "../components/ui/DemoModeChip";
import { useAuth } from "../hooks/useAuth";

export default function PublicLayout() {
  const location = useLocation();
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/pricing", label: "Pricing" },
    { to: "/pages", label: "Workspace" },
    ...(user ? [] : [{ to: "/login", label: "Login" }])
  ];

  return (
    <div className="app-shell">
      <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <Logo />

          <nav className="hidden items-center gap-1 md:flex">
            <div className="flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-all hover:bg-slate-100 hover:text-slate-900"
                >
                  {link.label}
                </Link>
              ))}
              <span className="mx-2 h-5 w-px bg-slate-200" />
              <CurrencySelector compact />
              <DemoModeChip />
            </div>
            {!user && (
              <Link
                to="/register"
                className="ml-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
              >
                Get Started
              </Link>
            )}
          </nav>

          <button
            type="button"
            className="rounded-lg border border-slate-200 p-2 md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:hidden"
          >
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                >
                  {link.label}
                </Link>
              ))}
              <span className="my-2 h-px bg-slate-200" />
              <div className="flex items-center gap-3 px-3 py-2">
                <CurrencySelector compact />
                <DemoModeChip />
              </div>
              {!user && (
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white"
                >
                  Get Started
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </header>

      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12, scale: 0.995 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.997 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
