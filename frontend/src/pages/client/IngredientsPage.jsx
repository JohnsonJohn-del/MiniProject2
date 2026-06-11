import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PencilLine, Trash2, Plus, Building2, Package, Search, ChevronDown, Check } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import { useCurrency } from "../../hooks/useCurrency";

const UNIT_TYPES = {
  weight: { label: "Weight based", units: ["kg", "g"] },
  liquid: { label: "Liquid based", units: ["l", "ml"] }
};

const PRESETS = [
  // Dairy
  { name: "Milk", type: "liquid", unit: "l", category: "Dairy", price: 65 },
  { name: "Paneer", type: "weight", unit: "kg", category: "Dairy", price: 450 },
  { name: "Butter", type: "weight", unit: "kg", category: "Dairy", price: 550 },
  { name: "Cheese", type: "weight", unit: "kg", category: "Dairy", price: 600 },
  { name: "Cream", type: "liquid", unit: "l", category: "Dairy", price: 280 },
  // Vegetables
  { name: "Onion", type: "weight", unit: "kg", category: "Vegetables", price: 40 },
  { name: "Tomato", type: "weight", unit: "kg", category: "Vegetables", price: 35 },
  { name: "Potato", type: "weight", unit: "kg", category: "Vegetables", price: 30 },
  { name: "Capsicum", type: "weight", unit: "kg", category: "Vegetables", price: 80 },
  { name: "Coriander", type: "weight", unit: "kg", category: "Vegetables", price: 20 },
  // Spices
  { name: "Turmeric", type: "weight", unit: "kg", category: "Spices", price: 240 },
  { name: "Chilli Powder", type: "weight", unit: "kg", category: "Spices", price: 320 },
  { name: "Garam Masala", type: "weight", unit: "kg", category: "Spices", price: 450 },
  { name: "Cumin", type: "weight", unit: "kg", category: "Spices", price: 400 },
  // Proteins
  { name: "Chicken", type: "weight", unit: "kg", category: "Proteins", price: 260 },
  { name: "Mutton", type: "weight", unit: "kg", category: "Proteins", price: 750 },
  { name: "Fish", type: "weight", unit: "kg", category: "Proteins", price: 400 },
  { name: "Egg", type: "weight", unit: "kg", category: "Proteins", price: 7 } // Assuming per piece is handled as weight/liquid logic? User said only kg/g/l/ml. I will map eggs to weight or handle as kg.
];

const vendorInitialForm = { vendor_name: "", contact: "" };
const ingredientInitialForm = { ingredient_name: "", unit: "kg", unit_type: "weight", vendor_id: "", price_per_unit: "" };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function IngredientsPage() {
  const { formatUsd, region } = useCurrency();
  const [vendors, setVendors] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [vendorForm, setVendorForm] = useState(vendorInitialForm);
  const [ingredientForm, setIngredientForm] = useState(ingredientInitialForm);
  const [editingVendorId, setEditingVendorId] = useState(null);
  const [editingIngredientId, setEditingIngredientId] = useState(null);
  const [inlineIngredient, setInlineIngredient] = useState(null); // { id, ingredient_name, unit, price_per_unit }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPresets, setShowPresets] = useState(false);

  const vendorLookup = useMemo(
    () => Object.fromEntries((vendors || []).map((vendor) => [vendor.id, vendor.vendor_name])),
    [vendors]
  );

  const filteredPresets = useMemo(() => {
    if (!ingredientForm.ingredient_name) return PRESETS.slice(0, 5);
    return PRESETS.filter(p => p.name.toLowerCase().includes(ingredientForm.ingredient_name.toLowerCase())).slice(0, 5);
  }, [ingredientForm.ingredient_name]);

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vendorRes, ingredientRes] = await Promise.all([api.get("/vendors"), api.get("/ingredients")]);
      setVendors(vendorRes.data?.vendors || (Array.isArray(vendorRes.data) ? vendorRes.data : []));
      setIngredients(ingredientRes.data?.ingredients || (Array.isArray(ingredientRes.data) ? ingredientRes.data : []));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load module");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (!ingredientForm.ingredient_name || ingredientForm.ingredient_name.trim().length < 3) return;
    if (editingIngredientId) return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        const response = await api.post("/ai/recommend-unit", {
          ingredient_name: ingredientForm.ingredient_name
        });
        if (response.data?.success) {
          const { unit_type, suggested_unit } = response.data;
          const mappedUnitType = unit_type === "volume" ? "liquid" : (unit_type || "weight");
          setIngredientForm(prev => ({
            ...prev,
            unit_type: mappedUnitType,
            unit: suggested_unit || (mappedUnitType === "liquid" ? "l" : "kg")
          }));
        }
      } catch (err) {
        console.error("Failed to recommend unit type:", err);
      }
    }, 650);

    return () => clearTimeout(delayDebounceFn);
  }, [ingredientForm.ingredient_name, editingIngredientId]);

  const selectPreset = (preset) => {
    setIngredientForm({
      ...ingredientForm,
      ingredient_name: preset.name,
      unit: preset.unit,
      unit_type: preset.type,
      price_per_unit: preset.price
    });
    setShowPresets(false);
  };

  const submitVendor = async (event) => {
    event.preventDefault();
    try {
      if (editingVendorId) {
        await api.put(`/vendors/${editingVendorId}`, vendorForm);
      } else {
        await api.post("/vendors", vendorForm);
      }
      setVendorForm(vendorInitialForm);
      setEditingVendorId(null);
      await loadData();
    } catch (err) {
      setError("Failed to save vendor");
    }
  };

  const submitIngredient = async (event) => {
    event.preventDefault();
    const payload = {
      ...ingredientForm,
      vendor_id: ingredientForm.vendor_id || null,
      price_per_unit: Number(ingredientForm.price_per_unit || 0)
    };
    try {
      if (editingIngredientId) {
        await api.put(`/ingredients/${editingIngredientId}`, payload);
      } else {
        await api.post("/ingredients", payload);
      }
      setIngredientForm(ingredientInitialForm);
      setEditingIngredientId(null);
      await loadData();
    } catch (err) {
      setError("Failed to save ingredient");
    }
  };

  const editIngredient = (ingredient) => {
    // Set inline editing state instead of filling top form
    setInlineIngredient({
      id: ingredient.id,
      ingredient_name: ingredient.ingredient_name,
      unit: ingredient.unit,
      price_per_unit: ingredient.price_per_unit
    });
  };

  const saveInlineIngredient = async () => {
    if (!inlineIngredient) return;
    try {
      const isLiquid = ["l", "ml"].includes(inlineIngredient.unit);
      await api.put(`/ingredients/${inlineIngredient.id}`, {
        ingredient_name: inlineIngredient.ingredient_name,
        unit: inlineIngredient.unit,
        unit_type: isLiquid ? "liquid" : "weight",
        price_per_unit: Number(inlineIngredient.price_per_unit || 0)
      });
      setInlineIngredient(null);
      await loadData();
    } catch (err) {
      setError("Failed to update ingredient");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading modules...</div>;

  return (
    <motion.div initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Kitchen Inventory"
        description="Standardized Indian ingredient management with strict unit controls."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          {/* Vendor Form */}
          <form onSubmit={submitVendor} className="glass-card-premium p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex rounded-xl bg-slate-900 p-2.5 text-white">
                <Building2 size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{editingVendorId ? "Edit Vendor" : "Add Vendor"}</h2>
            </div>
            <div className="space-y-4">
              <TextInput
                label="Vendor name"
                value={vendorForm.vendor_name}
                onChange={(e) => setVendorForm(v => ({ ...v, vendor_name: e.target.value }))}
                required
              />
              <TextInput
                label="Contact"
                value={vendorForm.contact}
                onChange={(e) => setVendorForm(v => ({ ...v, contact: e.target.value }))}
              />
              <PrimaryButton type="submit" className="w-full">
                {editingVendorId ? "Update" : "Save Vendor"}
              </PrimaryButton>
            </div>
          </form>

          {/* Vendors Table */}
          <div className="glass-card-premium overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-bold text-slate-900">Vendors</h3>
               <span className="text-xs font-bold text-slate-400">{vendors.length}</span>
             </div>
             <div className="max-h-[300px] overflow-y-auto">
               {vendors.map(v => (
                 <div key={v.id} className="flex items-center justify-between px-6 py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                   <div>
                     <p className="text-sm font-semibold text-slate-900">{v.vendor_name}</p>
                     <p className="text-xs text-slate-500">{v.contact || "No contact"}</p>
                   </div>
                   <div className="flex gap-2">
                     <button onClick={() => {setEditingVendorId(v.id); setVendorForm(v);}} className="p-1.5 text-slate-400 hover:text-brand-600"><PencilLine size={14} /></button>
                     <button onClick={async () => {await api.delete(`/vendors/${v.id}`); loadData();}} className="p-1.5 text-slate-400 hover:text-rose-600"><Trash2 size={14} /></button>
                   </div>
                 </div>
               ))}
             </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Ingredient Form */}
          <form onSubmit={submitIngredient} className="glass-card-premium p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-brand-600 p-2.5 text-white">
                  <Package size={18} />
                </div>
                <h2 className="text-lg font-bold text-slate-900">{editingIngredientId ? "Edit Ingredient" : "New Ingredient"}</h2>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="relative">
                <TextInput
                  label="Ingredient name"
                  placeholder="e.g. Basmati Rice"
                  value={ingredientForm.ingredient_name}
                  onFocus={() => setShowPresets(true)}
                  onChange={(e) => setIngredientForm(v => ({ ...v, ingredient_name: e.target.value }))}
                  required
                />
                <AnimatePresence>
                  {showPresets && filteredPresets.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute z-20 left-0 right-0 mt-1 rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden"
                    >
                      <div className="bg-slate-50 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Suggestions</div>
                      {filteredPresets.map(p => (
                        <button
                          key={p.name}
                          type="button"
                          onClick={() => selectPreset(p)}
                          className="flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-brand-50 transition-colors"
                        >
                          <span className="font-medium text-slate-900">{p.name}</span>
                          <span className="text-[10px] font-bold text-brand-600 uppercase bg-brand-50 px-1.5 py-0.5 rounded">{p.category}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Vendor</span>
                <select
                  value={ingredientForm.vendor_id}
                  onChange={(e) => setIngredientForm(v => ({ ...v, vendor_id: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none transition"
                >
                  <option value="">No vendor selected</option>
                  {vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name}</option>)}
                </select>
              </label>

              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-700 block">Measurement Type</span>
                <div className="flex gap-3">
                  {Object.entries(UNIT_TYPES).map(([id, cfg]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setIngredientForm(v => ({ ...v, unit_type: id, unit: cfg.units[0] }))}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                        ingredientForm.unit_type === id
                          ? "border-brand-600 bg-brand-50 text-brand-700 shadow-sm"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-sm font-medium text-slate-700 block">Standard Unit</span>
                <div className="flex gap-3">
                  {(UNIT_TYPES[ingredientForm.unit_type] || UNIT_TYPES.weight).units.map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setIngredientForm(v => ({ ...v, unit: u }))}
                      className={`flex-1 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${
                        ingredientForm.unit === u
                          ? "border-brand-600 bg-brand-600 text-white shadow-md"
                          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                      }`}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                 <TextInput
                   label={`Price per ${ingredientForm.unit}`}
                   type="number"
                   step="0.01"
                   placeholder="0.00"
                   value={ingredientForm.price_per_unit}
                   onChange={(e) => setIngredientForm(v => ({ ...v, price_per_unit: e.target.value }))}
                   required
                 />
                 <p className="mt-2 text-xs text-slate-400 italic">
                   Costing will be calculated in INR.
                 </p>
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              <PrimaryButton type="submit" className="flex-1">
                {editingIngredientId ? "Update Ingredient" : "Create Ingredient"}
              </PrimaryButton>
              {editingIngredientId && (
                <button
                  type="button"
                  onClick={() => {setEditingIngredientId(null); setIngredientForm(ingredientInitialForm);}}
                  className="rounded-xl border border-slate-200 px-6 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* Ingredients Table */}
          <div className="glass-card-premium overflow-hidden">
             <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h3 className="font-bold text-slate-900">Live Inventory</h3>
               <span className="text-xs font-bold text-slate-400">{ingredients.length} items</span>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-sm">
                 <thead>
                   <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/30">
                     <th className="px-6 py-3">Item</th>
                     <th className="px-6 py-3 text-center">Unit</th>
                     <th className="px-6 py-3">Price</th>
                     <th className="px-6 py-3 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody>
                    {ingredients.map(ing => (
                      inlineIngredient?.id === ing.id ? (
                        // ── Inline edit row ──
                        <tr key={ing.id} className="border-b border-brand-100 bg-brand-50/40">
                          <td className="px-4 py-3">
                            <input
                              className="w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-300"
                              value={inlineIngredient.ingredient_name}
                              onChange={e => setInlineIngredient(p => ({ ...p, ingredient_name: e.target.value }))}
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <select
                              className="rounded-lg border border-brand-300 bg-white px-2 py-2 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                              value={inlineIngredient.unit}
                              onChange={e => setInlineIngredient(p => ({ ...p, unit: e.target.value }))}
                            >
                              {["kg","g","l","ml"].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input
                              type="number" step="0.01" min="0"
                              className="w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm font-medium text-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-300"
                              value={inlineIngredient.price_per_unit}
                              onChange={e => setInlineIngredient(p => ({ ...p, price_per_unit: e.target.value }))}
                            />
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex justify-end gap-1">
                              <button
                                onClick={saveInlineIngredient}
                                className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 transition-all"
                              >Update</button>
                              <button
                                onClick={() => setInlineIngredient(null)}
                                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50 transition-all"
                              >Cancel</button>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        // ── Normal row ──
                        <tr key={ing.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 font-semibold text-slate-900">{ing.ingredient_name}</td>
                          <td className="px-6 py-4 text-center">
                            <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] uppercase">{ing.unit}</span>
                          </td>
                          <td className="px-6 py-4 font-medium text-brand-700">{formatUsd(ing.price_per_unit)}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => editIngredient(ing)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"><PencilLine size={14} /></button>
                              <button onClick={async () => {await api.delete(`/ingredients/${ing.id}`); loadData();}} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                   {ingredients.length === 0 && (
                     <tr><td colSpan="4" className="px-6 py-12 text-center text-slate-400 italic">Add your first ingredient above.</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
