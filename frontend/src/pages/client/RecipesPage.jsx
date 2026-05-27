import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, ChefHat, Eye, Edit3, BookOpen, ChevronRight, Scale, Droplet } from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader";
import PrimaryButton from "../../components/ui/PrimaryButton";
import EmptyState from "../../components/ui/EmptyState";
import TextInput from "../../components/ui/TextInput";
import { useCurrency } from "../../hooks/useCurrency";

const UNIT_MAP = {
  weight: ["kg", "g"],
  liquid: ["l", "ml"]
};

const initialItem = { ingredient_id: "", quantity: "", unit: "" };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } }
};

export default function RecipesPage() {
  const { formatUsd } = useCurrency();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);
  const [recipeDetail, setRecipeDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  const [recipeName, setRecipeName] = useState("");
  const [items, setItems] = useState([{ ...initialItem }]);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [livePreviewCost, setLivePreviewCost] = useState(null);
  const [recipeToDelete, setRecipeToDelete] = useState(null);

  const ingredientLookup = useMemo(
    () => Object.fromEntries((ingredients || []).map((item) => [item.id, item])),
    [ingredients]
  );

  const loadData = async () => {
    setLoading(true);
    setError("");
    try {
      const [recipeRes, ingredientRes] = await Promise.all([api.get("/recipes"), api.get("/ingredients")]);
      setRecipes(recipeRes.data?.recipes || (Array.isArray(recipeRes.data) ? recipeRes.data : []));
      setIngredients(ingredientRes.data?.ingredients || (Array.isArray(ingredientRes.data) ? ingredientRes.data : []));
    } catch (err) {
      setError("Unable to load recipe module");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setRecipeName("");
    setItems([{ ...initialItem }]);
    setEditingId(null);
    setLivePreviewCost(null);
  };

  const handleIngredientChange = (index, ingredientId) => {
    const ing = ingredientLookup[ingredientId];
    setItems(prev => prev.map((row, ri) => 
      ri === index 
        ? { ...row, ingredient_id: ingredientId, unit: ing?.unit || "" } 
        : row
    ));
  };

  const submitRecipe = async (event) => {
    event.preventDefault();
    const payload = {
      recipe_name: recipeName,
      items: items
        .filter((item) => item.ingredient_id && item.quantity)
        .map((item) => ({ 
          ingredient_id: item.ingredient_id, 
          quantity: Number(item.quantity),
          unit: item.unit
        }))
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
      setItems(recipe.items.map((item) => {
        let qty = item.quantity;
        let unitStr = item.unit || ingredientLookup[item.ingredient_id]?.unit || "kg";
        
        // Auto format fractional quantities to the smaller unit so it preserves user input
        if (qty > 0 && qty < 1 && (unitStr === "kg" || unitStr === "l")) {
          qty = Number((qty * 1000).toFixed(2));
          unitStr = unitStr === "kg" ? "g" : "ml";
        }

        return { 
          ingredient_id: item.ingredient_id, 
          quantity: qty,
          unit: unitStr
        };
      }));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError("Failed to load recipe details");
    }
  };

  const selectRecipe = async (id) => {
    try {
      const { data } = await api.get(`/recipes/${id}`);
      const recipe = data.recipe;
      
      // Auto format fractional quantities to the smaller unit
      recipe.items = recipe.items.map((item) => {
        let qty = item.quantity;
        let unitStr = item.unit || ingredientLookup[item.ingredient_id]?.unit || "kg";
        if (qty > 0 && qty < 1 && (unitStr === "kg" || unitStr === "l")) {
          qty = Number((qty * 1000).toFixed(2));
          unitStr = unitStr === "kg" ? "g" : "ml";
        }
        return { ...item, quantity: qty, unit: unitStr };
      });

      setSelectedRecipeId(id);
      setRecipeDetail(recipe);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch recipe detail");
    }
  };

  const removeRecipe = async (id) => {
    setRecipeToDelete(id);
  };

  const confirmRemoveRecipe = async () => {
    if (!recipeToDelete) return;
    try {
      await api.delete(`/recipes/${recipeToDelete}`);
      if (selectedRecipeId === recipeToDelete) {
        setSelectedRecipeId(null);
        setRecipeDetail(null);
      }
      await loadData();
      setRecipeToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete recipe");
      setRecipeToDelete(null);
    }
  };

  useEffect(() => {
    const validItems = items.filter(item => item.ingredient_id && item.quantity && !isNaN(Number(item.quantity)));
    if (validItems.length === 0) {
      setLivePreviewCost(null);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      try {
        const payload = {
          items: validItems.map(item => ({
            ingredient_id: item.ingredient_id,
            quantity: Number(item.quantity),
            unit: item.unit
          }))
        };
        const response = await api.post("/recipes/preview-cost", payload);
        if (response.data?.success) {
          setLivePreviewCost(response.data.food_cost);
        }
      } catch (err) {
        console.error("Live preview error:", err);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [items]);


  if (loading) return <div className="p-8 text-center text-slate-500">Loading recipes...</div>;

  return (
    <motion.div initial="hidden" animate="show" className="space-y-8">
      <PageHeader
        title="Recipe Builder"
        description="Construct dishes with precise unit conversions and margin protection."
      />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-6">
          {/* Editor */}
          <form onSubmit={submitRecipe} className="glass-card-premium p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="inline-flex rounded-xl bg-brand-600 p-2.5 text-white shadow-brand-200 shadow-lg">
                <ChefHat size={18} />
              </div>
              <h2 className="text-lg font-bold text-slate-900">{editingId ? "Modify Recipe" : "New Recipe Formulation"}</h2>
            </div>

            <div className="space-y-6">
              <TextInput 
                label="Dish Name" 
                placeholder="e.g. Signature Butter Chicken"
                value={recipeName} 
                onChange={(e) => setRecipeName(e.target.value)} 
                required 
              />

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Ingredients & Scaling</span>
                </div>
                
                {items.map((item, index) => {
                  const baseIng = ingredientLookup[item.ingredient_id];
                  const isLiquid = baseIng && ["l", "ml"].includes(baseIng.unit);
                  const availableUnits = isLiquid ? UNIT_MAP.liquid : UNIT_MAP.weight;

                  return (
                    <motion.div 
                      key={index} 
                      layout
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="group flex flex-col md:flex-row gap-3 p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-brand-200 transition-all hover:shadow-md"
                    >
                      <div className="flex-1">
                        <select
                          value={item.ingredient_id}
                          onChange={(e) => handleIngredientChange(index, e.target.value)}
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none transition"
                          required
                        >
                          <option value="">Select ingredient</option>
                          {ingredients.map(ing => (
                            <option key={ing.id} value={ing.id}>{ing.ingredient_name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex gap-2 w-full md:w-[240px]">
                        <input
                          type="number"
                          step="0.001"
                          placeholder="0.000"
                          value={item.quantity}
                          onChange={(e) => setItems(prev => prev.map((row, ri) => ri === index ? { ...row, quantity: e.target.value } : row))}
                          className="w-full h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm focus:border-brand-400 focus:ring-4 focus:ring-brand-100 outline-none transition"
                          required
                        />
                        <select
                          value={item.unit}
                          onChange={(e) => setItems(prev => prev.map((row, ri) => ri === index ? { ...row, unit: e.target.value } : row))}
                          className="w-24 h-11 rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold uppercase text-slate-600 focus:border-brand-400 outline-none transition"
                          required
                        >
                          {availableUnits.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => setItems(prev => prev.filter((_, ri) => ri !== index))}
                        className="h-11 w-11 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        disabled={items.length === 1}
                      >
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  );
                })}

                <button
                  type="button"
                  onClick={() => setItems(prev => [...prev, { ...initialItem }])}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-brand-600 hover:bg-brand-50 rounded-xl transition-colors w-fit"
                >
                  <Plus size={16} /> Add Ingredient Line
                </button>
              </div>
            </div>

            {livePreviewCost !== null && (
              <div className="mt-6 p-4 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-brand-600 block uppercase tracking-wider">Live Cost Estimate</span>
                  <span className="text-[10px] text-slate-500 font-medium">Excluding operational and packaging overhead</span>
                </div>
                <span className="text-2xl font-black text-brand-700">{formatUsd(livePreviewCost)}</span>
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <PrimaryButton type="submit" className="flex-1">
                {editingId ? "Commit Changes" : "Finalize Recipe"}
              </PrimaryButton>
              {editingId && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          {/* List */}
          <div className="glass-card-premium overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-slate-400" />
                <h3 className="font-bold text-slate-900">Standardized Recipes</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
                    <th className="px-6 py-3">Dish</th>
                    <th className="px-6 py-3">Cost Breakdown</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recipes.map(r => (
                    <tr key={r.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{r.recipe_name}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter mt-0.5">
                          {r.ingredient_count || 0} Ingredients
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                           <span className="text-lg font-extrabold text-brand-700">{formatUsd(r.total_cost)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => selectRecipe(r.id)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><Eye size={16} /></button>
                          <button onClick={() => editRecipe(r.id)} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-xl transition-all"><Edit3 size={16} /></button>
                          <button onClick={() => removeRecipe(r.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Breakdown Panel */}
        <div className="space-y-6">
          <AnimatePresence mode="wait">
            {recipeDetail ? (
              <motion.div
                key={selectedRecipeId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="glass-card-premium p-6 sticky top-8"
              >
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-1.5 h-6 bg-brand-600 rounded-full" />
                  <h3 className="font-bold text-slate-900 text-lg">Detailed Analysis</h3>
                </div>

                <div className="bg-slate-900 rounded-2xl p-6 text-white mb-8 shadow-xl shadow-slate-200">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Recipe Total Cost</p>
                  <h4 className="text-3xl font-black">{formatUsd(recipeDetail.total_cost)}</h4>
                  <div className="mt-4 pt-4 border-t border-slate-800 flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-400">
                      <Scale size={14} />
                    </div>
                    <p className="text-xs text-slate-300">Normalized to base units (kg/l) for calculation accuracy.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-2">Cost Components</h5>
                  {recipeDetail.items?.map((item, i) => {
                    const isLiquid = ["l", "ml"].includes(item.unit);
                    return (
                      <div key={i} className="flex items-center gap-4 p-3 rounded-xl border border-slate-100 bg-white">
                        <div className={`p-2 rounded-lg ${isLiquid ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                          {isLiquid ? <Droplet size={14} /> : <Scale size={14} />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-900">{item.ingredient_name}</p>
                          <p className="text-[11px] text-slate-500">{item.quantity} {item.unit} &times; {formatUsd(item.price_per_unit)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-slate-900">{formatUsd((item.quantity * item.price_per_unit) / (item.unit === 'g' || item.unit === 'ml' ? 1000 : 1))}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <div className="glass-card-premium p-12 text-center flex flex-col items-center justify-center space-y-4 opacity-60">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                   <Eye size={32} />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Select a Recipe</p>
                  <p className="text-sm text-slate-500">View detailed costing analysis and ingredient splits.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {recipeToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-100"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500 mb-4">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Recipe?</h3>
              <p className="text-slate-500 text-sm mb-6">
                Are you sure you want to delete this recipe? This action cannot be undone and will permanently remove all associated ingredient costs and data.
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setRecipeToDelete(null)}
                  className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmRemoveRecipe}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-rose-500 text-white shadow-lg shadow-rose-200 hover:bg-rose-600 hover:shadow-rose-300 transition-all"
                >
                  Yes, delete recipe
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
