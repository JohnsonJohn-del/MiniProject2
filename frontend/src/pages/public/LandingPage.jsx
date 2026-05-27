import { Link } from "react-router-dom";
import {
  ArrowRight,
  BadgeDollarSign,
  BrainCog,
  FileText,
  Flame,
  LineChart,
  Scan,
  Sparkles,
  Shield,
  Upload,
  Zap,
  Target
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";


const reveal = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }
};

const scaleReveal = {
  hidden: { opacity: 0, scale: 0.9 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } }
};

const valueProps = [
  {
    icon: BadgeDollarSign,
    title: "Smart Cost Engine",
    copy: "Blend ingredient cost with salary, gas, and electricity allocations for true dish economics.",
    gradient: "from-brand-500 to-blue-500"
  },
  {
    icon: BrainCog,
    title: "AI Pricing Guidance",
    copy: "Generate ideal price bands, margin warnings, and tactical improvements before menu changes.",
    gradient: "from-accent-500 to-rose-500"
  },
  {
    icon: LineChart,
    title: "Executive Analytics",
    copy: "Track profitability spread, ingredient impact, and revenue-risk dishes in one dashboard.",
    gradient: "from-emerald-500 to-teal-500"
  },
  {
    icon: Shield,
    title: "Enterprise Ready",
    copy: "Scale operations with multi-location support, robust audit logs, and secure data storage.",
    gradient: "from-slate-700 to-slate-900"
  }
];

const workflow = [
  "Upload vendors and ingredient prices",
  "Build recipes with quantity mappings",
  "Allocate operational overhead per month",
  "Generate AI-backed pricing recommendations",
  "Track profitability shifts in analytics"
];

const fmt = (n) => "₹" + Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 });

export default function LandingPage() {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const cardY = useTransform(scrollYProgress, [0, 1], [55, -40]);
  const glowY = useTransform(scrollYProgress, [0, 1], [0, -90]);

  return (
    <div ref={sectionRef} className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.14)_1px,transparent_1px)] bg-[size:52px_52px] opacity-40" />
      <motion.div style={{ y: glowY }} className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[520px] -translate-x-1/2 rounded-full bg-brand-400/30 blur-[130px] animate-breathe" />
      <div className="liquid-blob" style={{ width: 500, height: 500, background: 'radial-gradient(circle, #a78bfa, transparent)', top: '-100px', right: '-100px', animationDelay: '0s' }} />
      <div className="liquid-blob" style={{ width: 400, height: 400, background: 'radial-gradient(circle, #f472b6, transparent)', bottom: '-50px', left: '-80px', animationDelay: '-4s' }} />
      <div className="liquid-blob" style={{ width: 300, height: 300, background: 'radial-gradient(circle, #60a5fa, transparent)', top: '40%', left: '30%', animationDelay: '-8s' }} />

      <div className="liquid-ambient relative mx-auto w-full max-w-7xl px-6 pb-24 pt-8 md:pb-32 md:pt-10">
        <motion.section
          variants={stagger}
          initial="hidden"
          animate="show"
          className="relative grid min-h-[84vh] items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]"
        >
          <div className="space-y-10">
            <motion.span
              variants={reveal}
              className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 backdrop-blur-sm"
            >
              <Sparkles size={14} /> Hospitality Profit Intelligence Platform
            </motion.span>

            <motion.div variants={reveal} className="space-y-6">
              <h1 className="max-w-3xl text-5xl font-extrabold tracking-[-0.03em] text-slate-900 md:text-7xl md:leading-[1.05]">
                Price every dish with{" "}
                <span className="text-gradient">confidence</span>
                , not guesswork.
              </h1>
              <p className="max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
                Smart Food Costing combines precise operational costing, AI pricing insights, and advanced
                analytics so restaurant teams can protect margin under real market pressure.
              </p>
            </motion.div>

            <motion.div variants={reveal} className="flex flex-wrap gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
              >
                Get Started Now <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/pages"
                className="group inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg"
              >
                Explore Workspace
              </Link>
            </motion.div>

            <motion.div variants={reveal} className="grid max-w-xl grid-cols-3 gap-3 text-sm">
              {[
                { label: "Recipe Accuracy", value: "98.4%", color: "text-brand-600" },
                { label: "AI Response", value: "<2s", color: "text-emerald-600" },
                { label: "Margin Uplift", value: "+21%", color: "text-amber-600" }
              ].map((stat) => (
                <div key={stat.label} className="glass-card p-4 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-500">{stat.label}</p>
                  <p className={`mt-2 text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </motion.div>
          </div>

          <motion.div style={{ y: cardY }} className="relative mx-auto w-full max-w-xl">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
              className="liquid-glass relative overflow-hidden p-6 md:p-7"
            >
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-brand-100/40 to-transparent" />
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
                {[
                  { label: "Dish Cost", value: fmt(150.42), color: "text-slate-900" },
                  { label: "Ideal Price", value: fmt(249), color: "text-slate-900" },

                  { label: "Projected Margin", value: "65.9%", color: "text-emerald-700" }
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-slate-200 bg-white/80 p-3 backdrop-blur-sm">
                    <p className="text-[11px] uppercase tracking-wide text-slate-500">{item.label}</p>
                    <p className={`mt-1 text-lg font-bold ${item.color}`}>{item.value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <LineChart size={16} /> Weekly Margin Trend
                </div>
                <div className="flex h-24 items-end gap-2">
                  {[45, 56, 41, 66, 70, 62, 68].map((height, index) => (
                    <motion.div
                      key={index}
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: index * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                      className="flex-1 rounded-t-md bg-gradient-to-t from-brand-600 to-brand-300"
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
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500">
                <Target size={13} /> AI Warning
              </div>
              <p className="mt-2 text-sm font-bold text-slate-900">Paneer Tikka margin dropped below 18%</p>
              <p className="mt-1 text-xs text-slate-500">Utility costs increased this month.</p>
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
              Built to turn kitchen data into{" "}
              <span className="text-gradient">pricing decisions</span>.
            </h2>
          </motion.div>

          <motion.div variants={stagger} className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {valueProps.map(({ icon: Icon, title, copy, gradient }) => (
              <motion.article
                variants={reveal}
                key={title}
                className="glow-card liquid-glass group p-6"
              >
                <div className={`mb-5 inline-flex rounded-xl bg-gradient-to-br ${gradient} p-2.5 text-white shadow-sm`}>
                  <Icon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{copy}</p>
              </motion.article>
            ))}
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
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-700">New</p>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
              Smart AI Bill &amp; Recipe{" "}
              <span className="text-gradient">Import</span>
            </h2>
            <p className="max-w-2xl text-sm text-slate-600">
              Upload vendor invoices or paste any recipe — our AI extracts ingredients, quantities, and prices automatically.
              No more manual data entry.
            </p>
          </motion.div>

          <motion.div variants={stagger} className="grid gap-5 md:grid-cols-2">
            <motion.article variants={reveal} className="liquid-glass group overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm">
                  <Upload size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Vendor Bill Import</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Upload supplier invoice or receipt image",
                  "AI extracts vendor name and line items",
                  "Review, edit, and confirm parsed data",
                  "Auto-creates vendor & purchase records"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </motion.article>

            <motion.article variants={reveal} className="liquid-glass group overflow-hidden p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm">
                  <FileText size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">AI Recipe Import</h3>
              </div>
              <div className="space-y-3">
                {[
                  "Paste any recipe text from the web or your notes",
                  "AI parses title, ingredients, and quantities",
                  "Preview, edit, and adjust before saving",
                  "Auto-creates recipe with ingredient links"
                ].map((step, i) => (
                  <div key={i} className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white/70 p-3 text-sm text-slate-700">
                    <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">{i + 1}</span>
                    {step}
                  </div>
                ))}
              </div>
            </motion.article>
          </motion.div>

          <motion.div variants={reveal} className="liquid-glass relative overflow-hidden p-6 md:p-8">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-100/30 to-transparent" />
            <div className="relative flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white shadow-sm">
                  <Scan size={20} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">From upload to structured data in seconds</h4>
                  <p className="text-xs text-slate-500">Invoice → OCR → AI Parse → Review → Save</p>
                </div>
              </div>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-slate-800 hover:shadow-lg">
                Get Started <ArrowRight size={15} />
              </Link>
            </div>
          </motion.div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-20 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
        >
          <div className="liquid-glass p-7 md:p-8">
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
                  className="group flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3.5 transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <span className="mt-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white transition-all group-hover:scale-110">
                    {index + 1}
                  </span>
                  <p className="text-sm text-slate-700">{item}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="liquid-glass relative overflow-hidden p-7 md:p-8">
            <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-brand-100/40 to-transparent" />
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Live Product Preview</p>
              <h3 className="mt-3 text-2xl font-bold text-slate-900">Profitability Snapshot</h3>
              <div className="mt-6 space-y-3">
                {[
                  ["Butter Chicken", 349, "63.8%", "bg-emerald-500"],
                  ["Veg Biryani", 289, "58.2%", "bg-brand-500"],
                  ["Mutton Curry", 499, "47.9%", "bg-amber-500"],
                  ["Paneer Tikka", 309, "54.4%", "bg-rose-500"]
                ].map(([dish, price, margin, badgeColor]) => (
                  <motion.div
                    key={dish}
                    whileHover={{ x: 4 }}
                    className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-3 backdrop-blur-sm transition-all hover:border-slate-300"
                  >
                    <p className="text-sm font-bold text-slate-900">{dish}</p>
                    <p className="text-sm text-slate-500">{fmt(price)}</p>
                    <p className={`rounded-lg ${badgeColor} px-2 py-1 text-xs font-bold text-white`}>{margin}</p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <Zap size={14} />
                  <span className="font-semibold">AI Insight:</span>
                  <span>Chicken feed inflation indicates a potential 6-9% cost increase in next cycle.</span>
                </div>
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
          <div className="liquid-glass relative overflow-hidden p-8 text-center md:p-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(139,92,246,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)] bg-[size:32px_32px]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-brand-200/60 bg-brand-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-brand-700 backdrop-blur-sm">
                <Shield size={13} /> Ready To Scale
              </div>
              <h3 className="mx-auto mt-5 max-w-3xl text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                Launch your profitability intelligence{" "}
                <span className="text-gradient-cool">workspace</span> today.
              </h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-600 md:text-base">
                Start with recipe costing, grow into AI pricing automation, and run your operation with confidence.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <Link
                  to="/register"
                  className="group inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-xl"
                >
                  Create Workspace <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/pages"
                  className="group inline-flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 transition-all hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 hover:shadow-lg"
                >
                  View Workspaces
                </Link>
              </div>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
