import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

const ACCOUNT_1 = {
  email: "newcafe@demo.com",
  password: "password123",
  name: "Small New Cafe Owner",
  role: "client",
  subscription_plan: "free",
  business_name: "Fresh Start Cafe",
  business_type: "Cafe",
};

const ACCOUNT_2 = {
  email: "indiankitchen@demo.com",
  password: "password123",
  name: "Rajesh Kumar",
  role: "client",
  subscription_plan: "premium",
  business_name: "Spice Route Cloud Kitchen",
  business_type: "Cloud Kitchen",
};

const INGREDIENTS = [
  { name: "Paneer", unit: "kg", price: 350, vendor: "Amul Dairy Distributors" },
  { name: "Chicken Breast", unit: "kg", price: 280, vendor: "Sneha Chicken Suppliers" },
  { name: "Basmati Rice", unit: "kg", price: 110, vendor: "Metro Cash & Carry" },
  { name: "Butter", unit: "kg", price: 550, vendor: "Amul Dairy Distributors" },
  { name: "Heavy Cream", unit: "liter", price: 240, vendor: "Amul Dairy Distributors" },
  { name: "Tomatoes", unit: "kg", price: 40, vendor: "Local Vegetable Market" },
  { name: "Onions", unit: "kg", price: 30, vendor: "Local Vegetable Market" },
  { name: "Mozzarella Cheese", unit: "kg", price: 450, vendor: "Amul Dairy Distributors" },
  { name: "Tandoori Masala", unit: "kg", price: 600, vendor: "APMC Spice Traders" },
  { name: "Garam Masala", unit: "kg", price: 750, vendor: "APMC Spice Traders" },
  { name: "Sunflower Oil", unit: "liter", price: 120, vendor: "Metro Cash & Carry" },
  { name: "All Purpose Flour (Maida)", unit: "kg", price: 45, vendor: "Metro Cash & Carry" },
  { name: "Garlic", unit: "kg", price: 180, vendor: "Local Vegetable Market" },
  { name: "Ginger", unit: "kg", price: 120, vendor: "Local Vegetable Market" },
  { name: "Coffee Beans", unit: "kg", price: 1500, vendor: "Metro Cash & Carry" },
  { name: "Milk", unit: "liter", price: 66, vendor: "Amul Dairy Distributors" },
  { name: "Sugar", unit: "kg", price: 50, vendor: "Metro Cash & Carry" },
  { name: "Black Urad Dal", unit: "kg", price: 140, vendor: "Metro Cash & Carry" },
];

const VENDORS = [
  "Metro Cash & Carry",
  "Local Vegetable Market",
  "APMC Spice Traders",
  "Amul Dairy Distributors",
  "Sneha Chicken Suppliers",
];

const RECIPES = [
  {
    name: "Butter Chicken Curry",
    ingredients: [
      { name: "Chicken Breast", qty: 0.25 },
      { name: "Tomatoes", qty: 0.15 },
      { name: "Onions", qty: 0.10 },
      { name: "Butter", qty: 0.05 },
      { name: "Heavy Cream", qty: 0.05 },
      { name: "Tandoori Masala", qty: 0.01 },
      { name: "Garlic", qty: 0.01 },
      { name: "Ginger", qty: 0.01 },
    ],
    sellingPrice: 200, // Deliberately low margin to trigger AI warning
    opsCost: 45,
  },
  {
    name: "Paneer Tikka Masala",
    ingredients: [
      { name: "Paneer", qty: 0.20 },
      { name: "Tomatoes", qty: 0.10 },
      { name: "Onions", qty: 0.10 },
      { name: "Butter", qty: 0.03 },
      { name: "Heavy Cream", qty: 0.04 },
      { name: "Tandoori Masala", qty: 0.01 },
    ],
    sellingPrice: 320,
    opsCost: 45,
  },
  {
    name: "Dal Makhani",
    ingredients: [
      { name: "Black Urad Dal", qty: 0.10 },
      { name: "Butter", qty: 0.05 },
      { name: "Heavy Cream", qty: 0.05 },
      { name: "Tomatoes", qty: 0.10 },
      { name: "Garlic", qty: 0.01 },
      { name: "Garam Masala", qty: 0.005 },
    ],
    sellingPrice: 280,
    opsCost: 45,
  },
  {
    name: "Tandoori Roti",
    ingredients: [
      { name: "All Purpose Flour (Maida)", qty: 0.10 },
      { name: "Butter", qty: 0.01 },
    ],
    sellingPrice: 40,
    opsCost: 10,
  },
  {
    name: "Cold Coffee",
    ingredients: [
      { name: "Coffee Beans", qty: 0.02 },
      { name: "Milk", qty: 0.30 },
      { name: "Sugar", qty: 0.02 },
    ],
    sellingPrice: 250, // Very high margin to trigger AI star
    opsCost: 20,
  },
];

async function setupUser(account) {
  let { data: userRecord } = await supabaseAdmin.from("users").select("id").eq("email", account.email).maybeSingle();
  let userId;

  if (!userRecord) {
    const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email: account.email,
      password: account.password,
      email_confirm: true,
      user_metadata: { role: account.role, name: account.name, subscription_plan: account.subscription_plan },
    });
    if (authErr) {
      if (authErr.message.includes("User already registered")) {
        console.log(`Auth user ${account.email} already exists, but not in DB.`);
        const authData = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = authData.data.users.find((u) => u.email === account.email);
        userId = existingAuth.id;
      } else {
        throw authErr;
      }
    } else {
      userId = authUser.user.id;
    }

    if (!userRecord) {
      const { data: newUser, error: dbErr } = await supabaseAdmin.from("users").upsert({
        id: userId,
        email: account.email,
        password_hash: "supabase-auth",
        name: account.name,
        role: account.role,
        subscription_plan: account.subscription_plan,
      }).select("id").single();
      if (dbErr) throw dbErr;
      userId = newUser.id;
    }
  } else {
    userId = userRecord.id;
  }

  return userId;
}

async function clearData(userId) {
  await supabaseAdmin.from("menu_items").delete().eq("user_id", userId);
  const { data: existingRecipes } = await supabaseAdmin.from("recipes").select("id").eq("user_id", userId);
  if (existingRecipes?.length > 0) {
    await supabaseAdmin.from("recipe_ingredients").delete().in("recipe_id", existingRecipes.map((r) => r.id));
  }
  await supabaseAdmin.from("recipes").delete().eq("user_id", userId);
  
  const { error: phCheckErr } = await supabaseAdmin.from("ingredient_price_history").select("id").limit(1);
  if (!phCheckErr) {
    await supabaseAdmin.from("ingredient_price_history").delete().eq("user_id", userId);
  }
  
  await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredients").delete().eq("user_id", userId);
  await supabaseAdmin.from("vendors").delete().eq("user_id", userId);
  await supabaseAdmin.from("operational_expenses").delete().eq("user_id", userId);
  await supabaseAdmin.from("restaurant_profiles").delete().eq("user_id", userId);
}

async function main() {
  console.log("🚀 Starting Realistic Demo Seeder...");

  // --- ACCOUNT 1: EMPTY ---
  console.log(`\n👨‍🍳 Setting up Account 1 (Empty): ${ACCOUNT_1.email}`);
  const user1Id = await setupUser(ACCOUNT_1);
  await clearData(user1Id);
  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: user1Id,
    business_name: ACCOUNT_1.business_name,
    business_type: ACCOUNT_1.business_type,
    status: "active",
  });
  console.log("✅ Account 1 ready (empty state).");

  // --- ACCOUNT 2: FULLY POPULATED ---
  console.log(`\n🌶️ Setting up Account 2 (Populated): ${ACCOUNT_2.email}`);
  const user2Id = await setupUser(ACCOUNT_2);
  await clearData(user2Id);

  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: user2Id,
    business_name: ACCOUNT_2.business_name,
    business_type: ACCOUNT_2.business_type,
    phone_number: "+91 9876543210",
    tax_id: "27AADCS1234F1Z1",
    address: "123 Cloud Avenue, Andheri West",
    city: "Mumbai",
    state: "MH",
    country: "India",
    postal_code: "400053",
    online_platforms: ["Zomato", "Swiggy", "Direct Delivery"],
    status: "active",
  });

  const vendorMap = {};
  for (const vName of VENDORS) {
    const { data } = await supabaseAdmin.from("vendors").insert({ user_id: user2Id, vendor_name: vName }).select("id").single();
    vendorMap[vName] = data.id;
  }

  const ingredientMap = {};
  const now = new Date();
  
  // Check if price history table exists
  const { error: phCheckErr } = await supabaseAdmin.from("ingredient_price_history").select("id").limit(1);

  for (const ing of INGREDIENTS) {
    const { data } = await supabaseAdmin.from("ingredients").insert({
      user_id: user2Id,
      ingredient_name: ing.name,
      unit: ing.unit,
      price_per_unit: ing.price,
      vendor_id: vendorMap[ing.vendor] || null,
    }).select("id, price_per_unit").single();
    ingredientMap[ing.name] = data;

    // Simulate 3 months of history
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const pDate = new Date(now);
      pDate.setMonth(pDate.getMonth() - monthOffset);
      
      let historicalPrice = ing.price;
      
      // Artificial inflation for Cheese
      if (ing.name === "Mozzarella Cheese") {
        if (monthOffset === 2 || monthOffset === 1) historicalPrice = 380; // 380 -> 450 is ~18.4% increase
      } else {
        // Random slight variation
        historicalPrice = ing.price * (1 + (Math.random() * 0.05 - 0.025));
      }

      await supabaseAdmin.from("ingredient_purchases").insert({
        user_id: user2Id,
        vendor_id: vendorMap[ing.vendor] || null,
        ingredient_name: ing.name,
        quantity: 10 + Math.floor(Math.random() * 20),
        unit: ing.unit,
        price: historicalPrice,
        purchase_date: pDate.toISOString().split("T")[0],
      });

      if (!phCheckErr) {
        await supabaseAdmin.from("ingredient_price_history").insert({
          user_id: user2Id,
          ingredient_id: data.id,
          ingredient_name: ing.name,
          price_per_unit: historicalPrice,
          vendor_id: vendorMap[ing.vendor] || null,
          recorded_at: pDate.toISOString(),
          source: monthOffset === 0 ? "manual" : "seeded",
        });
      }
    }
  }

  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthOffset);
    const monthStr = d.toISOString().slice(0, 7) + "-01";
    // Simulated spike in Gas/Electricity to trigger AI insight "Operational Cost Spike"
    let electricity = 18000;
    let gas = 15000;
    if (monthOffset === 0) {
      electricity = 21000; // Spike in current month
      gas = 18000;
    }
    await supabaseAdmin.from("operational_expenses").insert({
      user_id: user2Id,
      month: monthStr,
      electricity_bill: electricity,
      gas_bill: gas,
      salary_cost: 120000,
    });
  }

  for (const r of RECIPES) {
    let totalCost = 0;
    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (ing) totalCost += ing.price_per_unit * i.qty;
    }

    const { data: recipe } = await supabaseAdmin.from("recipes").insert({
      user_id: user2Id,
      recipe_name: r.name,
      total_cost: totalCost.toFixed(2),
    }).select("id").single();

    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (!ing) continue;
      await supabaseAdmin.from("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: ing.id,
        quantity: i.qty,
      });
    }

    const finalDishCost = totalCost + r.opsCost;
    const profitMargin = ((r.sellingPrice - finalDishCost) / r.sellingPrice) * 100;

    const rawIdealPrice = finalDishCost / 0.32;
    const rounded = Math.round(rawIdealPrice);
    const aiSuggestedPrice = rounded < 100 ? Math.floor(rounded / 10) * 10 + 9 : Math.floor(rounded / 10) * 10 + 9;

    await supabaseAdmin.from("menu_items").insert({
      user_id: user2Id,
      recipe_id: recipe.id,
      selling_price: r.sellingPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: aiSuggestedPrice,
    });
  }

  const { error: aiErr } = await supabaseAdmin.from("ai_usage_logs").select("id").limit(1);
  if (!aiErr) {
    await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", user2Id);
    await supabaseAdmin.from("ai_usage_logs").insert({
      user_id: user2Id,
      request_count: 42,
      log_date: now.toISOString().split("T")[0],
    });
  }

  console.log("✅ Account 2 ready (fully populated Indian Cloud Kitchen).");
  console.log("   Ingredients:", INGREDIENTS.length);
  console.log("   Recipes:", RECIPES.length);
  console.log("\n🎯 Demo Seeding Complete!");
}

main().catch(console.error);
