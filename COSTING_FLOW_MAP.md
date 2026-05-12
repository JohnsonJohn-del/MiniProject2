# Costing Data Flow Map

This document maps the journey of costing data from ingestion to UI presentation.

## 1. Data Ingestion (The Bill Flow)
`Vendor Bill (Physical/PDF)`
↓
**Frontend:** `ImportPage.jsx` uploads image via FormData.
↓
**API:** `POST /api/import/upload-bill` (Multipart)
↓
**Service:** `ocrService.js` (Tesseract/Vision) extracts raw strings.
↓
**Service:** `aiImportService.js` transforms raw text into structured JSON (`vendor_name`, `items[]`) via OpenAI.
↓
**API:** `POST /api/import/save-bill`
↓
**Database:** Inserts into `ingredient_purchases`. *(Note: Does not currently update `ingredients` table base price automatically).*

## 2. Recipe Creation (The Composition Flow)
`Chef adds ingredients to a recipe`
↓
**Frontend:** `RecipesPage.jsx` sets arrays of `{ingredient_id, quantity}`.
↓
**API:** `POST /api/recipes`
↓
**Database:** Inserts `recipes` record, maps components via `recipe_ingredients` table.

## 3. Dynamic Cost Calculation (The Engine Flow)
`User views or evaluates a recipe`
↓
**Frontend:** Triggered on render or pricing evaluation.
↓
**API:** `GET /api/costing/recipes/:recipeId?month=YYYY-MM`
↓
**Service:** `costingService.js` (`calculateRecipeCost`)
   - `ingredientCost` = SUM(recipe_ingredients.quantity * ingredients.price_per_unit)
   - `opex` = SELECT from `operational_expenses` for the given month
   - `recipeCount` = SELECT count of all user recipes
   - `operationalAllocation` = `(electricity + gas) / recipeCount`
   - `salaryAllocation` = `salary / recipeCount`
   - `finalDishCost` = `ingredientCost + operationalAllocation + salaryAllocation`
↓
**Database:** Service automatically runs `UPDATE recipes SET total_cost = finalDishCost` to cache the result.
↓
**Frontend:** Receives JSON Breakdown, renders Cost Cards and charts.

## 4. Menu & Profitability (The Market Flow)
`User assigns a selling price`
↓
**Frontend:** `OperationalCostsPage.jsx` assigns recipe to Menu Item.
↓
**API:** `POST /api/menu-items`
↓
**Controller:** `menuItemController.js` re-runs `calculateRecipeCost()`.
↓
**Calculation:** `margin = ((selling_price - finalDishCost) / selling_price) * 100`.
↓
**Database:** Inserts `menu_items` with `profit_margin`.
↓
**API:** `GET /api/insights/ai-insights` reads `menu_items` and aggregates portfolio average margin, identifying underperforming items.
↓
**Frontend:** `AnalyticsPage.jsx` and `ImportPage.jsx` display AI Insights and Margin alerts.
