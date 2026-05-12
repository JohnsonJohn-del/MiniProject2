# FOOD COSTING ANALYSIS: Smart Food Costing SaaS

## 1. Current Costing Architecture
The system employs a multi-layered architecture to compute costs and margins, composed of:
- **API & Controllers:** `costingController.js`, `importController.js`, `menuItemController.js`, `insightController.js`
- **Service Layer:** `costingService.js` (core engine), `aiPricingService.js` (advisory), `aiImportService.js` (OCR parsing)
- **Database (Supabase):** Relies on `ingredients`, `recipe_ingredients`, `recipes`, `operational_expenses`, and `ingredient_purchases`.
- **Frontend Flow:** Modules like `OperationalCostsPage`, `IngredientsPage`, and `RecipesPage` trigger calculations on-demand, which refresh the `recipes.total_cost` in the database dynamically upon viewing.

## 2. Ingredient Cost Logic
- **Storage:** `ingredients` table stores the `price_per_unit` (base line price).
- **Formulas:** Ingredient cost in a recipe is `quantity * ingredients.price_per_unit`.
- **Wastage:** There is **no wastage or yield percentage handling**. The system assumes 100% yield from purchased raw goods, which is inaccurate for commercial kitchens (e.g., trimming meat or peeling vegetables).
- **Vendor Pricing updates:** The `insightController.js` tracks price histories, but the `importController.js` saving logic currently appends to `ingredient_purchases` without dynamically updating the main `ingredients.price_per_unit` unless `recordIngredientPrice` is explicitly called.

## 3. Recipe Cost Logic
- **Aggregation:** Handled in `costingService.js` (`calculateRecipeCost`).
- **Calculation:** Iterates over the `recipe_ingredients` join table to sum all component costs.
- **Serving Calculations:** The calculation aggregates raw ingredient totals, but lacks a strict "servings yield" denominator. It calculates the bulk cost of the recipe as the "final dish cost," requiring the user to define their recipe quantities exactly as a single serving.

## 4. Operational Cost Logic
- **Inputs:** Rent, Electricity, Gas, Salaries are recorded monthly in `operational_expenses`.
- **Allocation Formula:** 
  - `operationalAllocation = (electricity_bill + gas_bill) / recipeCount`
  - `salaryAllocation = salary_cost / recipeCount`
- **Assessment:** This logic is **fatally flawed**. It allocates fixed monthly overheads by simply dividing them by the *total number of recipe types* the user has created. In reality, adding a new test recipe to the database artificially lowers the overhead burden of your highest-selling steak! Overhead should be calculated as a fixed percentage (Prime Cost model) or allocated by actual *sales volume*, not the length of the recipe book.

## 5. Pricing Advisor Logic
- **AI Service (`aiPricingService.js`):** Pushes the `finalDishCost`, `recipeName`, and `currentPrice` to OpenAI (or uses a fallback mock).
- **Margin Formulas:** 
  - `currentMargin = ((currentPrice - finalDishCost) / currentPrice) * 100`
  - `idealSellingPrice = finalDishCost / (1 - targetMargin)`
- **Markup Logic:** The mock fallback hardcodes a strict 65% target margin (0.65). The AI prompt aims to generate a "conservative, profitability-focused" range.

## 6. AI/OCR Import Logic
- **OCR Pipeline:** Images are processed locally or via a vision API in `ocrService.js` to extract raw text.
- **Data Parsing:** `aiImportService.js` feeds the raw OCR text into an OpenAI prompt (JSON mode) with strict formatting instructions.
- **Entity Extraction:** Extracts `vendor_name`, `ingredient_name`, `quantity`, `unit`, and `price`.
- **Fallback:** Uses basic Regex and line-splitting if OpenAI API keys are missing.

## 7. Current Problems
1. **Broken Cost Inheritance:** Uploading a vendor bill via OCR saves it to `ingredient_purchases` but **does not update** the active `price_per_unit` in the `ingredients` table. Recipes remain costed on old data.
2. **Unrealistic Overhead Allocation:** As mentioned, dividing monthly rent by the "number of recipes" is structurally incorrect and leads to wildly inaccurate profit margins.
3. **Missing Yield/Trim Factors:** Lack of yield percentages causes food costs to be under-reported (e.g., buying a whole fish vs serving fillets).
4. **Missing Menu Mix / Sales Volume:** Costing doesn't factor in actual POS sales data, making the margin analysis purely theoretical.

## 8. Recommendations
- **What should remain untouched:** The OCR-to-AI extraction pipeline is excellent, and the deterministic business insight generator (`insightController.js`) provides solid, modular reporting.
- **What must be improved:**
  - **Overhead:** Rip out the "divide by recipe count" logic. Replace it with a flat overhead percentage per dish, or require sales volume inputs.
  - **Moving Averages:** Update the `saveBillImport` controller to recalculate the weighted average price of an ingredient and update the master `ingredients` table upon successful OCR import.
  - **Yield Configuration:** Add a `yield_percentage` column to ingredients so users can specify usable weights.

## FINAL SUMMARY
**1. Realism:** The current platform is functionally smooth but mathematically naive. The lack of yield handling and the flawed overhead allocation means a real restaurant would lose money relying on its current numbers.
**2. Current Level:** **Startup MVP**. The AI features and UI are highly polished and demo-ready, but the core accounting math lacks the rigor of commercial ERPs.
**3. Missing for Commercial-Ready:** To reach "Enterprise-Grade", the platform MUST implement: Weighted average ingredient pricing (FIFO), yield percentages, POS integration for sales volume (Menu Engineering matrices), and standard Prime Cost accounting for overheads rather than flat recipe division.
