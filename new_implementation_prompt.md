# Technical Specification & Implementation Blueprint: Inventory-Linked Food Costing

We are building a real-time, database-driven **Food Costing Engine** where ingredients are parent assets (inventory) and recipes are child entities consuming specific ingredient quantities.

---

## 1. Database Schema Specifications

Make sure the following structures are applied in Supabase:
1. **`ingredients` Table**:
   * `id`: UUID (Primary Key)
   * `user_id`: UUID (Foreign Key to users)
   * `ingredient_name`: TEXT
   * `price_per_unit`: NUMERIC (The purchase price, e.g., ₹620)
   * `unit`: TEXT (The purchase base unit: must be constrained to `kg`, `g`, `l`, `ml`)
   * `vendor_id`: UUID (Optional, Foreign Key to vendors)
2. **`recipe_ingredients` Table**:
   * `recipe_id`: UUID (Foreign Key to recipes)
   * `ingredient_id`: UUID (Foreign Key to ingredients)
   * `quantity`: NUMERIC (The amount used in the recipe, e.g., 20)
   * `unit`: TEXT (The recipe usage unit: e.g., `g` or `kg`)
3. **`recipes` Table**:
   * `total_cost`: NUMERIC (Must store **only** the ingredient food cost sum, without operational overhead).

---

## 2. Unit Normalization Logic
Ensure `backend/src/utils/unitConverter.js` strictly supports:
* **Weight conversions**: `kg` $\leftrightarrow$ `g` (Factor of 1000)
* **Volume conversions**: `l` $\leftrightarrow$ `ml` (Factor of 1000)
* **Strict Type Safety**: Block cross-type conversions (e.g., trying to convert `kg` to `ml` must fail or throw a validation error).

---

## 3. Backend Costing Service (`costingService.js`)
Modify `calculateRecipeCost` to calculate the **true food cost** (Make Cost):
1. Query the recipe's ingredients and their corresponding inventory prices.
2. For each ingredient:
   * Fetch its purchase price (e.g., `price_per_unit = 620` for `unit = kg`).
   * Normalize the recipe's usage quantity (e.g., `quantity = 20` using `unit = g`) to the base unit.
   * Calculate: `(purchase_price / normalization_factor) * usage_quantity`.
3. Sum the cost of all ingredients.
4. Return **only** the raw food cost as `food_cost`. Keep operational expenses (electricity, gas, salaries, packaging) completely separate.
5. Update `recipes.total_cost` in the DB dynamically to reflect this food cost sum.

---

## 4. AI Unit Recommendation Engine
Implement a hybrid endpoint `/api/ai/recommend-unit` to suggest unit types:
1. **Heuristic Map**: Match common keywords:
   * *Liquids/Volumes* (suggests `l`/`ml`): oil, milk, water, juice, sauce, cream, vinegar, syrup.
   * *Solids/Weights* (suggests `kg`/`g`): butter, masala, powder, flour, chicken, paneer, cheese, onion, sugar, salt.
2. **AI Fallback**: If the keyword does not match, query OpenAI with a quick structured prompt:
   * Prompt: *"Given the ingredient name '{name}', classify it as solid (suggest kg/g) or liquid (suggest l/ml). Return JSON format: { 'unit_type': 'weight'|'volume', 'suggested_unit': 'kg'|'l' }"*
3. **UX Behavior**: Auto-select the suggested unit type on the frontend when typing an ingredient name, but allow the user to manually override it before saving.

---

## 5. Recipe Builder UI Integration (`RecipesPage.jsx`)
1. When selecting an ingredient from the dropdown:
   * Read its inventory base unit (e.g., `kg`).
   * Automatically filter the allowed recipe units to match the unit type (if base is `kg`, only show `g` and `kg` in the recipe unit dropdown).
2. As the user enters the usage quantity, use a debounce hook to call the costing preview API and update the "Raw Food Cost" preview dynamically.
3. Show the total calculated cost as "Make Cost (Excluding Operations)".
