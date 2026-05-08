import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BrainCog,
  Flame,
  LineChart,
  Sparkles
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  }
};

const stagger = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const valueProps = [
  {
    icon: BadgeDollarSign,
    title: "Smart Cost Engine",
    copy: "Blend ingredient cost with salary, gas, and electricity allocations for true dish economics."
  },
  {
    icon: BrainCog,
    title: "AI Pricing Guidance",
    copy: "Generate ideal price bands, margin warnings, and tactical improvements before menu changes."
  },
  {
    icon: LineChart,
    title: "Executive Analytics",
    copy: "Track profitability spread, ingredient impact, and revenue-risk dishes in one dashboard."
  },
  {
    icon: Flame,
    title: "Subscription Workflow",
    copy: "Scale from starter operations to full premium intelligence with built-in usage controls."
  }
];

const workflow = [
  "Upload vendors and ingredient prices",
  "Build recipes with quantity mappings",
  "Allocate operational overhead per month",
  "Generate AI-backed pricing recommendations",
  "Track profitability shifts in analytics"
];

export default function LandingPage() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [55, -40]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <div ref={sectionRef} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40" />
      <motion.div style={{ y: glowY }} className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-200/60 blur-[130px]" />
      <div className="pointer-events-none absolute -left-32 top-28 h-72 w-72 rounded-full bg-sky-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-24 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-24 pt-8 md:pb-32 md:pt-10">
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative grid min-h-[84vh] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="space-y-10">
            <motion.span
              variants={reveal}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700"
            >
              <Sparkles size={14} /> Hospitality Profit Intelligence Platform
            </motion.span>

            <motion.div variants={reveal} className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-extrabold tracking-[-0.03em] text-slate-900 md:text-7xl md:leading-[1.05]">
                Price every dish with confidence, not guesswork.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Smart Food Costing combines precise operational costing, AI pricing insights, and subscription-powered
                analytics so restaurant teams can protect margin under real market pressure.
              </p>
            </motion.div>

            <motion.div variants={reveal} className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                Start Free Trial <ArrowRight size={16} />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
              >
                View Pricing
              </Link>
            </motion.div>

            <motion.div variants={reveal} className="grid max-w-xl grid-cols-3 gap-3 text-sm">
              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Recipe Accuracy</p>
                <p className="mt-2 text-xl font-bold text-slate-900">98.4%</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">AI Response</p>
                <p className="mt-2 text-xl font-bold text-slate-900">&lt;2s</p>
              </div>
              <div className="rounded-2xl border border-slate-200/80 bg-white/75 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-slate-500">Margin Uplift</p>
                <p className="mt-2 text-xl font-bold text-slate-900">+21%</p>
              </div>
            </motion.div>
          </div>

          <motion.div style={{ y: cardY }} className="relative mx-auto w-full max-w-xl">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
              className="glass-card relative overflow-hidden p-6 md:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-100/80 to-transparent" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">AI Priceboard</p>
                  <h3 className="mt-2 text-xl font-bold text-slate-900">Chicken Alfredo</h3>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  Margin Safe
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Dish Cost</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">$5.42</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Ideal Price</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">$15.90</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">Projected Margin</p>
                  <p className="mt-1 text-lg font-bold text-slate-900">65.9%</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LineChart size={16} /> Weekly Margin Trend
                </div>
                <div className="flex h-24 items-end gap-2">
                  {[45, 56, 41, 66, 70, 62, 68].map((height, index) => (
                    <div
                      key={index}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-300"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="absolute -bottom-8 -left-8 hidden w-56 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-soft backdrop-blur md:block"
            >
              <p className="text-xs uppercase tracking-[0.14em] text-slate-500">AI Warning</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">Paneer Tikka margin dropped below 18%</p>
              <p className="mt-2 text-xs text-slate-500">Utility costs increased this month.</p>
            </motion.div>
          </motion.div>
        </motion.section>

        <motion.section
          variants={stagger}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-20 space-y-7"
        >
          <motion.div variants={reveal} className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Platform Story</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Built to turn kitchen data into pricing decisions.
            </h2>
          </motion.div>

          <motion.div variants={stagger} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map(({ icon: Icon, title, copy }) => (
              <motion.article
                variants={reveal}
                key={title}
                className="glass-card group p-6 transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_45px_rgba(15,23,42,0.12)]"
              >
                <div className="mb-5 inline-flex rounded-xl border border-slate-200 bg-white p-2.5 text-slate-700 transition group-hover:border-brand-200 group-hover:text-brand-700">
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy}</p>
              </motion.article>
            ))}
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="glass-card p-7 md:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Workflow</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">From cost chaos to controlled margin.</h3>
            <div className="mt-6 space-y-3">
              {workflow.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: -14 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.07, duration: 0.45 }}
                  className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="glass-card relative overflow-hidden p-7 md:p-8">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-sky-100/80 to-transparent" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live Product Preview</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">Profitability Snapshot</h3>
              <div className="mt-6 space-y-3">
                {[
                  ["Butter Chicken", "$17.00", "63.8%"],
                  ["Veg Biryani", "$11.50", "58.2%"],
                  ["Mutton Curry", "$20.00", "47.9%"],
                  ["Paneer Wrap", "$8.20", "34.4%"]
                ].map(([dish, price, margin]) => (
                  <div key={dish} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
                    <p className="text-sm font-semibold text-slate-900">{dish}</p>
                    <p className="text-sm text-slate-500">{price}</p>
                    <p className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{margin}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                AI insight: Chicken feed inflation indicates a potential 6-9% cost increase in next cycle.
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="mt-20"
        >
          <div className="glass-card relative overflow-hidden p-8 text-center md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_55%)]" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">Ready To Scale</p>
              <h3 className="mx-auto mt-3 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Launch your profitability intelligence workspace today.
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
                Start with recipe costing, grow into AI pricing automation, and run your operation with confidence.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800"
                >
                  Create Workspace <ArrowRight size={16} />
                </Link>
                <Link
                  to="/pages"
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50"
                >
                  View All Routes
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
