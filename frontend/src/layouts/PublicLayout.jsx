import { Link, Outlet } from "react-router-dom";
import Logo from "../components/ui/Logo";

export default function PublicLayout() {
  return (
    <div className="app-shell">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <Link to="/pricing" className="hover:text-slate-900">Pricing</Link>
          <Link to="/login" className="hover:text-slate-900">Login</Link>
          <Link to="/register" className="rounded-lg bg-slate-900 px-4 py-2 text-white">Get Started</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
