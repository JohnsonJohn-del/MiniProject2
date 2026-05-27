import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LineChart, Sparkles, AlertCircle, ArrowUpRight, ArrowDownRight, 
  Search, Filter, ChevronDown, CheckCircle2, TrendingUp, DollarSign,
  Utensils, LayoutGrid, PieChart, Activity
} from "lucide-react";
import api from "../../services/api";

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0 }
};

export default function MenuEngineeringPage() {
  const [data, setData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [filterMatrix, setFilterMatrix] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/engineering");
        if (response.data?.success) {
          setData(response.data.data);
          setInsights(response.data.insights);
          setSummary(response.data.summary);
        }
      } catch (err) {
        console.error("Error fetching engineering data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  const filteredData = data.filter(item => {
    if (filterMatrix !== "All" && item.matrixClass !== filterMatrix) return false;
    if (searchQuery && !item.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">Profitability Studio</h1>
        <p className="mt-2 text-slate-600">Advanced menu engineering and true cost intelligence.</p>
      </motion.div>

      {/* SUMMARY CARDS */}
      <motion.div 
        variants={containerVariants} initial="hidden" animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 text-brand-600">
            <div className="rounded-lg bg-brand-50 p-2"><LineChart size={20} /></div>
            <h3 className="font-semibold text-slate-700">Avg Margin</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{summary?.avgMargin}%</p>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 text-emerald-600">
            <div className="rounded-lg bg-emerald-50 p-2"><TrendingUp size={20} /></div>
            <h3 className="font-semibold text-slate-700">Stars (High Margin/Pop)</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{summary?.starsCount}</p>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 text-amber-600">
            <div className="rounded-lg bg-amber-50 p-2"><PieChart size={20} /></div>
            <h3 className="font-semibold text-slate-700">Avg Food Cost</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{summary?.avgFoodCost}%</p>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3 text-rose-600">
            <div className="rounded-lg bg-rose-50 p-2"><Activity size={20} /></div>
            <h3 className="font-semibold text-slate-700">Dogs (Underperformers)</h3>
          </div>
          <p className="mt-4 text-3xl font-bold text-slate-900">{summary?.dogsCount}</p>
        </motion.div>
      </motion.div>

      {/* AI INSIGHTS */}
      <motion.div variants={itemVariants} initial="hidden" animate="show" className="rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm">
        <div className="flex items-center gap-2 font-bold text-brand-700 mb-4">
          <Sparkles size={20} />
          <h2>AI Profitability Insights</h2>
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          {insights.map((insight, idx) => (
            <div key={idx} className="flex items-start gap-3 rounded-xl bg-white p-4 shadow-sm border border-slate-100">
              {insight.type === "positive" && <CheckCircle2 className="mt-0.5 text-emerald-500" size={18} />}
              {insight.type === "warning" && <AlertCircle className="mt-0.5 text-amber-500" size={18} />}
              {insight.type === "info" && <Sparkles className="mt-0.5 text-blue-500" size={18} />}
              {insight.type === "negative" && <TrendingUp className="mt-0.5 text-rose-500 rotate-180" size={18} />}
              <p className="text-sm text-slate-700 leading-relaxed">{insight.message}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* FILTERS */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search dishes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-500" />
          <select
            value={filterMatrix}
            onChange={(e) => setFilterMatrix(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 outline-none transition hover:bg-slate-50 focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
          >
            <option value="All">All Matrix Classes</option>
            <option value="Star">Stars (High Margin/Pop)</option>
            <option value="Plow Horse">Plow Horses (Low Margin/High Pop)</option>
            <option value="Puzzle">Puzzles (High Margin/Low Pop)</option>
            <option value="Dog">Dogs (Low Margin/Pop)</option>
          </select>
        </div>
      </div>

      {/* DISHES LIST */}
      <div className="space-y-6">
        <AnimatePresence>
          {filteredData.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="glass-card overflow-hidden rounded-2xl border border-slate-200/60 bg-white"
            >
              {/* TOP ROW: Title & Margin */}
              <div className="flex flex-col justify-between border-b border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:items-center">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                    <span className={
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                      (item.profitBadge === "Excellent" ? "bg-emerald-100 text-emerald-700" :
                      item.profitBadge === "Good" ? "bg-blue-100 text-blue-700" :
                      item.profitBadge === "Moderate" ? "bg-amber-100 text-amber-700" :
                      "bg-rose-100 text-rose-700")
                    }>
                      {item.profitBadge} Margin
                    </span>
                    <span className={
                      "rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                      (item.matrixClass === "Star" ? "bg-purple-100 text-purple-700" :
                      item.matrixClass === "Plow Horse" ? "bg-blue-100 text-blue-700" :
                      item.matrixClass === "Puzzle" ? "bg-amber-100 text-amber-700" :
                      "bg-slate-100 text-slate-700")
                    }>
                      {item.matrixClass}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center gap-4 text-sm text-slate-500">
                    <span>Food Cost: <strong className="text-slate-700">{item.metrics.foodCostPct}%</strong></span>
                    <span>•</span>
                    <span>Margin: <strong className="text-slate-700">{item.metrics.marginPct}%</strong></span>
                    <span>•</span>
                    <span>Net Profit: <strong className="text-slate-700">₹{item.metrics.netProfit}</strong></span>
                  </div>
                </div>
              </div>

              {/* THREE COLUMN LAYOUT */}
              <div className="grid divide-y divide-slate-100 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                
                {/* COLUMN 1: True Cost Breakdown */}
                <div className="p-5">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                    <PieChart size={16} className="text-slate-400" /> True Cost Breakdown
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Ingredients</span>
                      <span className="font-medium">₹{item.costs.ingredient}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Salary Alloc</span>
                      <span className="font-medium">₹{item.costs.salary}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Electricity & Gas</span>
                      <span className="font-medium">₹{(item.costs.electricity + item.costs.gas).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Packaging</span>
                      <span className="font-medium">₹{item.costs.packaging}</span>
                    </div>
                    <div className="my-2 h-px bg-slate-100" />
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Total True Cost</span>
                      <span>₹{item.costs.totalTrueCost}</span>
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: Selling Price Engine */}
                <div className="bg-slate-50/30 p-5">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                    <DollarSign size={16} className="text-slate-400" /> Selling Price Engine
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">Dine-In Price</span>
                        <span className="font-bold text-slate-900">₹{item.pricing.dineIn}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} className="h-full bg-slate-800" />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-slate-600 font-medium">Takeaway Price</span>
                        <span className="font-bold text-slate-900">₹{item.pricing.takeaway}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "100%" }} className="h-full bg-slate-600" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* COLUMN 3: Platform Economics */}
                <div className="p-5">
                  <h4 className="mb-4 flex items-center gap-2 font-semibold text-slate-800">
                    <LayoutGrid size={16} className="text-slate-400" /> Platform Economics
                  </h4>
                  <div className="space-y-3 rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-orange-800">Swiggy Price</span>
                      <span className="text-lg font-bold text-orange-900">₹{item.pricing.swiggy}</span>
                    </div>
                    <p className="text-xs text-orange-600 leading-tight">Preserves ₹{item.metrics.netProfit} net profit after 25% commission.</p>
                  </div>
                  <div className="mt-3 space-y-3 rounded-xl border border-red-100 bg-red-50/50 p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-red-800">Zomato Price</span>
                      <span className="text-lg font-bold text-red-900">₹{item.pricing.zomato}</span>
                    </div>
                    <p className="text-xs text-red-600 leading-tight">Preserves ₹{item.metrics.netProfit} net profit after 28% commission.</p>
                  </div>
                </div>

              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredData.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 py-20 text-slate-500">
            <Search size={32} className="mb-3 text-slate-300" />
            <p>No dishes found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
