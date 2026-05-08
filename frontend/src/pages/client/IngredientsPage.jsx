import { useEffect, useMemo, useState } from "react";
import { PencilLine, Trash2 } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import TextInput from "../../components/ui/TextInput";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import { useCurrency } from "../../hooks/useCurrency";

const vendorInitialForm = { vendor_name: "", contact: "" };
const ingredientInitialForm = {
  ingredient_name: "",
  unit: "",
  vendor_id: "",
  price_per_unit: ""
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

  useEffect(() => {
    loadData();
  }, []);

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
    return <div className="glass-card p-8 text-sm text-slate-500">Loading ingredient workspace...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Ingredients & Vendors"
        description="Manage supplier data and per-unit ingredient pricing for precise costing."
      />
      <p className="-mt-5 text-xs font-semibold uppercase tracking-wide text-slate-500">Price fields are displayed in {region.currency}</p>

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="grid gap-6 xl:grid-cols-2">
        <form onSubmit={submitVendor} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">{editingVendorId ? "Edit Vendor" : "Add Vendor"}</h2>
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
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setEditingVendorId(null);
                  setVendorForm(vendorInitialForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <form onSubmit={submitIngredient} className="glass-card space-y-4 p-6">
          <h2 className="text-lg font-bold text-slate-900">{editingIngredientId ? "Edit Ingredient" : "Add Ingredient"}</h2>
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
                <option key={vendor.id} value={vendor.id}>
                  {vendor.vendor_name}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-3">
            <PrimaryButton type="submit">{editingIngredientId ? "Update Ingredient" : "Create Ingredient"}</PrimaryButton>
            {editingIngredientId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={() => {
                  setEditingIngredientId(null);
                  setIngredientForm(ingredientInitialForm);
                }}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Vendors</h3>
          </div>
          {vendors.length === 0 ? (
            <div className="p-6 text-sm text-slate-500">No vendors yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Contact</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vendors.map((vendor) => (
                    <tr key={vendor.id} className="border-t border-slate-100">
                      <td className="px-6 py-3 font-medium text-slate-900">{vendor.vendor_name}</td>
                      <td className="px-6 py-3 text-slate-600">{vendor.contact || "-"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            onClick={() => editVendor(vendor)}
                          >
                            <PencilLine size={14} />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteVendor(vendor.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Ingredients</h3>
          </div>
          {ingredients.length === 0 ? (
            <EmptyState
              title="No ingredients yet"
              description="Create your first ingredient to begin dish-level cost calculations."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Ingredient</th>
                    <th className="px-6 py-3">Unit</th>
                    <th className="px-6 py-3">Price</th>
                    <th className="px-6 py-3">Vendor</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ingredients.map((ingredient) => (
                    <tr key={ingredient.id} className="border-t border-slate-100">
                      <td className="px-6 py-3 font-medium text-slate-900">{ingredient.ingredient_name}</td>
                      <td className="px-6 py-3 text-slate-600">{ingredient.unit}</td>
                      <td className="px-6 py-3 text-slate-600">{formatUsd(ingredient.price_per_unit)}</td>
                      <td className="px-6 py-3 text-slate-600">{vendorLookup[ingredient.vendor_id] || "-"}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                            onClick={() => editIngredient(ingredient)}
                          >
                            <PencilLine size={14} />
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                            onClick={() => deleteIngredient(ingredient.id)}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
