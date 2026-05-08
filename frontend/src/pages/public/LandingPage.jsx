import { Link } from "react-router-dom";
import { ArrowRight, BadgeDollarSign, BrainCog, LineChart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: BadgeDollarSign,
    title: "Precision Food Costing",
    description: "Track exact dish-level cost using ingredient and operational allocations."
  },
  {
    icon: BrainCog,
    title: "AI Pricing Insights",
    description: "Get smart selling price suggestions with low-margin warnings."
  },
  {
    icon: LineChart,
    title: "Profitability Analytics",
    description: "See margin trends and identify most and least profitable dishes."
  }
];

export default function LandingPage() {
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pb-20 pt-6">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card relative overflow-hidden px-8 py-16 md:px-14"
      >
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand-100 blur-3xl" />
        <div className="relative max-w-3xl space-y-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
            <Sparkles size={14} /> Built for restaurant profitability teams
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 md:text-6xl">
            Smart Food Costing & AI Pricing Advisor
          </h1>
          <p className="text-lg text-slate-600">
            Subscription SaaS that helps hospitality businesses price smarter, protect margins, and scale decisions with data.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              to="/register"
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Start Free <ArrowRight size={16} />
            </Link>
            <Link
              to="/pricing"
              className="rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Explore Plans
            </Link>
          </div>
        </div>
      </motion.section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {features.map(({ icon: Icon, title, description }) => (
          <article key={title} className="glass-card p-6">
            <div className="mb-4 inline-flex rounded-lg bg-slate-100 p-2 text-slate-700">
              <Icon size={18} />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
