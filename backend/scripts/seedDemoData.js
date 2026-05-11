import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

const DEMO_EMAIL = "admin@demo.com";
const DEMO_PASSWORD = "password123";

const INGREDIENTS = [
  { name: "All Purpose Flour", unit: "kg", price: 1.20 },
  { name: "Sugar", unit: "kg", price: 0.90 },
  { name: "Butter", unit: "kg", price: 5.50 },
  { name: "Eggs", unit: "dozen", price: 2.80 },
  { name: "Milk", unit: "liter", price: 1.10 },
  { name: "Chicken Breast", unit: "kg", price: 6.50 },
  { name: "Beef Ground", unit: "kg", price: 8.00 },
  { name: "Olive Oil", unit: "liter", price: 12.00 },
  { name: "Tomatoes", unit: "kg", price: 2.50 },
  { name: "Onions", unit: "kg", price: 1.00 },
  { name: "Garlic", unit: "kg", price: 3.50 },
  { name: "Pasta (Penne)", unit: "kg", price: 2.00 },
  { name: "Mozzarella Cheese", unit: "kg", price: 7.00 },
  { name: "Heavy Cream", unit: "liter", price: 4.50 },
  { name: "Coffee Beans", unit: "kg", price: 15.00 }
];

const VENDORS = ["Sysco Foods", "Local Farms Co", "Restaurant Supply Inc", "Daily Fresh Dairy"];

async function main() {
  console.log("Starting Demo Data Seeder...");

  // 1. Ensure Demo User Exists
  let { data: userRecord } = await supabaseAdmin.from("users").select("id").eq("email", DEMO_EMAIL).maybeSingle();
  let userId;

  if (!userRecord) {
    console.log("Creating demo user...");
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
      user_metadata: { role: "admin", name: "Demo Admin", subscription_plan: "premium" }
    });
    if (authErr) throw authErr;

    const { data: newUser, error: dbErr } = await supabaseAdmin.from("users").insert({
      email: DEMO_EMAIL,
      password_hash: "supabase-auth",
      name: "Demo Admin",
      role: "admin",
      subscription_plan: "premium"
    }).select("id").single();
    if (dbErr) throw dbErr;
    userId = newUser.id;
  } else {
    userId = userRecord.id;
    console.log("Found existing demo user.");
  }

  // 2. Clear Existing Data for Demo User
  console.log("Clearing old demo data...");
  await supabaseAdmin.from("menu_items").delete().eq("user_id", userId);
  await supabaseAdmin.from("recipe_ingredients").delete().in("recipe_id", (
    await supabaseAdmin.from("recipes").select("id").eq("user_id", userId)
  ).data?.map(r => r.id) || []);
  await supabaseAdmin.from("recipes").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredients").delete().eq("user_id", userId);
  await supabaseAdmin.from("vendors").delete().eq("user_id", userId);
  await supabaseAdmin.from("operational_expenses").delete().eq("user_id", userId);
  await supabaseAdmin.from("restaurant_profiles").delete().eq("user_id", userId);

  // 3. Create Restaurant Profile (Cafe Scenario)
  console.log("Creating Restaurant Profile...");
  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: userId,
    business_name: "The Artisan Cafe",
    business_type: "Cafe",
    phone_number: "+1 555-0199",
    tax_id: "TX-99887766",
    address: "123 Coffee Lane",
    city: "Seattle",
    state: "WA",
    country: "USA",
    postal_code: "98101",
    online_platforms: ["Uber Eats", "DoorDash"],
    status: "active"
  });

  // 4. Create Vendors
  console.log("Creating Vendors...");
  const vendorMap = {};
  for (const vName of VENDORS) {
    const { data } = await supabaseAdmin.from("vendors").insert({
      user_id: userId,
      vendor_name: vName
    }).select("id").single();
    vendorMap[vName] = data.id;
  }

  // 5. Create Ingredients
  console.log("Creating Ingredients...");
  const ingredientMap = {};
  for (const ing of INGREDIENTS) {
    const { data } = await supabaseAdmin.from("ingredients").insert({
      user_id: userId,
      ingredient_name: ing.name,
      unit: ing.unit,
      price_per_unit: ing.price
    }).select("id, price_per_unit").single();
    ingredientMap[ing.name] = data;

    // Add a purchase record for realism
    await supabaseAdmin.from("ingredient_purchases").insert({
      user_id: userId,
      vendor_id: vendorMap[VENDORS[Math.floor(Math.random() * VENDORS.length)]],
      ingredient_name: ing.name,
      quantity: 10,
      unit: ing.unit,
      price: ing.price * 10,
      purchase_date: new Date().toISOString().split("T")[0]
    });
  }

  // 6. Create Operational Expenses (Current & Last Month)
  console.log("Creating Operational Expenses...");
  const currentMonth = new Date().toISOString().slice(0, 7) + "-01";
  const lastMonthDate = new Date();
  lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
  const lastMonth = lastMonthDate.toISOString().slice(0, 7) + "-01";

  await supabaseAdmin.from("operational_expenses").insert([
    { user_id: userId, month: currentMonth, electricity_bill: 450, gas_bill: 200, salary_cost: 5000 },
    { user_id: userId, month: lastMonth, electricity_bill: 420, gas_bill: 190, salary_cost: 5000 }
  ]);

  // 7. Create Recipes & Link Ingredients
  console.log("Creating Recipes & Menu Items...");
  const recipes = [
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
    }
  ];

  for (const r of recipes) {
    let totalCost = 0;
    r.ingredients.forEach(i => {
      totalCost += ingredientMap[i.name].price_per_unit * i.qty;
    });

    const { data: recipe } = await supabaseAdmin.from("recipes").insert({
      user_id: userId,
      recipe_name: r.name,
      total_cost: totalCost.toFixed(2)
    }).select("id").single();

    for (const i of r.ingredients) {
      await supabaseAdmin.from("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: ingredientMap[i.name].id,
        quantity: i.qty
      });
    }

    // Costing logic (Operational Allocation approx $1.50 per dish for demo)
    const finalDishCost = totalCost + 1.50;
    const profitMargin = ((r.sellingPrice - finalDishCost) / r.sellingPrice) * 100;

    await supabaseAdmin.from("menu_items").insert({
      user_id: userId,
      recipe_id: recipe.id,
      selling_price: r.sellingPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: (finalDishCost * 3.5).toFixed(2) // Standard 3.5x markup
    });
  }

  // 8. Add AI Analytics Data (Sample Logs)
  console.log("Creating AI Usage Logs...");
  await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", userId);
  await supabaseAdmin.from("ai_usage_logs").insert({
    user_id: userId,
    request_count: 5,
    log_date: new Date().toISOString().split("T")[0]
  });

  console.log("✅ Demo Data Seeding Complete!");
}

main().catch(console.error);
