import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, Upload, ChefHat, Loader2, Check, Sparkles, Trash2 } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ImportPage() {
  const [tab, setTab] = useState("bill");
  const [billText, setBillText] = useState("");
  const [recipeText, setRecipeText] = useState("");
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedBill, setParsedBill] = useState(null);
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const resetBill = () => { setParsedBill(null); setBillItems([]); setBillText(""); setSuccess(""); setError(""); };
  const resetRecipe = () => { setParsedRecipe(null); setRecipeIngredients([]); setRecipeText(""); setSuccess(""); setError(""); };

  const handleParseBill = async () => {
    if (!billText.trim()) return;
    setParsing(true); setError(""); setSuccess("");
    try {
      const { data } = await api.post("/import/parse-bill", { ocr_text: billText });
      setParsedBill(data);
      setBillItems(data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to parse bill");
    } finally { setParsing(false); }
  };

  const handleSaveBill = async () => {
    if (!parsedBill?.vendor_name || billItems.length === 0) return;
    setSaving(true); setError("");
    try {
      await api.post("/import/save-bill", { vendor_name: parsedBill.vendor_name, items: billItems });
      setSuccess(`Bill imported — ${billItems.length} items from ${parsedBill.vendor_name}`);
      resetBill();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save bill");
    } finally { setSaving(false); }
  };

  const handleParseRecipe = async () => {
    if (!recipeText.trim()) return;
    setParsing(true); setError(""); setSuccess("");
    try {
      const { data } = await api.post("/import/parse-recipe", { text: recipeText });
      setParsedRecipe(data);
      setRecipeIngredients(data.ingredients || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to parse recipe");
    } finally { setParsing(false); }
  };

  const handleSaveRecipe = async () => {
    if (!parsedRecipe?.recipe_name || recipeIngredients.length === 0) return;
    setSaving(true); setError("");
    try {
      await api.post("/import/save-recipe", { recipe_name: parsedRecipe.recipe_name, ingredients: recipeIngredients });
      setSuccess(`Recipe "${parsedRecipe.recipe_name}" created with ${recipeIngredients.length} ingredients`);
      resetRecipe();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save recipe");
    } finally { setSaving(false); }
  };

  const updateBillItem = (index, field, value) => {
    setBillItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeBillItem = (index) => {
    setBillItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateRecipeIngredient = (index, field, value) => {
    setRecipeIngredients(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeRecipeIngredient = (index) => {
    setRecipeIngredients(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Smart Import"
        description="Import vendor bills and recipes using AI — no manual data entry needed."
      />

      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button onClick={() => { setTab("bill"); setError(""); setSuccess(""); }} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "bill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}>
          <FileText size={16} className="inline-block mr-2" />Import Bill
        </button>
        <button onClick={() => { setTab("recipe"); setError(""); setSuccess(""); }} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "recipe" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}>
          <ChefHat size={16} className="inline-block mr-2" />Import Recipe
        </button>
      </div>

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}
      {success ? <motion.p variants={fadeUp} className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2"><Check size={16} />{success}</motion.p> : null}

      {tab === "bill" && !parsedBill && (
        <motion.div variants={fadeUp} className="glass-card-premium space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm"><Upload size={18} /></div>
            <div><h2 className="text-lg font-bold text-slate-900">Upload or Paste Bill</h2><p className="text-xs text-slate-500">Paste OCR text from a scanned invoice</p></div>
          </div>
          <textarea value={billText} onChange={(e) => setBillText(e.target.value)} rows={6} placeholder={`Paste invoice text here...\n\ne.g.: Fresh Foods Supply\nTomatoes 5kg 250\nOnions 10kg 300`} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 resize-none" />
          <PrimaryButton onClick={handleParseBill} disabled={!billText.trim() || parsing}>
            {parsing ? <><Loader2 size={16} className="mr-2 animate-spin" />Parsing...</> : <><Sparkles size={16} className="mr-2" />Parse with AI</>}
          </PrimaryButton>
        </motion.div>
      )}

      {tab === "bill" && parsedBill && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{parsedBill.vendor_name}</h2>
                <p className="text-xs text-slate-500">{billItems.length} line items detected</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{parsedBill.source === "mock" ? "Demo Parse" : "AI Parsed"}</span>
            </div>
            {billItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Ingredient</th>
                      <th className="px-3 py-2 font-semibold">Qty</th>
                      <th className="px-3 py-2 font-semibold">Unit</th>
                      <th className="px-3 py-2 font-semibold">Price</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100/80">
                        <td className="px-3 py-2"><input value={item.ingredient_name} onChange={(e) => updateBillItem(i, "ingredient_name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={(e) => updateBillItem(i, "quantity", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><input value={item.unit} onChange={(e) => updateBillItem(i, "unit", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><input type="number" value={item.price} onChange={(e) => updateBillItem(i, "price", e.target.value)} className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><button onClick={() => removeBillItem(i)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <PrimaryButton onClick={handleSaveBill} disabled={saving || billItems.length === 0}>
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <><Check size={16} className="mr-2" />Save Bill & Create Vendor</>}
              </PrimaryButton>
              <button onClick={resetBill} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}

      {tab === "recipe" && !parsedRecipe && (
        <motion.div variants={fadeUp} className="glass-card-premium space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm"><ChefHat size={18} /></div>
            <div><h2 className="text-lg font-bold text-slate-900">Paste Recipe</h2><p className="text-xs text-slate-500">Paste a recipe and AI will extract ingredients automatically</p></div>
          </div>
          <textarea value={recipeText} onChange={(e) => setRecipeText(e.target.value)} rows={6} placeholder={`Paste recipe text here...\n\ne.g.: Classic Margherita Pizza\n300g pizza dough\n100g tomato sauce\n150g mozzarella cheese`} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 resize-none" />
          <PrimaryButton onClick={handleParseRecipe} disabled={!recipeText.trim() || parsing}>
            {parsing ? <><Loader2 size={16} className="mr-2 animate-spin" />Parsing...</> : <><Sparkles size={16} className="mr-2" />Parse Recipe with AI</>}
          </PrimaryButton>
        </motion.div>
      )}

      {tab === "recipe" && parsedRecipe && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">{parsedRecipe.recipe_name}</h2>
                <p className="text-xs text-slate-500">{recipeIngredients.length} ingredients detected</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{parsedRecipe.source === "mock" ? "Demo Parse" : "AI Parsed"}</span>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Recipe Name</label>
              <input value={parsedRecipe.recipe_name} onChange={(e) => setParsedRecipe(prev => ({ ...prev, recipe_name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400" />
            </div>
            {recipeIngredients.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-semibold">Ingredient</th>
                      <th className="px-3 py-2 font-semibold">Qty</th>
                      <th className="px-3 py-2 font-semibold">Unit</th>
                      <th className="px-3 py-2 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeIngredients.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100/80">
                        <td className="px-3 py-2"><input value={item.ingredient_name} onChange={(e) => updateRecipeIngredient(i, "ingredient_name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><input type="number" value={item.quantity} onChange={(e) => updateRecipeIngredient(i, "quantity", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><input value={item.unit} onChange={(e) => updateRecipeIngredient(i, "unit", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm outline-none focus:border-brand-400" /></td>
                        <td className="px-3 py-2"><button onClick={() => removeRecipeIngredient(i)} className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"><Trash2 size={14} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-4 flex gap-3">
              <PrimaryButton onClick={handleSaveRecipe} disabled={saving || recipeIngredients.length === 0}>
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <><Check size={16} className="mr-2" />Save Recipe</>}
              </PrimaryButton>
              <button onClick={resetRecipe} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
