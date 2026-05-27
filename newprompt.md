We are now moving to a REAL inventory-linked food costing architecture.

This is one of the MOST IMPORTANT structural upgrades of the platform.

DO NOT overengineer.
DO NOT add warehouse/inventory depletion logic yet.

For now:
focus ONLY on accurate ingredient-driven recipe food costing.

====================================================
CORE IDEA
=========

Ingredients are the PARENT inventory assets.

Recipes are CHILD entities consuming ingredient quantities.

The final dish cost should be calculated dynamically based on:

* ingredient purchase pricing
* ingredient quantity used in recipe
* automatic unit normalization

====================================================
EXAMPLE
=======

Ingredient:
Butter

Purchase:
1kg = ₹620

Recipe Usage:
20g butter

System must calculate:

(620 / 1000) * 20
= ₹12.4

This becomes the butter contribution to the recipe food cost.

====================================================
IMPORTANT
=========

For NOW:
ONLY calculate FOOD COST.

DO NOT include:

* operational cost
* salary allocation
* electricity
* rent
* packaging
* Swiggy commissions

This phase is ONLY:
ingredient-driven food costing.

====================================================
PHASE 1 — INVENTORY-BASED INGREDIENT MODEL
==========================================

Ingredients become inventory pricing assets.

Each ingredient must store:

* ingredient_name
* category
* purchase_price
* base_unit
* unit_type

====================================================
ALLOWED UNITS
=============

ONLY allow:

Weight:

* kg
* g

Liquid:

* l
* ml

NO custom units.

NO tbsp.
NO cups.
NO spoons.
NO arbitrary strings.

====================================================
UNIT TYPE RULE
==============

Weight ingredients:

* kg/g only

Liquid ingredients:

* l/ml only

Prevent invalid combinations.

Examples:
❌ 1ml butter chicken masala
❌ 20kg milk in coffee recipe
❌ 10l garam masala

====================================================
PHASE 2 — RECIPE INGREDIENT RELATIONSHIP
========================================

Recipe ingredients should reference inventory ingredients directly.

Create relationship:

Ingredient (Parent)
→ RecipeIngredient (Child)
→ Recipe

RecipeIngredient should store:

* ingredient_id
* recipe_id
* quantity_used
* unit_used

====================================================
PHASE 3 — AUTOMATIC UNIT NORMALIZATION
======================================

Build centralized unit conversion utility.

Examples:

kg ↔ g
l ↔ ml

System should automatically normalize internally.

Examples:

20g from ₹620/kg:
= ₹12.4

200ml from ₹70/l:
= ₹14

====================================================
PHASE 4 — DYNAMIC FOOD COST ENGINE
==================================

Recipe food cost must calculate dynamically.

Formula:

Food Cost =
SUM(
ingredient quantity cost
)

NO hardcoded values.

NO manual food cost entry.

Everything MUST come from database pricing.

====================================================
PHASE 5 — DATABASE-DRIVEN ONLY
==============================

IMPORTANT:

NO hardcoded ingredient pricing.
NO fake frontend calculations.
NO temporary mock arrays.

Everything must:

* fetch from Supabase
* calculate dynamically
* update automatically

If ingredient price changes:
recipe cost must instantly reflect updated pricing.

====================================================
PHASE 6 — AI UNIT RECOMMENDATION
================================

Add intelligent ingredient unit suggestions.

Examples:

Butter:
→ kg/g

Palm Oil:
→ l/ml

Milk:
→ l/ml

Garam Masala:
→ kg/g

Rice:
→ kg/g

Chicken:
→ kg/g

The AI should suggest:

* correct unit type
* default measurement behavior

BUT:
user must still confirm.

AI should NOT have full control.

====================================================
PHASE 7 — RECIPE BUILDER UX
===========================

Improve recipe creation flow.

User flow:

1. Select ingredient from DB
2. System auto-detects unit type
3. Allowed units filtered automatically
4. User enters quantity
5. Cost preview updates live

Example:

Butter:
Allowed:

* g
* kg

Milk:
Allowed:

* ml
* l

====================================================
PHASE 8 — VALIDATION
====================

STRICTLY prevent:

* impossible unit pairings
* invalid conversions
* negative quantities
* broken cost calculations
* NaN outputs

====================================================
PHASE 9 — REALISTIC INDIAN INGREDIENT LIBRARY
=============================================

Create predefined ingredient suggestions commonly used in India.

Examples:

Dairy:

* Butter
* Paneer
* Cheese
* Milk
* Cream

Spices:

* Garam Masala
* Chilli Powder
* Turmeric
* Cumin

Oils:

* Palm Oil
* Sunflower Oil
* Mustard Oil

Vegetables:

* Onion
* Tomato
* Potato

====================================================
FINAL GOAL
==========

The platform should now behave like:

“A real inventory-linked restaurant food costing engine.”

The user should:

* add ingredients
* set purchase pricing
* create recipes
* select ingredient quantities

and the system should automatically calculate:

TRUE FOOD COST
based entirely on live ingredient pricing.

NO hardcoding.
NO fake pricing.
NO operational overhead yet.
ONLY accurate ingredient-driven costing.
