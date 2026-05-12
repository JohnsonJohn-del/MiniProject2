import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

// === RICH DEMO SEED FOR client@demo.com ===
const CLIENT_EMAIL = "client@demo.com";

const INGREDIENTS = [
  { name: "All Purpose Flour", unit: "kg", price: 1.20, vendor: "Metro Cash & Carry" },
  { name: "Sugar", unit: "kg", price: 0.90, vendor: "Metro Cash & Carry" },
  { name: "Butter", unit: "kg", price: 5.50, vendor: "Daily Fresh Dairy" },
  { name: "Eggs", unit: "dozen", price: 2.80, vendor: "Daily Fresh Dairy" },
  { name: "Milk", unit: "liter", price: 1.10, vendor: "Daily Fresh Dairy" },
  { name: "Chicken Breast", unit: "kg", price: 6.50, vendor: "Fresh Foods Ltd" },
  { name: "Beef Ground", unit: "kg", price: 8.00, vendor: "Fresh Foods Ltd" },
  { name: "Olive Oil", unit: "liter", price: 12.00, vendor: "Restaurant Supply Co" },
  { name: "Tomatoes", unit: "kg", price: 2.50, vendor: "Fresh Foods Ltd" },
  { name: "Onions", unit: "kg", price: 1.00, vendor: "Metro Cash & Carry" },
  { name: "Garlic", unit: "kg", price: 3.50, vendor: "Fresh Foods Ltd" },
  { name: "Pasta (Penne)", unit: "kg", price: 2.00, vendor: "Restaurant Supply Co" },
  { name: "Mozzarella Cheese", unit: "kg", price: 7.00, vendor: "Daily Fresh Dairy" },
  { name: "Heavy Cream", unit: "liter", price: 4.50, vendor: "Daily Fresh Dairy" },
  { name: "Coffee Beans", unit: "kg", price: 15.00, vendor: "Restaurant Supply Co" }
];

const VENDORS = ["Fresh Foods Ltd", "Daily Fresh Dairy", "Metro Cash & Carry", "Restaurant Supply Co"];

const RECIPES = [
  {
    name: "Classic Chicken Alfredo",
    ingredients: [
      { name: "Chicken Breast", qty: 0.2 },
      { name: "Pasta (Penne)", qty: 0.15 },
      { name: "Heavy Cream", qty: 0.1 },
      { name: "Garlic", qty: 0.01 },
      { name: "Olive Oil", qty: 0.02 }
    ],
    sellingPrice: 18.50
  },
  {
    name: "Artisan Cappuccino",
    ingredients: [
      { name: "Coffee Beans", qty: 0.02 },
      { name: "Milk", qty: 0.25 }
    ],
    sellingPrice: 4.50
  },
  {
    name: "Beef Burger Deluxe",
    ingredients: [
      { name: "Beef Ground", qty: 0.25 },
      { name: "Tomatoes", qty: 0.05 },
      { name: "Onions", qty: 0.03 },
      { name: "Butter", qty: 0.02 },
      { name: "Eggs", qty: 0.08 }
    ],
    sellingPrice: 15.00
  },
  {
    name: "Margherita Pizza",
    ingredients: [
      { name: "All Purpose Flour", qty: 0.3 },
      { name: "Tomatoes", qty: 0.15 },
      { name: "Mozzarella Cheese", qty: 0.2 },
      { name: "Olive Oil", qty: 0.03 },
      { name: "Garlic", qty: 0.005 }
    ],
    sellingPrice: 14.00
  },
  {
    name: "Butter Chicken Curry",
    ingredients: [
      { name: "Chicken Breast", qty: 0.3 },
      { name: "Butter", qty: 0.05 },
      { name: "Heavy Cream", qty: 0.12 },
      { name: "Onions", qty: 0.08 },
      { name: "Garlic", qty: 0.02 }
    ],
    sellingPrice: 16.00
  }
];

async function main() {
  console.log("🌱 Starting Client Demo Data Seeder (client@demo.com)...");

  // 1. Find client user
  const { data: userRecord } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", CLIENT_EMAIL)
    .maybeSingle();

  if (!userRecord) {
    console.error("❌ client@demo.com not found in users table.");
    process.exit(1);
  }
  const userId = userRecord.id;
  console.log("✅ Found client user:", userId);

  // 2. Clear existing data
  console.log("🧹 Clearing old data for client...");
  await supabaseAdmin.from("menu_items").delete().eq("user_id", userId);

  const { data: existingRecipes } = await supabaseAdmin
    .from("recipes").select("id").eq("user_id", userId);
  if (existingRecipes?.length > 0) {
    await supabaseAdmin.from("recipe_ingredients")
      .delete().in("recipe_id", existingRecipes.map(r => r.id));
  }
  await supabaseAdmin.from("recipes").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredients").delete().eq("user_id", userId);
  await supabaseAdmin.from("vendors").delete().eq("user_id", userId);
  await supabaseAdmin.from("operational_expenses").delete().eq("user_id", userId);

  // Also try price history (may not exist yet)
  const { error: phCheckErr } = await supabaseAdmin
    .from("ingredient_price_history").select("id").limit(1);
  if (!phCheckErr) {
    await supabaseAdmin.from("ingredient_price_history").delete().eq("user_id", userId);
  }

  // 3. Create vendors
  console.log("🏭 Creating vendors...");
  const vendorMap = {};
  for (const vName of VENDORS) {
    const { data, error } = await supabaseAdmin
      .from("vendors")
      .insert({ user_id: userId, vendor_name: vName })
      .select("id").single();
    if (error) { console.error("Vendor error:", error.message); continue; }
    vendorMap[vName] = data.id;
  }
  console.log("   Created", Object.keys(vendorMap).length, "vendors");

  // 4. Create ingredients + purchase history
  console.log("🥗 Creating ingredients + purchase history...");
  const ingredientMap = {};
  const now = new Date();

  for (const ing of INGREDIENTS) {
    const { data, error } = await supabaseAdmin
      .from("ingredients")
      .insert({
        user_id: userId,
        ingredient_name: ing.name,
        unit: ing.unit,
        price_per_unit: ing.price,
        vendor_id: vendorMap[ing.vendor] || null
      })
      .select("id, price_per_unit").single();

    if (error) { console.error("Ingredient error:", ing.name, error.message); continue; }
    ingredientMap[ing.name] = data;

    // Purchase records (last 3 months for trend data)
    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
      const purchaseDate = new Date(now);
      purchaseDate.setMonth(purchaseDate.getMonth() - monthOffset);
      // Slight price variation for historical trend
      const variation = 1 + (Math.random() * 0.2 - 0.1); // ±10%
      const historicalPrice = (ing.price * variation).toFixed(4);

      await supabaseAdmin.from("ingredient_purchases").insert({
        user_id: userId,
        vendor_id: vendorMap[ing.vendor] || null,
        ingredient_name: ing.name,
        quantity: 10 + Math.floor(Math.random() * 20),
        unit: ing.unit,
        price: parseFloat(historicalPrice),
        purchase_date: purchaseDate.toISOString().split("T")[0]
      });

      // Also record price history if table exists
      if (!phCheckErr) {
        await supabaseAdmin.from("ingredient_price_history").insert({
          user_id: userId,
          ingredient_id: data.id,
          ingredient_name: ing.name,
          price_per_unit: parseFloat(historicalPrice),
          vendor_id: vendorMap[ing.vendor] || null,
          recorded_at: purchaseDate.toISOString(),
          source: "seeded"
        });
      }
    }
  }
  console.log("   Created", Object.keys(ingredientMap).length, "ingredients");

  // 5. Create operational expenses (current + last 3 months)
  console.log("💡 Creating operational expenses...");
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthOffset);
    const monthStr = d.toISOString().slice(0, 7) + "-01";
    await supabaseAdmin.from("operational_expenses").insert({
      user_id: userId,
      month: monthStr,
      electricity_bill: 380 + Math.floor(Math.random() * 120),
      gas_bill: 160 + Math.floor(Math.random() * 80),
      salary_cost: 4500 + Math.floor(Math.random() * 1000)
    });
  }

  // 6. Create recipes + menu items
  console.log("🍽️  Creating recipes & menu items...");
  for (const r of RECIPES) {
    let totalCost = 0;
    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (ing) totalCost += ing.price_per_unit * i.qty;
    }

    const { data: recipe, error: recipeErr } = await supabaseAdmin
      .from("recipes")
      .insert({
        user_id: userId,
        recipe_name: r.name,
        total_cost: totalCost.toFixed(2)
      })
      .select("id").single();

    if (recipeErr) { console.error("Recipe error:", r.name, recipeErr.message); continue; }

    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (!ing) continue;
      await supabaseAdmin.from("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: ing.id,
        quantity: i.qty
      });
    }

    const finalDishCost = totalCost + 1.80; // ~£1.80 operational per dish
    const profitMargin = ((r.sellingPrice - finalDishCost) / r.sellingPrice) * 100;

    await supabaseAdmin.from("menu_items").insert({
      user_id: userId,
      recipe_id: recipe.id,
      selling_price: r.sellingPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: (finalDishCost * 3.2).toFixed(2)
    });
  }
  console.log("   Created", RECIPES.length, "recipes + menu items");

  // 7. AI usage logs
  const { error: aiErr } = await supabaseAdmin.from("ai_usage_logs").select("id").limit(1);
  if (!aiErr) {
    await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("ai_usage_logs").insert({
      user_id: userId,
      request_count: 8,
      log_date: now.toISOString().split("T")[0]
    });
  }

  console.log("\n✅ Client demo seeding complete!");
  console.log("   User: client@demo.com");
  console.log("   Vendors:", VENDORS.length);
  console.log("   Ingredients:", INGREDIENTS.length);
  console.log("   Recipes:", RECIPES.length);
}

main().catch(console.error);
