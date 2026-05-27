# Project FAQ & Costing Doubts

This document lists common questions and concise answers regarding the costing logic, UI changes, and database behavior of the Food Costing application.

---

### 1. Ingredient Price Updates & Recipe Costing
**Q:** If the price or name of an ingredient is changed, does it automatically update the cost of all recipes containing that ingredient?  
**A:** **Yes.** Recipe costs are calculated dynamically by aggregating the quantities of their constituent ingredients. Any change to an ingredient's price instantly cascades and updates the cost of all associated recipes in real time.

---

### 2. Inline Row Editing (Water Bill Remaining Zero)
**Q:** Why did the water bill remain zero even after saving or updating the operational expenses?  
**A:** This was an inline state binding issue where the water bill field was either omitted from the update payload or not cast to a number properly. The codebase has been updated so that all inline input values are parsed as numbers and saved directly to the database.

---

### 3. Delivery Price Slider Simplification
**Q:** Why did the Zomato and Swiggy cards previously have range sliders, and why were they simplified to just a single master slider?  
**A:** Originally, each platform had a range slider to simulate prices. However, since delivery pricing is typically a direct markup of the dine-in price, having multiple sliders cluttered the UI. The platform sliders were removed, leaving only the Dine-in slider as the single master controller. Platform prices are now directly editable via number fields.

---

### 4. Assumed Monthly Servings Definition
**Q:** Does the "Overall Monthly Servings" input represent the servings of a single dish or the overall dishes served at the cafe?  
**A:** It represents the **overall combined volume of all dishes and drinks served in the cafe per month**. It is used to distribute fixed monthly bills (rent, staff salaries, utilities) across all transactions.

---

### 5. Multi-Variety Cafes (Low Individual Volume)
**Q:** How does a cafe calculate overhead if they run on a wide variety of menu items (low volume per dish) rather than high volume of a single dish?  
**A:** The total monthly sales of all items are combined (e.g. 50 items × 100 servings = 5,000 total servings). Fixed overhead costs are divided by this total volume. Every item sold absorbs its equal portion ($1/5000\text{th}$) of the overhead, regardless of the recipe.

---

### 6. Pricing for Brand New Cafes (No Historical Sales)
**Q:** How can a new cafe model their menu prices if they have zero historical sales or servings data?  
**A:** A new cafe can model target prices by:
1. Entering **projected monthly bills** and **target servings volume** to forecast break-even points.
2. Relying on the system's **built-in industry baselines** (15% operational markup, 10% labor markup of the ingredient cost) which automatically apply when no expenses are logged.
