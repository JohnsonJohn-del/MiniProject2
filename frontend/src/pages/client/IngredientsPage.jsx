import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { PencilLine, Trash2, Plus, Building2, Package } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import { useCurrency } from "../../hooks/useCurrency";

const vendorInitialForm = { vendor_name: "", contact: "" };
const ingredientInitialForm = { ingredient_name: "", unit: "", vendor_id: "", price_per_unit: "" };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const vendorLookup = useMemo(
    () => Object.fromEntries(vendors.map((vendor) => [vendor.id, vendor.vendor_name])),
    [vendors]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [vendorRes, ingredientRes] = await Promise.all([api.get("/vendors"), api.get("/ingredients")]);
      setVendors(vendorRes.data.vendors);
      setIngredients(ingredientRes.data.ingredients);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load ingredient module");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const submitVendor = async (event) => {
    event.preventDefault();
    if (editingVendorId) {
      await api.put(`/vendors/${editingVendorId}`, vendorForm);
    } else {
      await api.post("/vendors", vendorForm);
    }
    setVendorForm(vendorInitialForm);
    setEditingVendorId(null);
    await loadData();
  };

  const submitIngredient = async (event) => {
    event.preventDefault();
    const payload = {
      ...ingredientForm,
      vendor_id: ingredientForm.vendor_id || null,
      price_per_unit: Number(ingredientForm.price_per_unit || 0)
    };
    if (editingIngredientId) {
      await api.put(`/ingredients/${editingIngredientId}`, payload);
    } else {
      await api.post("/ingredients", payload);
    }
    setIngredientForm(ingredientInitialForm);
    setEditingIngredientId(null);
    await loadData();
  };

  const editVendor = (vendor) => {
    setVendorForm({ vendor_name: vendor.vendor_name, contact: vendor.contact || "" });
    setEditingVendorId(vendor.id);
  };

  const editIngredient = (ingredient) => {
    setIngredientForm({
      ingredient_name: ingredient.ingredient_name,
      unit: ingredient.unit,
      vendor_id: ingredient.vendor_id || "",
      price_per_unit: ingredient.price_per_unit
    });
    setEditingIngredientId(ingredient.id);
  };

  const deleteVendor = async (id) => {
    await api.delete(`/vendors/${id}`);
    await loadData();
  };

  const deleteIngredient = async (id) => {
    await api.delete(`/ingredients/${id}`);
    await loadData();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="grid gap-6 xl:grid-cols-2">
          {[1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-slate-200/60" />)}
        </div>
      </div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Ingredients & Vendors"
        description="Manage supplier data and per-unit ingredient pricing for precise costing."
      />
      <p className="-mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">
        Price fields displayed in {region.currency}
      </p>

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitVendor} className="glass-card-premium space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-brand-500 to-violet-500 p-2.5 text-white shadow-sm">
              <Building2 size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{editingVendorId ? "Edit Vendor" : "Add Vendor"}</h2>
          </div>
          <TextInput
            label="Vendor name"
            value={vendorForm.vendor_name}
            onChange={(event) => setVendorForm((prev) => ({ ...prev, vendor_name: event.target.value }))}
            required
          />
          <TextInput
            label="Contact"
            value={vendorForm.contact}
            onChange={(event) => setVendorForm((prev) => ({ ...prev, contact: event.target.value }))}
          />
          <div className="flex gap-3">
            <PrimaryButton type="submit">{editingVendorId ? "Update Vendor" : "Create Vendor"}</PrimaryButton>
            {editingVendorId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => { setEditingVendorId(null); setVendorForm(vendorInitialForm); }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <form onSubmit={submitIngredient} className="glass-card-premium space-y-4 p-6">
          <div className="flex items-center gap-3">
            <div className="inline-flex rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 p-2.5 text-white shadow-sm">
              <Package size={18} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">{editingIngredientId ? "Edit Ingredient" : "Add Ingredient"}</h2>
          </div>
          <TextInput
            label="Ingredient name"
            value={ingredientForm.ingredient_name}
            onChange={(event) => setIngredientForm((prev) => ({ ...prev, ingredient_name: event.target.value }))}
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextInput
              label="Unit (kg/ltr/pcs)"
              value={ingredientForm.unit}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, unit: event.target.value }))}
              required
            />
            <TextInput
              label="Price per unit"
              type="number"
              min="0"
              step="0.01"
              value={ingredientForm.price_per_unit}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, price_per_unit: event.target.value }))}
              required
            />
          </div>
          <label className="block space-y-2">
            <span className="text-sm font-medium text-slate-700">Vendor</span>
            <select
              value={ingredientForm.vendor_id}
              onChange={(event) => setIngredientForm((prev) => ({ ...prev, vendor_id: event.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
            >
              <option value="">No vendor selected</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>{vendor.vendor_name}</option>
              ))}
            </select>
          </label>
          <div className="flex gap-3">
            <PrimaryButton type="submit">{editingIngredientId ? "Update Ingredient" : "Create Ingredient"}</PrimaryButton>
            {editingIngredientId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                onClick={() => { setEditingIngredientId(null); setIngredientForm(ingredientInitialForm); }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </motion.section>

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Vendors</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{vendors.length}</span>
          </div>
          {vendors.length === 0 ? (
            <EmptyState title="No vendors yet" description="Add your first supplier to start building your ingredient catalog." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3 font-semibold">Name</th>
                    <th className="px-6 py-3 font-semibold">Contact</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor, i) => (
                    <motion.tr
                      key={vendor.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-900">{vendor.vendor_name}</td>
                      <td className="px-6 py-3.5 text-slate-600">{vendor.contact || "-"}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => editVendor(vendor)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"><PencilLine size={14} /></button>
                          <button type="button" onClick={() => deleteVendor(vendor.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <h3 className="font-bold text-slate-900">Ingredients</h3>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{ingredients.length}</span>
          </div>
          {ingredients.length === 0 ? (
            <EmptyState
              title="No ingredients yet"
              description="Create your first ingredient to begin dish-level cost calculations."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3 font-semibold">Ingredient</th>
                    <th className="px-6 py-3 font-semibold">Unit</th>
                    <th className="px-6 py-3 font-semibold">Price</th>
                    <th className="px-6 py-3 font-semibold">Vendor</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient, i) => (
                    <motion.tr
                      key={ingredient.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-900">{ingredient.ingredient_name}</td>
                      <td className="px-6 py-3.5 text-slate-600">{ingredient.unit}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">{formatUsd(ingredient.price_per_unit)}</td>
                      <td className="px-6 py-3.5 text-slate-600">{vendorLookup[ingredient.vendor_id] || "-"}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => editIngredient(ingredient)} className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100"><PencilLine size={14} /></button>
                          <button type="button" onClick={() => deleteIngredient(ingredient.id)} className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
