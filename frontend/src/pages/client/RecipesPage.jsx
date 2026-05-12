import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, ChefHat, Eye, Edit3, BookOpen } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import TextInput from "../../components/ui/TextInput";
import { useCurrency } from "../../hooks/useCurrency";

const initialItem = { ingredient_id: "", quantity: "" };

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function RecipesPage() {
  const { formatUsd } = useCurrency();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recipeName, setRecipeName] = useState("");
  const [items, setItems] = useState([{ ...initialItem }]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  const ingredientLookup = useMemo(
    () => Object.fromEntries(ingredients.map((item) => [item.id, item.ingredient_name])),
    [ingredients]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [recipeRes, ingredientRes] = await Promise.all([api.get("/recipes"), api.get("/ingredients")]);
      setRecipes(recipeRes.data.recipes || []);
      setIngredients(ingredientRes.data.ingredients || []);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recipe module");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setRecipeName("");
    setItems([{ ...initialItem }]);
    setEditingId(null);
  };

  const submitRecipe = async (event) => {
    event.preventDefault();
    const payload = {
      recipe_name: recipeName,
      items: items
        .filter((item) => item.ingredient_id && item.quantity)
        .map((item) => ({ ingredient_id: item.ingredient_id, quantity: Number(item.quantity) }))
    };
    try {
      if (editingId) {
        await api.put(`/recipes/${editingId}`, payload);
      } else {
        await api.post("/recipes", payload);
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save recipe");
    }
  };

  const editRecipe = async (id) => {
    try {
      const { data } = await api.get(`/recipes/${id}`);
      const recipe = data.recipe;
      setEditingId(id);
      setRecipeName(recipe.recipe_name);
      setItems(recipe.items.map((item) => ({ ingredient_id: item.ingredient_id, quantity: item.quantity })));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load recipe details");
    }
  };

  const removeRecipe = async (id) => {
    try {
      await api.delete(`/recipes/${id}`);
      if (selectedRecipeId === id) { setSelectedRecipeId(null); setRecipeDetail(null); }
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete recipe");
    }
  };

  const selectRecipe = async (id) => {
    try {
      setSelectedRecipeId(id);
      const { data } = await api.get(`/recipes/${id}`);
      setRecipeDetail(data.recipe);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch recipe detail");
    }
  };

  if (loading) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="h-16 animate-pulse rounded-2xl bg-slate-200/60" />
        <div className="h-96 animate-pulse rounded-3xl bg-slate-200/60" />
      </motion.div>
    );
  }

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Recipe Builder"
        description="Build recipes with ingredient quantities and auto-calculate baseline ingredient costs."
      />

      {error ? <motion.p variants={fadeUp} className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</motion.p> : null}

      <motion.section variants={fadeUp} className="glass-card-premium p-6">
        <div className="flex items-center gap-3">
          <div className="inline-flex rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 p-2.5 text-white shadow-sm">
            <ChefHat size={18} />
          </div>
          <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Recipe" : "Create Recipe"}</h2>
        </div>
        <form onSubmit={submitRecipe} className="mt-4 space-y-5">
          <TextInput label="Recipe name" value={recipeName} onChange={(event) => setRecipeName(event.target.value)} required />
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="group grid gap-3 rounded-xl border border-slate-200/80 bg-white/50 p-3 transition-all hover:border-slate-300 md:grid-cols-[1fr_180px_44px]">
                <select
                  value={item.ingredient_id}
                  onChange={(event) => setItems((prev) => prev.map((row, ri) => ri === index ? { ...row, ingredient_id: event.target.value } : row))}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  required
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>{ingredient.ingredient_name}</option>
                  ))}
                </select>
                <input
                  type="number" min="0" step="0.001"
                  value={item.quantity}
                  onChange={(event) => setItems((prev) => prev.map((row, ri) => ri === index ? { ...row, quantity: event.target.value } : row))}
                  placeholder="Quantity"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, ri) => ri !== index))}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600 transition hover:bg-rose-50 disabled:opacity-30"
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, { ...initialItem }])}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
            >
              <Plus size={14} /> Add Ingredient
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit">{editingId ? "Update Recipe" : "Create Recipe"}</PrimaryButton>
            {editingId ? (
              <button type="button" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50" onClick={resetForm}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </motion.section>

      <motion.section variants={fadeUp} className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card-premium overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-200/80 px-6 py-4">
            <div className="flex items-center gap-3">
              <BookOpen size={16} className="text-slate-500" />
              <h3 className="font-bold text-slate-900">Recipe Library</h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{recipes.length}</span>
          </div>
          {recipes.length === 0 ? (
            <EmptyState title="No recipes yet" description="Create your first recipe to start margin and pricing analysis." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-6 py-3 font-semibold">Recipe</th>
                    <th className="px-6 py-3 font-semibold">Ingredients</th>
                    <th className="px-6 py-3 font-semibold">Cost</th>
                    <th className="px-6 py-3 text-right font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((recipe, i) => (
                    <motion.tr
                      key={recipe.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-slate-100/80 transition-colors last:border-0 hover:bg-slate-50/50"
                    >
                      <td className="px-6 py-3.5 font-medium text-slate-900">{recipe.recipe_name}</td>
                      <td className="px-6 py-3.5 text-slate-600">{recipe.ingredient_count}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">{formatUsd(recipe.total_cost)}</td>
                      <td className="px-6 py-3.5">
                        <div className="flex justify-end gap-2">
                          <button type="button" onClick={() => selectRecipe(recipe.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"><Eye size={13} /> View</button>
                          <button type="button" onClick={() => editRecipe(recipe.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"><Edit3 size={13} /> Edit</button>
                          <button type="button" onClick={() => removeRecipe(recipe.id)} className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="glass-card-premium p-6">
          <h3 className="font-bold text-slate-900">Recipe Breakdown</h3>
          {!selectedRecipeId || !recipeDetail ? (
            <div className="mt-6 flex flex-col items-center gap-3 py-8 text-center">
              <Eye size={24} className="text-slate-300" />
              <p className="text-sm text-slate-500">Select a recipe to inspect ingredient-level quantities and costs.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-4">
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
                <p className="text-lg font-bold text-slate-900">{recipeDetail.recipe_name}</p>
                <p className="mt-1 text-sm font-medium text-slate-600">Total cost: {formatUsd(recipeDetail.total_cost)}</p>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Ingredients</p>
              <ul className="space-y-2">
                {recipeDetail.items.map((item, i) => (
                  <motion.li
                    key={`${item.ingredient_id}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-slate-200/80 bg-white p-3.5 transition-all hover:border-slate-300"
                  >
                    <p className="text-sm font-semibold text-slate-900">
                      {ingredientLookup[item.ingredient_id] || item.ingredient_name}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      Qty {Number(item.quantity).toFixed(3)} {item.unit} &middot; {formatUsd(item.price_per_unit)}/unit
                    </p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>
      </motion.section>
    </motion.div>
  );
}
