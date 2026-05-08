import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import TextInput from "../../components/ui/TextInput";

const initialItem = { ingredient_id: "", quantity: "" };

export default function RecipesPage() {
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
      setRecipes(recipeRes.data.recipes);
      setIngredients(ingredientRes.data.ingredients);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load recipe module");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

    if (editingId) {
      await api.put(`/recipes/${editingId}`, payload);
    } else {
      await api.post("/recipes", payload);
    }
    resetForm();
    await loadData();
  };

  const editRecipe = async (id) => {
    const { data } = await api.get(`/recipes/${id}`);
    const recipe = data.recipe;
    setEditingId(id);
    setRecipeName(recipe.recipe_name);
    setItems(
      recipe.items.map((item) => ({
        ingredient_id: item.ingredient_id,
        quantity: item.quantity
      }))
    );
  };

  const removeRecipe = async (id) => {
    await api.delete(`/recipes/${id}`);
    if (selectedRecipeId === id) {
      setSelectedRecipeId(null);
      setRecipeDetail(null);
    }
    await loadData();
  };

  const selectRecipe = async (id) => {
    setSelectedRecipeId(id);
    const { data } = await api.get(`/recipes/${id}`);
    setRecipeDetail(data.recipe);
  };

  if (loading) {
    return <div className="glass-card p-8 text-sm text-slate-500">Loading recipe workspace...</div>;
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Recipe Builder"
        description="Build recipes with ingredient quantities and auto-calculate baseline ingredient costs."
      />

      {error ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{error}</p> : null}

      <section className="glass-card p-6">
        <h2 className="text-lg font-bold text-slate-900">{editingId ? "Edit Recipe" : "Create Recipe"}</h2>
        <form onSubmit={submitRecipe} className="mt-4 space-y-5">
          <TextInput label="Recipe name" value={recipeName} onChange={(event) => setRecipeName(event.target.value)} required />
          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={index} className="grid gap-3 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_180px_44px]">
                <select
                  value={item.ingredient_id}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, ingredient_id: event.target.value } : row
                      )
                    )
                  }
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  required
                >
                  <option value="">Select ingredient</option>
                  {ingredients.map((ingredient) => (
                    <option key={ingredient.id} value={ingredient.id}>
                      {ingredient.ingredient_name}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={item.quantity}
                  onChange={(event) =>
                    setItems((prev) =>
                      prev.map((row, rowIndex) =>
                        rowIndex === index ? { ...row, quantity: event.target.value } : row
                      )
                    )
                  }
                  placeholder="Quantity"
                  className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-brand-400 focus:ring-4 focus:ring-brand-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, rowIndex) => rowIndex !== index))}
                  className="rounded-lg border border-rose-200 p-2 text-rose-600 hover:bg-rose-50"
                  disabled={items.length === 1}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, { ...initialItem }])}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <Plus size={14} /> Add Ingredient Row
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            <PrimaryButton type="submit">{editingId ? "Update Recipe" : "Create Recipe"}</PrimaryButton>
            {editingId ? (
              <button
                type="button"
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
                onClick={resetForm}
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="glass-card overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-4">
            <h3 className="font-bold text-slate-900">Recipe Library</h3>
          </div>
          {recipes.length === 0 ? (
            <EmptyState
              title="No recipes yet"
              description="Create your first recipe to start margin and pricing analysis."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Recipe</th>
                    <th className="px-6 py-3">Ingredients</th>
                    <th className="px-6 py-3">Cost</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map((recipe) => (
                    <tr key={recipe.id} className="border-t border-slate-100">
                      <td className="px-6 py-3 font-medium text-slate-900">{recipe.recipe_name}</td>
                      <td className="px-6 py-3 text-slate-600">{recipe.ingredient_count}</td>
                      <td className="px-6 py-3 text-slate-600">${Number(recipe.total_cost).toFixed(2)}</td>
                      <td className="px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            onClick={() => selectRecipe(recipe.id)}
                          >
                            View
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700"
                            onClick={() => editRecipe(recipe.id)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600"
                            onClick={() => removeRecipe(recipe.id)}
                          >
                            Delete
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

        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900">Recipe Breakdown</h3>
          {!selectedRecipeId || !recipeDetail ? (
            <p className="mt-3 text-sm text-slate-500">Select a recipe to inspect ingredient-level quantities.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900">{recipeDetail.recipe_name}</p>
                <p className="text-sm text-slate-600">Total cost: ${Number(recipeDetail.total_cost).toFixed(2)}</p>
              </div>
              <ul className="space-y-3">
                {recipeDetail.items.map((item) => (
                  <li key={`${item.ingredient_id}-${item.quantity}`} className="rounded-xl border border-slate-200 p-3">
                    <p className="text-sm font-semibold text-slate-900">
                      {ingredientLookup[item.ingredient_id] || item.ingredient_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Qty {Number(item.quantity).toFixed(3)} {item.unit} at ${Number(item.price_per_unit).toFixed(2)}/unit
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
