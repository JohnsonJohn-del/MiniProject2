import { AnimatePresence, motion } from "framer-motion";
import { Link, Outlet, useLocation } from "react-router-dom";
import Logo from "../components/ui/Logo";
import CurrencySelector from "../components/ui/CurrencySelector";
import DemoModeChip from "../components/ui/DemoModeChip";

export default function PublicLayout() {
  const location = useLocation();

  return (
    <div className="app-shell">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="hidden items-center gap-3 md:flex">
          <CurrencySelector compact />
          <DemoModeChip />
          <nav className="flex items-center gap-6 text-sm font-medium text-slate-600">
            <Link to="/pricing" className="transition hover:text-slate-900">Pricing</Link>
            <Link to="/pages" className="transition hover:text-slate-900">Pages</Link>
            <Link to="/login" className="transition hover:text-slate-900">Login</Link>
            <Link
              to="/register"
              className="rounded-lg bg-slate-900 px-4 py-2 text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
            >
              Get Started
            </Link>
          </nav>
        </div>
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
