import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Upload, ChefHat, Loader2, Check, Sparkles, Trash2, Image as ImageIcon } from "lucide-react";
import { useDropzone } from "react-dropzone";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.05 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

export default function ImportPage() {
  const [tab, setTab] = useState("bill");
  
  // Bill State
  const [billText, setBillText] = useState("");
  const [parsedBill, setParsedBill] = useState(null);
  const [billItems, setBillItems] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [parsingBill, setParsingBill] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  // Recipe State
  const [recipeText, setRecipeText] = useState("");
  const [parsedRecipe, setParsedRecipe] = useState(null);
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [parsingRecipe, setParsingRecipe] = useState(false);

  // Shared State
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const resetBill = () => { 
    setParsedBill(null); 
    setBillItems([]); 
    setBillText(""); 
    setImagePreview(null);
    setSuccess(""); 
    setError(""); 
  };

  const resetRecipe = () => { 
    setParsedRecipe(null); 
    setRecipeIngredients([]); 
    setRecipeText(""); 
    setSuccess(""); 
    setError(""); 
  };

  // --- Bill OCR Workflow ---
  const onDropBill = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setImagePreview(URL.createObjectURL(file));
    setUploading(true);
    setParsingBill(false);
    setError(""); 
    setSuccess("");
    
    try {
      // 1. Upload & OCR via Tesseract.js on Backend
      const formData = new FormData();
      formData.append("image", file);
      
      const uploadRes = await api.post("/import/upload-bill", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      
      const ocrText = uploadRes.data.document.ocr_text;
      setBillText(ocrText);
      setUploading(false);
      
      // 2. OpenAI Structuring
      setParsingBill(true);
      const parseRes = await api.post("/import/parse-bill", { ocr_text: ocrText });
      
      setParsedBill(parseRes.data);
      setBillItems(parseRes.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to process bill image");
    } finally { 
      setUploading(false);
      setParsingBill(false); 
    }
  }, []);

  const { getRootProps: getBillRootProps, getInputProps: getBillInputProps, isDragActive: isBillDragActive } = useDropzone({
    onDrop: onDropBill,
    accept: { "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"] },
    maxFiles: 1
  });

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

  // --- Recipe Parsing Workflow ---
  const handleParseRecipe = async () => {
    if (!recipeText.trim()) return;
    setParsingRecipe(true); setError(""); setSuccess("");
    try {
      const { data } = await api.post("/import/parse-recipe", { text: recipeText });
      setParsedRecipe(data);
      setRecipeIngredients(data.ingredients || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to parse recipe");
    } finally { setParsingRecipe(false); }
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

  // Handlers
  const updateBillItem = (index, field, value) => {
    setBillItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };
  const removeBillItem = (index) => setBillItems(prev => prev.filter((_, i) => i !== index));

  const updateRecipeIngredient = (index, field, value) => {
    setRecipeIngredients(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };
  const removeRecipeIngredient = (index) => setRecipeIngredients(prev => prev.filter((_, i) => i !== index));

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Smart Import"
        description="Import vendor bills via OCR and recipes via AI — no manual data entry needed."
      />

      <div className="flex gap-2 rounded-2xl bg-slate-100 p-1.5">
        <button onClick={() => { setTab("bill"); setError(""); setSuccess(""); }} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "bill" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}>
          <FileText size={16} className="inline-block mr-2" />Import Bill (OCR)
        </button>
        <button onClick={() => { setTab("recipe"); setError(""); setSuccess(""); }} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${tab === "recipe" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-800"}`}>
          <ChefHat size={16} className="inline-block mr-2" />Import Recipe (AI)
        </button>
      </div>

      <AnimatePresence mode="wait">
        {error ? <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}
        {success ? <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2"><Check size={16} />{success}</motion.p> : null}
      </AnimatePresence>

      {/* --- BILL TAB --- */}
      {tab === "bill" && !parsedBill && (
        <motion.div variants={fadeUp} className="glass-card-premium space-y-6 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm"><Upload size={18} /></div>
            <div><h2 className="text-lg font-bold text-slate-900">Upload Bill Image</h2><p className="text-xs text-slate-500">JPG, PNG supported. OCR will automatically extract ingredients and pricing.</p></div>
          </div>
          
          <div {...getBillRootProps()} className={`group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed p-10 transition-colors ${isBillDragActive ? "border-brand-500 bg-brand-50/50" : "border-slate-200 bg-slate-50/50 hover:border-brand-400 hover:bg-slate-50"}`}>
            <input {...getBillInputProps()} />
            
            <AnimatePresence mode="wait">
              {uploading || parsingBill ? (
                <motion.div key="loading" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-3 text-brand-600">
                  <Loader2 size={32} className="animate-spin" />
                  <p className="font-semibold text-sm">{uploading ? "Extracting text with OCR..." : "Structuring data with AI..."}</p>
                </motion.div>
              ) : imagePreview ? (
                <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4">
                  <img src={imagePreview} alt="Bill Preview" className="h-32 w-auto object-contain rounded-lg border border-slate-200 shadow-sm" />
                  <p className="text-sm font-medium text-slate-600">Click or drag to replace image</p>
                </motion.div>
              ) : (
                <motion.div key="upload" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-2 text-slate-500 group-hover:text-brand-600 transition-colors">
                  <div className="rounded-full bg-white p-4 shadow-sm ring-1 ring-slate-200 group-hover:ring-brand-200 transition-all group-hover:scale-105">
                    <ImageIcon size={24} />
                  </div>
                  <p className="mt-2 font-semibold text-sm">Drag & drop a bill image here</p>
                  <p className="text-xs">or click to browse files</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {tab === "bill" && parsedBill && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
            {imagePreview && (
              <div className="glass-card-premium p-4 flex flex-col">
                <h3 className="font-bold text-slate-900 mb-3 text-sm flex items-center gap-2"><ImageIcon size={16} className="text-slate-500" /> Original Bill</h3>
                <div className="flex-1 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden flex items-center justify-center p-2">
                  <img src={imagePreview} alt="Bill Preview" className="max-h-[400px] w-auto object-contain" />
                </div>
              </div>
            )}
            
            <div className="glass-card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Review: {parsedBill.vendor_name}</h2>
                  <p className="text-xs text-slate-500">{billItems.length} line items detected from OCR</p>
                </div>
                <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{parsedBill.source === "mock" ? "Demo Parse" : "AI Parsed"}</span>
              </div>
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Vendor Name</label>
                <input value={parsedBill.vendor_name} onChange={(e) => setParsedBill(prev => ({ ...prev, vendor_name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
              </div>
              {billItems.length > 0 ? (
                <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200/80 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                        <th className="px-4 py-3 font-semibold">Ingredient</th>
                        <th className="px-4 py-3 font-semibold">Qty</th>
                        <th className="px-4 py-3 font-semibold">Unit</th>
                        <th className="px-4 py-3 font-semibold">Price</th>
                        <th className="px-4 py-3 w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {billItems.map((item, i) => (
                        <tr key={i} className="border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-2"><input value={item.ingredient_name} onChange={(e) => updateBillItem(i, "ingredient_name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={(e) => updateBillItem(i, "quantity", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                          <td className="px-4 py-2"><input value={item.unit} onChange={(e) => updateBillItem(i, "unit", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                          <td className="px-4 py-2"><input type="number" value={item.price} onChange={(e) => updateBillItem(i, "price", e.target.value)} className="w-24 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                          <td className="px-4 py-2 text-right"><button onClick={() => removeBillItem(i)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
              <div className="mt-6 flex flex-wrap gap-3">
                <PrimaryButton onClick={handleSaveBill} disabled={saving || billItems.length === 0}>
                  {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <><Check size={16} className="mr-2" />Save Bill & Vendor</>}
                </PrimaryButton>
                <button onClick={resetBill} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">Cancel</button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- RECIPE TAB --- */}
      {tab === "recipe" && !parsedRecipe && (
        <motion.div variants={fadeUp} className="glass-card-premium space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm"><ChefHat size={18} /></div>
            <div><h2 className="text-lg font-bold text-slate-900">Paste Recipe</h2><p className="text-xs text-slate-500">Paste a recipe and AI will extract ingredients automatically</p></div>
          </div>
          <textarea value={recipeText} onChange={(e) => setRecipeText(e.target.value)} rows={6} placeholder={`Paste recipe text here...\n\ne.g.: Classic Margherita Pizza\n300g pizza dough\n100g tomato sauce\n150g mozzarella cheese`} className="w-full rounded-xl border border-slate-200 bg-white/50 px-4 py-3 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100 resize-none" />
          <PrimaryButton onClick={handleParseRecipe} disabled={!recipeText.trim() || parsingRecipe}>
            {parsingRecipe ? <><Loader2 size={16} className="mr-2 animate-spin" />Parsing...</> : <><Sparkles size={16} className="mr-2" />Parse Recipe with AI</>}
          </PrimaryButton>
        </motion.div>
      )}

      {tab === "recipe" && parsedRecipe && (
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Review: {parsedRecipe.recipe_name}</h2>
                <p className="text-xs text-slate-500">{recipeIngredients.length} ingredients detected</p>
              </div>
              <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">{parsedRecipe.source === "mock" ? "Demo Parse" : "AI Parsed"}</span>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500 mb-1">Recipe Name</label>
              <input value={parsedRecipe.recipe_name} onChange={(e) => setParsedRecipe(prev => ({ ...prev, recipe_name: e.target.value }))} className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100" />
            </div>
            {recipeIngredients.length > 0 ? (
              <div className="overflow-x-auto rounded-xl border border-slate-200/80">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200/80 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                      <th className="px-4 py-3 font-semibold">Ingredient</th>
                      <th className="px-4 py-3 font-semibold">Qty</th>
                      <th className="px-4 py-3 font-semibold">Unit</th>
                      <th className="px-4 py-3 w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {recipeIngredients.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100/80 last:border-0 hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-2"><input value={item.ingredient_name} onChange={(e) => updateRecipeIngredient(i, "ingredient_name", e.target.value)} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                        <td className="px-4 py-2"><input type="number" value={item.quantity} onChange={(e) => updateRecipeIngredient(i, "quantity", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                        <td className="px-4 py-2"><input value={item.unit} onChange={(e) => updateRecipeIngredient(i, "unit", e.target.value)} className="w-20 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" /></td>
                        <td className="px-4 py-2 text-right"><button onClick={() => removeRecipeIngredient(i)} className="rounded-lg p-2 text-rose-500 hover:bg-rose-50 transition-colors"><Trash2 size={16} /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <PrimaryButton onClick={handleSaveRecipe} disabled={saving || recipeIngredients.length === 0}>
                {saving ? <><Loader2 size={16} className="mr-2 animate-spin" />Saving...</> : <><Check size={16} className="mr-2" />Save Recipe</>}
              </PrimaryButton>
              <button onClick={resetRecipe} className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300">Cancel</button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
