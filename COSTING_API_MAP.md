# Costing API Map

Complete dictionary of REST API endpoints responsible for food costing, pricing, and margin analysis.

## Core Costing Endpoints

### 1. `GET /api/costing/recipes/:recipeId`
- **Purpose:** Dynamically calculates the exact real-time cost of a recipe.
- **Query Params:** `month` (optional, format: YYYY-MM. Defaults to current month for overhead lookups).
- **Dependencies:** Requires `operationalCosting` feature flag active (Pro/Premium).
- **Response:**
  ```json
  {
    "success": true,
    "recipe": { "id": "...", "recipe_name": "...", "total_cost": 5.40 },
    "month": "2026-05-01",
    "ingredientCost": 4.10,
    "operationalAllocation": 0.50,
    "salaryAllocation": 0.80,
    "finalDishCost": 5.40
  }
  ```
- **Used by:** `RecipesPage.jsx`, `OperationalCostsPage.jsx`

---

## Menu & Margins

### 2. `POST /api/menu-items`
- **Purpose:** Links a recipe to a live selling price and calculates profit margin.
- **Payload:** `{ "recipe_id": "uuid", "selling_price": 15.00 }`
- **Response:**
  ```json
  {
    "success": true,
    "menuItem": {
      "id": "...",
      "recipe_id": "...",
      "selling_price": 15.00,
      "profit_margin": "64.00"
    }
  }
  ```
- **Used by:** `OperationalCostsPage.jsx`

---

## Import & OCR

### 3. `POST /api/import/save-bill`
- **Purpose:** Commits AI-parsed OCR data into the procurement ledger.
- **Payload:**
  ```json
  {
    "vendor_name": "Sysco",
    "items": [
      { "ingredient_name": "Tomatoes", "quantity": 10, "unit": "kg", "price": 45.00 }
    ]
  }
  ```
- **Response:** Vendor creation payload and array of `ingredient_purchases`.
- **Used by:** `ImportPage.jsx`

---

## AI & Insights

### 4. `POST /api/ai/pricing-advice`
- **Purpose:** Generates OpenAI-powered markup strategies.
- **Dependencies:** Requires `aiPricingSuggestions` feature flag.
- **Payload:** `{ "recipeId": "uuid" }`
- **Response:**
  ```json
  {
    "success": true,
    "source": "openai",
    "recommendation": {
      "recipeName": "Ribeye Steak",
      "idealSellingPrice": 45.00,
      "suggestedRange": { "min": 42.00, "max": 48.00 },
      "currentMargin": 62.5
    },
    "warnings": ["Margin dropping due to recent beef price increase"],
    "improvements": ["Bundle with high-margin wine pairing"]
  }
  ```
- **Used by:** `RecipesPage.jsx` (Pricing Advisor Modal)

### 5. `GET /api/insights/ai-insights`
- **Purpose:** Master analytical endpoint aggregating margins, opex trends, and ingredient inflation.
- **Response:**
  ```json
  {
    "success": true,
    "summary": { "avg_margin": 61.2, "opex_change_pct": 5.4 },
    "insights": [
      {
        "type": "warning",
        "title": "Low Margin Alert",
        "message": "Burger has only 25% margin.",
        "metric": "25.0%",
        "action": "Review pricing"
      }
    ]
  }
  ```
- **Used by:** `AnalyticsPage.jsx`, `ImportPage.jsx`
