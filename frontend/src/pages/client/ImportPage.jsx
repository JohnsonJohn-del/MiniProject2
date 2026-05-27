import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, ChefHat, Sparkles, Upload, Loader2, Check, Trash2, TrendingUp, TrendingDown, AlertTriangle, Info, X } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { useAi } from "../../context/AiContext";
import { Bot } from "lucide-react";

const fade = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const INSIGHT_ICONS = { warning: AlertTriangle, success: Check, info: Info };
const INSIGHT_COLORS = {
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  info: "border-blue-200 bg-blue-50 text-blue-800"
};

// ── Drag-drop upload zone ──────────────────────────────────────────────────────
function DropZone({ onFile, accept = "image/*,.pdf", label = "Drop invoice here" }) {
  const [dragging, setDragging] = useState(false);
  const ref = useRef();

  const handle = useCallback((e) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer?.files?.[0] || e.target?.files?.[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handle}
      onClick={() => ref.current?.click()}
      className={`relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-10 transition-all ${dragging ? "border-brand-400 bg-brand-50/60 scale-[1.01]" : "border-slate-300 bg-slate-50/60 hover:border-brand-300 hover:bg-brand-50/30"}`}
    >
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={handle} />
      <div className="rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-3 text-white shadow">
        <Upload size={22} />
      </div>
      <p className="text-sm font-semibold text-slate-700">{label}</p>
      <p className="text-xs text-slate-400">JPG · PNG · PDF</p>
    </div>
  );
}

// ── Editable table row ─────────────────────────────────────────────────────────
function EditRow({ item, onChange, onRemove, fields }) {
  return (
    <tr className="border-b border-slate-100/80 hover:bg-slate-50/50">
      {fields.map(f => (
        <td key={f.key} className="px-3 py-2">
          <input
            type={f.type || "text"} value={item[f.key] ?? ""}
            onChange={e => onChange(f.key, e.target.value)}
            className="w-full min-w-[80px] rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400"
          />
        </td>
      ))}
      <td className="px-2 py-2">
        <button onClick={onRemove} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={13} /></button>
      </td>
    </tr>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ImportPage() {
  const { aiEnabled } = useAi();
  const [tab, setTab] = useState("bill");
  const [billFile, setBillFile] = useState(null);
  const [billText, setBillText] = useState("");
  const [parsedBill, setParsedBill] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [recipeText, setRecipeText] = useState("");
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [recipeIngs, setRecipeIngs] = useState([]);
  const [insights, setInsights] = useState(null);
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [status, setStatus] = useState({ loading: false, msg: "", ok: false });

  const busy = (msg) => setStatus({ loading: true, msg, ok: false });
  const done = (msg, ok = true) => setStatus({ loading: false, msg, ok });
  const fail = (err) => setStatus({ loading: false, msg: err?.response?.data?.message || err?.message || "Error", ok: false });
  const clear = () => setStatus({ loading: false, msg: "", ok: false });

  // BILL: upload file → OCR → parse
  const handleBillFile = async (file) => {
    setBillFile(file); clear();
    busy("Extracting text via OCR…");
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/import/upload-bill", form, { headers: { "Content-Type": "multipart/form-data" } });
      setBillText(data.document?.ocr_text || "");
      done("OCR complete — reviewing text…");
    } catch (e) { fail(e); }
  };

  const handleParseBill = async () => {
    if (!billText.trim()) return;
    busy("Parsing bill with AI…");
    try {
      const { data } = await api.post("/import/parse-bill", { ocr_text: billText });
      setParsedBill(data); setBillItems(data.items || []);
      done("");
    } catch (e) { fail(e); }
  };

  const handleSaveBill = async () => {
    busy("Saving…");
    try {
      await api.post("/import/save-bill", { vendor_name: parsedBill.vendor_name, items: billItems });
      done(`Saved ${billItems.length} items from ${parsedBill.vendor_name}`);
      setParsedBill(null); setBillItems([]); setBillText(""); setBillFile(null);
    } catch (e) { fail(e); }
  };

  // RECIPE: upload image → OCR → parse
  const handleRecipeFile = async (file) => {
    clear();
    busy("Extracting text via OCR…");
    try {
      const form = new FormData();
      form.append("image", file);
      const { data } = await api.post("/import/upload-recipe-image", form, { headers: { "Content-Type": "multipart/form-data" } });
      setRecipeText(data.ocr_text || "");
      done("OCR complete — reviewing text…");
    } catch (e) { fail(e); }
  };

  // RECIPE: parse text
  const handleParseRecipe = async () => {
    if (!recipeText.trim()) return;
    busy("Parsing recipe…");
    try {
      const { data } = await api.post("/import/parse-recipe", { text: recipeText });
      setParsedRecipe(data); setRecipeIngs(data.ingredients || []);
      done("");
    } catch (e) { fail(e); }
  };

  const handleSaveRecipe = async () => {
    busy("Creating recipe…");
    try {
      await api.post("/import/save-recipe", { recipe_name: parsedRecipe.recipe_name, ingredients: recipeIngs });
      done(`Recipe "${parsedRecipe.recipe_name}" created with ${recipeIngs.length} ingredients`);
      setParsedRecipe(null); setRecipeIngs([]); setRecipeText("");
    } catch (e) { fail(e); }
  };

  // AI INSIGHTS: load when tab opens
  const loadInsights = async () => {
    if (insights) return;
    busy("Generating insights…");
    try {
      const { data } = await api.get("/insights/ai-insights");
      setInsights(data.insights || []); setSummary(data.summary || {}); setTrends(data.price_trends || []);
      done("");
    } catch (e) { fail(e); }
  };

  const switchTab = (t) => { setTab(t); clear(); if (t === "insights") loadInsights(); };

  const billItemFields = [
    { key: "ingredient_name", label: "Ingredient" },
    { key: "quantity", label: "Qty", type: "number" },
    { key: "unit", label: "Unit" },
    { key: "price", label: "Price", type: "number" }
  ];
  const recipeIngFields = [
    { key: "ingredient_name", label: "Ingredient" },
    { key: "quantity", label: "Qty", type: "number" },
    { key: "unit", label: "Unit" }
  ];

  if (!aiEnabled) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center">
        <div className="mb-6 rounded-3xl bg-slate-100 p-8 text-slate-300">
          <Bot size={80} strokeWidth={1} />
        </div>
        <h2 className="text-2xl font-black text-slate-900">AI Features Disabled</h2>
        <p className="mt-2 max-w-md text-slate-500">
          Enable "AI Assist" in the top bar to unlock Smart Bill OCR, 
          Recipe Auto-Parsing, and Business Intelligence insights.
        </p>
      </div>
    );
  }

  return (
    <motion.div key="content" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }} initial="hidden" animate="show" className="space-y-8">
      <PageHeader title="Smart Import" description="Upload vendor bills via OCR, import recipes via AI, and analyze your business insights." />

      {/* Tabs */}
      <div className="flex gap-1.5 rounded-2xl bg-slate-100 p-1.5">
        {[["bill", FileText, "Import Bill (OCR)"], ["recipe", ChefHat, "Import Recipe (AI)"], ["insights", Sparkles, "AI Insights"]].map(([id, Icon, label]) => (
          <button key={id} onClick={() => switchTab(id)}
            className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Status banner */}
      <AnimatePresence>
        {status.msg && (
          <motion.div variants={fade} initial="hidden" animate="show" exit="hidden"
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm ${status.ok ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-600"}`}>
            {status.loading ? <Loader2 size={15} className="animate-spin" /> : status.ok ? <Check size={15} /> : <X size={15} />}
            {status.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BILL TAB ── */}
      {tab === "bill" && (
        <motion.div variants={fade} className="space-y-6">
          {!parsedBill ? (
            <div className="glass-card-premium space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm"><Upload size={18} /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Upload Vendor Invoice</h2><p className="text-xs text-slate-500">Upload image/PDF or paste OCR text directly</p></div>
              </div>
              <DropZone onFile={handleBillFile} label="Drop invoice image or PDF here" />
              {billText && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Extracted / Pasted Text</p>
                  <textarea rows={5} value={billText} onChange={e => setBillText(e.target.value)}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white/60 px-4 py-3 text-sm outline-none focus:border-brand-400" />
                </div>
              )}
              {!billText && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Or paste bill text manually</p>
                  <textarea rows={5} value={billText} onChange={e => setBillText(e.target.value)}
                    placeholder={"Fresh Foods Supply\nTomatoes 5 kg 250\nOnions 10 kg 300"}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none focus:border-brand-400" />
                </div>
              )}
              <PrimaryButton onClick={handleParseBill} disabled={!billText.trim() || status.loading}>
                {status.loading ? <><Loader2 size={15} className="mr-2 animate-spin" />Parsing…</> : <><Sparkles size={15} className="mr-2" />Parse with AI</>}
              </PrimaryButton>
            </div>
          ) : (
            <div className="glass-card-premium p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">{parsedBill.vendor_name}</h2>
                  <p className="text-xs text-slate-500">{billItems.length} items detected · <span className="font-medium">{parsedBill.source === "mock" ? "Demo Parse" : "AI Parsed"}</span></p>
                </div>
                <button onClick={() => { setParsedBill(null); setBillItems([]); setBillText(""); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Reset</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    {billItemFields.map(f => <th key={f.key} className="px-3 py-2 font-semibold">{f.label}</th>)}
                    <th className="w-10 px-2 py-2" />
                  </tr></thead>
                  <tbody>
                    {billItems.map((item, i) => (
                      <EditRow key={i} item={item} fields={billItemFields}
                        onChange={(k, v) => setBillItems(prev => prev.map((r, ri) => ri === i ? { ...r, [k]: v } : r))}
                        onRemove={() => setBillItems(prev => prev.filter((_, ri) => ri !== i))} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <PrimaryButton onClick={handleSaveBill} disabled={status.loading || billItems.length === 0}>
                  {status.loading ? <><Loader2 size={15} className="mr-2 animate-spin" />Saving…</> : <><Check size={15} className="mr-2" />Save Bill & Create Vendor</>}
                </PrimaryButton>
                <button onClick={() => { setParsedBill(null); setBillItems([]); setBillText(""); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── RECIPE TAB ── */}
      {tab === "recipe" && (
        <motion.div variants={fade} className="space-y-6">
          {!parsedRecipe ? (
            <div className="glass-card-premium space-y-5 p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm"><ChefHat size={18} /></div>
                <div><h2 className="text-lg font-bold text-slate-900">Upload or Paste Recipe</h2><p className="text-xs text-slate-500">AI will extract ingredients, quantities and units automatically</p></div>
              </div>
              <DropZone onFile={handleRecipeFile} label="Drop recipe image or PDF here" />
              <div className="space-y-2">
                 <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{recipeText ? "Extracted / Pasted Text" : "Or paste recipe manually"}</p>
                <textarea rows={6} value={recipeText} onChange={e => setRecipeText(e.target.value)}
                  placeholder={"Classic Margherita Pizza\n300g pizza dough\n100g tomato sauce\n150g mozzarella cheese\n5g fresh basil\n20ml olive oil"}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none focus:border-brand-400" />
              </div>
              <PrimaryButton onClick={handleParseRecipe} disabled={!recipeText.trim() || status.loading}>
                {status.loading ? <><Loader2 size={15} className="mr-2 animate-spin" />Parsing…</> : <><Sparkles size={15} className="mr-2" />Parse Recipe with AI</>}
              </PrimaryButton>
            </div>
          ) : (
            <div className="glass-card-premium p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <input value={parsedRecipe.recipe_name} onChange={e => setParsedRecipe(p => ({ ...p, recipe_name: e.target.value }))}
                    className="text-lg font-bold text-slate-900 bg-transparent border-b border-slate-200 outline-none focus:border-brand-400 w-full" />
                  <p className="text-xs text-slate-500 mt-1">{recipeIngs.length} ingredients · {parsedRecipe.source === "mock" ? "Demo Parse" : "AI Parsed"}</p>
                </div>
                <button onClick={() => { setParsedRecipe(null); setRecipeIngs([]); }} className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50">Reset</button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    {recipeIngFields.map(f => <th key={f.key} className="px-3 py-2 font-semibold">{f.label}</th>)}
                    <th className="w-10 px-2 py-2" />
                  </tr></thead>
                  <tbody>
                    {recipeIngs.map((item, i) => (
                      <EditRow key={i} item={item} fields={recipeIngFields}
                        onChange={(k, v) => setRecipeIngs(prev => prev.map((r, ri) => ri === i ? { ...r, [k]: v } : r))}
                        onRemove={() => setRecipeIngs(prev => prev.filter((_, ri) => ri !== i))} />
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex gap-3">
                <PrimaryButton onClick={handleSaveRecipe} disabled={status.loading || recipeIngs.length === 0}>
                  {status.loading ? <><Loader2 size={15} className="mr-2 animate-spin" />Saving…</> : <><Check size={15} className="mr-2" />Create Recipe</>}
                </PrimaryButton>
                <button onClick={() => { setParsedRecipe(null); setRecipeIngs([]); }} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* ── AI INSIGHTS TAB ── */}
      {tab === "insights" && (
        <motion.div variants={fade} className="space-y-6">
          {status.loading && !insights && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1,2,3,4].map(i => <div key={i} className="h-32 animate-pulse rounded-2xl bg-slate-200/60" />)}
            </div>
          )}
          {summary && (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                { label: "Avg Menu Margin", value: `${summary.avg_margin?.toFixed(1) ?? "–"}%`, color: "from-brand-500 to-violet-500" },
                { label: "Menu Items", value: summary.total_menu_items ?? 0, color: "from-emerald-500 to-teal-500" },
                { label: "Ingredients Tracked", value: summary.ingredients_tracked ?? 0, color: "from-amber-500 to-orange-500" },
                { label: "Top Vendor", value: summary.top_vendor || "–", color: "from-rose-500 to-pink-500" }
              ].map(({ label, value, color }) => (
                <div key={label} className="glass-card-premium flex items-center gap-4 p-5">
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${color} shadow-sm flex-shrink-0`} />
                  <div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="text-xl font-bold text-slate-900">{value}</p></div>
                </div>
              ))}
            </div>
          )}
          {insights && insights.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2">
              {insights.map((ins, i) => {
                const Icon = INSIGHT_ICONS[ins.type] || Info;
                const cls = INSIGHT_COLORS[ins.type] || INSIGHT_COLORS.info;
                return (
                  <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                    className={`rounded-2xl border p-5 ${cls}`}>
                    <div className="flex items-start gap-3">
                      <Icon size={18} className="mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-sm">{ins.title}</p>
                          <span className="rounded-full bg-white/60 px-2.5 py-0.5 text-xs font-bold">{ins.metric}</span>
                        </div>
                        <p className="mt-1 text-sm opacity-90">{ins.message}</p>
                        <p className="mt-2 text-xs font-semibold opacity-70">→ {ins.action}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
          {trends.length > 0 && (
            <div className="glass-card-premium overflow-hidden">
              <div className="border-b border-slate-200/80 px-6 py-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-slate-500" />
                <h3 className="font-bold text-slate-900">Ingredient Price Movements</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead><tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    {["Ingredient","From","To","Change"].map(h => <th key={h} className="px-6 py-3 font-semibold">{h}</th>)}
                  </tr></thead>
                  <tbody>
                    {trends.map((t, i) => (
                      <tr key={i} className="border-b border-slate-100/80 hover:bg-slate-50/50">
                        <td className="px-6 py-3.5 font-medium text-slate-900">{t.ingredient}</td>
                        <td className="px-6 py-3.5 text-slate-600">£{Number(t.from_price).toFixed(2)}</td>
                        <td className="px-6 py-3.5 text-slate-600">£{Number(t.to_price).toFixed(2)}</td>
                        <td className="px-6 py-3.5">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${t.direction === "up" ? "bg-rose-100 text-rose-700" : "bg-emerald-100 text-emerald-700"}`}>
                            {t.direction === "up" ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                            {t.change_pct > 0 ? "+" : ""}{t.change_pct}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {insights && insights.length === 0 && (
            <div className="glass-card-premium p-12 text-center">
              <Sparkles size={32} className="mx-auto mb-3 text-slate-300" />
              <p className="font-semibold text-slate-600">No insights yet</p>
              <p className="mt-1 text-sm text-slate-400">Add recipes, ingredients, and purchases to unlock AI insights.</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
