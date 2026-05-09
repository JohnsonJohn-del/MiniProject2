import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Bot,
  ChefHat,
  CreditCard,
  ExternalLink,
  FlaskConical,
  LayoutDashboard,
  LineChart,
  LogIn,
  Menu as MenuIcon,
  Sparkles,
  Users,
  Wallet,
  Wheat,
  Shield,
  Zap,
  Target,
  DollarSign,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }
};

const workspaces = [
  {
    role: "client",
    title: "Client Workspace",
    tagline: "Manage your restaurant profitability",
    description: "Ingredients, recipes, operational costs, AI pricing advisor, analytics, and subscription management.",
    gradient: "from-brand-600 to-blue-600",
    shadow: "shadow-brand-500/20",
    path: "/app",
    features: [
      { icon: Wheat, label: "Ingredients & Vendors" },
      { icon: ChefHat, label: "Recipe Builder" },
      { icon: Wallet, label: "Operational Costs" },
      { icon: Sparkles, label: "AI Pricing Advisor" },
      { icon: BarChart3, label: "Analytics" },
      { icon: CreditCard, label: "Subscription" }
    ]
  },
  {
    role: "admin",
    title: "Admin Workspace",
    tagline: "Oversee platform operations",
    description: "User management, cross-tenant monitoring, AI usage analytics, and platform-wide reporting.",
    gradient: "from-violet-600 to-indigo-600",
    shadow: "shadow-violet-500/20",
    path: "/admin",
    features: [
      { icon: Users, label: "User Management" },
      { icon: ChefHat, label: "Recipe Monitoring" },
      { icon: Wheat, label: "Ingredient Oversight" },
      { icon: Bot, label: "AI Usage Logs" },
      { icon: LineChart, label: "Reports" },
      { icon: CreditCard, label: "Plan Distribution" }
    ]
  }
];

const quickLinks = [
  { path: "/", label: "Landing", icon: LayoutDashboard, color: "text-brand-600", description: "Marketing home" },
  { path: "/pricing", label: "Pricing", icon: DollarSign, color: "text-emerald-600", description: "Plan comparison" },
  { path: "/login", label: "Login", icon: LogIn, color: "text-sky-600", description: "Sign in to your account" },
  { path: "/register", label: "Register", icon: Shield, color: "text-amber-600", description: "Create a workspace" }
];

const features = [
  { icon: Target, title: "Smart Cost Engine", description: "Blend ingredient cost with operational overhead for true dish economics.", gradient: "from-brand-500 to-blue-500" },
  { icon: Sparkles, title: "AI Pricing Guidance", description: "Generate ideal price bands, margin warnings, and tactical improvements.", gradient: "from-amber-500 to-orange-500" },
  { icon: Zap, title: "Real-time Analytics", description: "Track profitability spread, ingredient impact, and revenue-risk dishes.", gradient: "from-emerald-500 to-teal-500" },
  { icon: Globe, title: "Multi-Region Support", description: "USD, EUR, GBP, INR pricing with automatic locale detection.", gradient: "from-violet-500 to-purple-500" }
];

export default function PagesDirectoryPage() {
  const { loginAsDemo, isDemo, user } = useAuth();
  const navigate = useNavigate();

  const openDemo = async (role) => {
    try {
      await loginAsDemo(role);
      navigate(role === "admin" ? "/admin" : "/app");
    } catch {}
  };

  return (
    <div className="relative">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.1),transparent_60%),radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(16,185,129,0.06),transparent_50%)]" />

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="show"
        className="relative mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-10"
      >
        <motion.div variants={fadeUp} className="text-center">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 backdrop-blur-sm"
          >
            <Sparkles size={14} /> Smart Food Costing Platform
          </motion.span>

          <motion.h1
            variants={fadeUp}
            className="mt-6 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl"
          >
            Choose your
            <span className="bg-gradient-to-r from-brand-600 to-blue-600 bg-clip-text text-transparent"> workspace</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg"
          >
            Select your role to access the full suite of profitability tools, AI insights, and management controls.
          </motion.p>
        </motion.div>

        <motion.div variants={fadeUp} className="mt-10 grid gap-6 md:grid-cols-2">
          {workspaces.map((ws) => (
            <motion.div
              key={ws.role}
              whileHover={{ y: -6, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="group relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white/90 shadow-soft backdrop-blur-sm transition-all duration-500 hover:shadow-xl"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${ws.gradient} opacity-0 transition-opacity duration-500 group-hover:opacity-[0.03]`} />
              <div className="relative p-6 sm:p-8">
                <div className={`inline-flex rounded-2xl bg-gradient-to-br ${ws.gradient} p-3 text-white shadow-lg ${ws.shadow}`}>
                  {ws.role === "admin" ? <Shield size={28} /> : <LayoutDashboard size={28} />}
                </div>
                <h2 className="mt-5 text-2xl font-bold text-slate-900">{ws.title}</h2>
                <p className="mt-1 text-sm font-medium text-slate-500">{ws.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{ws.description}</p>

                <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {ws.features.map((f) => (
                    <div key={f.label} className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700">
                      <f.icon size={14} className="text-slate-400" />
                      {f.label}
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  {user ? (
                    <Link
                      to={ws.path}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                    >
                      Open {ws.role === "admin" ? "Admin" : "Client"} Workspace <ArrowRight size={15} />
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openDemo(ws.role)}
                      className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-lg"
                    >
                      Continue as {ws.role === "admin" ? "Demo Admin" : "Demo Client"} <ArrowRight size={15} />
                    </button>
                  )}
                  <Link
                    to={ws.path === "/app" ? "/app/ingredients" : "/admin/users"}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
                  >
                    Quick Access
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="mt-16">
          <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-soft backdrop-blur-sm sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Platform Features</h3>
                <p className="mt-1 text-sm text-slate-600">Core capabilities powering your profitability intelligence.</p>
              </div>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400"
              >
                View Plans <ExternalLink size={14} />
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((f) => (
                <motion.div
                  key={f.title}
                  whileHover={{ y: -4 }}
                  className="group rounded-2xl border border-slate-200/70 bg-white p-5 transition-all duration-300 hover:border-slate-300 hover:shadow-lg"
                >
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${f.gradient} p-2.5 text-white shadow-sm`}>
                    <f.icon size={18} />
                  </div>
                  <h4 className="mt-4 font-bold text-slate-900">{f.title}</h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-600">{f.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 border-t border-slate-200 pt-6">
              <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Quick Navigation</h4>
              <div className="mt-4 flex flex-wrap gap-3">
                {quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
                  >
                    <link.icon size={15} className={link.color} />
                    {link.label}
                    <span className="text-xs font-normal text-slate-400">{link.description}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {isDemo && (
          <motion.div
            variants={scaleIn}
            className="mt-8 rounded-2xl border border-amber-200/60 bg-amber-50/80 p-5 text-center backdrop-blur-sm"
          >
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800">
              <FlaskConical size={16} /> Demo Mode Active
            </div>
            <p className="mt-1 text-sm text-amber-700">
              You are exploring the platform as a demo user. Some features may be limited.
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
