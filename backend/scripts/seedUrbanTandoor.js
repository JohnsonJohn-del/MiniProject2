import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

const ACCOUNT = {
  email: "urbantandoor@demo.com",
  password: "password123",
  name: "Arjun Verma",
  role: "client",
  subscription_plan: "premium",
  business_name: "Urban Tandoor Kitchen",
  business_type: "Cloud Kitchen",
};

const VENDORS = [
  "Metro Wholesale",
  "FreshToHome B2B",
  "Natures Basket Supply",
  "Amul Distributors",
  "Crawford Market Spice Traders"
];

// Base realistic prices per kg/L for Indian Metros
const INGREDIENTS = [
  { name: "Chicken Breast", unit: "kg", price: 300, vendor: "FreshToHome B2B" },
  { name: "Chicken Wings", unit: "kg", price: 240, vendor: "FreshToHome B2B" },
  { name: "Chicken Thigh (Boneless)", unit: "kg", price: 280, vendor: "FreshToHome B2B" },
  { name: "Paneer", unit: "kg", price: 360, vendor: "Amul Distributors" },
  { name: "Mozzarella Cheese", unit: "kg", price: 550, vendor: "Amul Distributors" },
  { name: "Cream Cheese", unit: "kg", price: 750, vendor: "Amul Distributors" },
  { name: "Butter", unit: "kg", price: 520, vendor: "Amul Distributors" },
  { name: "Heavy Cream", unit: "liter", price: 220, vendor: "Amul Distributors" },
  { name: "Milk", unit: "liter", price: 68, vendor: "Amul Distributors" },
  
  { name: "Basmati Rice", unit: "kg", price: 120, vendor: "Metro Wholesale" },
  { name: "Pasta (Penne)", unit: "kg", price: 180, vendor: "Natures Basket Supply" },
  { name: "Noodles", unit: "kg", price: 90, vendor: "Metro Wholesale" },
  { name: "Sweet Corn", unit: "kg", price: 80, vendor: "Local Market" },
  { name: "All Purpose Flour (Maida)", unit: "kg", price: 45, vendor: "Metro Wholesale" },
  
  { name: "Tomatoes", unit: "kg", price: 40, vendor: "Metro Wholesale" },
  { name: "Onions", unit: "kg", price: 35, vendor: "Metro Wholesale" },
  { name: "Garlic", unit: "kg", price: 200, vendor: "Metro Wholesale" },
  { name: "Ginger", unit: "kg", price: 150, vendor: "Metro Wholesale" },
  { name: "Mint Leaves", unit: "kg", price: 80, vendor: "Metro Wholesale" },
  { name: "Lemon", unit: "kg", price: 90, vendor: "Metro Wholesale" },
  
  { name: "Tandoori Masala", unit: "kg", price: 500, vendor: "Crawford Market Spice Traders" },
  { name: "Biryani Masala", unit: "kg", price: 650, vendor: "Crawford Market Spice Traders" },
  { name: "Garam Masala", unit: "kg", price: 700, vendor: "Crawford Market Spice Traders" },
  { name: "Tea Leaves (CTC)", unit: "kg", price: 400, vendor: "Metro Wholesale" },
  { name: "Coffee Beans", unit: "kg", price: 1200, vendor: "Natures Basket Supply" },
  
  { name: "Sugar", unit: "kg", price: 45, vendor: "Metro Wholesale" },
  { name: "Cocoa Powder", unit: "kg", price: 800, vendor: "Natures Basket Supply" },
  { name: "Khoya", unit: "kg", price: 380, vendor: "Amul Distributors" },
];

const RECIPES = [
  // --- STARTERS ---
  {
    name: "Paneer Tikka", category: "Starters",
    ingredients: [
      { name: "Paneer", qty: 0.15 },
      { name: "Tomatoes", qty: 0.05 },
      { name: "Onions", qty: 0.05 },
      { name: "Tandoori Masala", qty: 0.01 },
      { name: "Butter", qty: 0.02 },
    ]
  },
  {
    name: "Chicken Lollipop", category: "Starters",
    ingredients: [
      { name: "Chicken Wings", qty: 0.25 },
      { name: "All Purpose Flour (Maida)", qty: 0.02 },
      { name: "Garlic", qty: 0.01 },
      { name: "Ginger", qty: 0.01 },
    ]
  },
  {
    name: "Crispy Corn", category: "Starters",
    ingredients: [
      { name: "Sweet Corn", qty: 0.15 },
      { name: "All Purpose Flour (Maida)", qty: 0.03 },
      { name: "Onions", qty: 0.02 },
      { name: "Lemon", qty: 0.01 },
    ]
  },
  {
    name: "Garlic Bread with Cheese", category: "Starters",
    ingredients: [
      { name: "All Purpose Flour (Maida)", qty: 0.10 },
      { name: "Mozzarella Cheese", qty: 0.04 },
      { name: "Garlic", qty: 0.02 },
      { name: "Butter", qty: 0.02 },
    ]
  },

  // --- MAINS ---
  {
    name: "Butter Chicken", category: "Mains",
    ingredients: [
      { name: "Chicken Thigh (Boneless)", qty: 0.20 },
      { name: "Tomatoes", qty: 0.15 },
      { name: "Onions", qty: 0.10 },
      { name: "Butter", qty: 0.04 },
      { name: "Heavy Cream", qty: 0.05 },
      { name: "Tandoori Masala", qty: 0.01 },
    ]
  },
  {
    name: "Paneer Butter Masala", category: "Mains",
    ingredients: [
      { name: "Paneer", qty: 0.15 },
      { name: "Tomatoes", qty: 0.15 },
      { name: "Onions", qty: 0.10 },
      { name: "Butter", qty: 0.03 },
      { name: "Heavy Cream", qty: 0.04 },
      { name: "Garam Masala", qty: 0.01 },
    ]
  },
  {
    name: "Chicken Alfredo Pasta", category: "Mains",
    ingredients: [
      { name: "Pasta (Penne)", qty: 0.12 },
      { name: "Chicken Breast", qty: 0.10 },
      { name: "Heavy Cream", qty: 0.08 },
      { name: "Mozzarella Cheese", qty: 0.03 },
      { name: "Garlic", qty: 0.01 },
    ]
  },
  {
    name: "Chicken Biryani", category: "Mains",
    ingredients: [
      { name: "Chicken Thigh (Boneless)", qty: 0.20 },
      { name: "Basmati Rice", qty: 0.15 },
      { name: "Onions", qty: 0.10 },
      { name: "Tomatoes", qty: 0.05 },
      { name: "Biryani Masala", qty: 0.015 },
      { name: "Butter", qty: 0.02 },
      { name: "Mint Leaves", qty: 0.01 },
    ]
  },
  {
    name: "Veg Biryani", category: "Mains",
    ingredients: [
      { name: "Basmati Rice", qty: 0.15 },
      { name: "Paneer", qty: 0.05 },
      { name: "Onions", qty: 0.10 },
      { name: "Tomatoes", qty: 0.05 },
      { name: "Biryani Masala", qty: 0.015 },
      { name: "Butter", qty: 0.02 },
      { name: "Mint Leaves", qty: 0.01 },
    ]
  },
  {
    name: "Hakka Noodles", category: "Mains",
    ingredients: [
      { name: "Noodles", qty: 0.15 },
      { name: "Onions", qty: 0.05 },
      { name: "Garlic", qty: 0.01 },
    ]
  },

  // --- BEVERAGES ---
  {
    name: "Cold Coffee", category: "Beverages",
    ingredients: [
      { name: "Milk", qty: 0.25 },
      { name: "Coffee Beans", qty: 0.015 },
      { name: "Sugar", qty: 0.02 },
      { name: "Heavy Cream", qty: 0.02 },
    ]
  },
  {
    name: "Oreo Shake", category: "Beverages",
    ingredients: [
      { name: "Milk", qty: 0.25 },
      { name: "Heavy Cream", qty: 0.03 },
      { name: "Sugar", qty: 0.02 },
      { name: "Cocoa Powder", qty: 0.01 },
    ]
  },
  {
    name: "Masala Chai", category: "Beverages",
    ingredients: [
      { name: "Milk", qty: 0.10 },
      { name: "Tea Leaves (CTC)", qty: 0.005 },
      { name: "Sugar", qty: 0.015 },
      { name: "Ginger", qty: 0.005 },
    ]
  },
  {
    name: "Virgin Mojito", category: "Beverages",
    ingredients: [
      { name: "Lemon", qty: 0.05 },
      { name: "Mint Leaves", qty: 0.01 },
      { name: "Sugar", qty: 0.02 },
    ]
  },

  // --- DESSERTS ---
  {
    name: "Brownie with Ice Cream", category: "Desserts",
    ingredients: [
      { name: "All Purpose Flour (Maida)", qty: 0.05 },
      { name: "Cocoa Powder", qty: 0.02 },
      { name: "Butter", qty: 0.03 },
      { name: "Sugar", qty: 0.04 },
      { name: "Milk", qty: 0.05 },
    ]
  },
  {
    name: "Cheesecake", category: "Desserts",
    ingredients: [
      { name: "Cream Cheese", qty: 0.10 },
      { name: "Heavy Cream", qty: 0.05 },
      { name: "Sugar", qty: 0.03 },
      { name: "Butter", qty: 0.02 },
    ]
  },
  {
    name: "Gulab Jamun", category: "Desserts",
    ingredients: [
      { name: "Khoya", qty: 0.05 },
      { name: "All Purpose Flour (Maida)", qty: 0.01 },
      { name: "Sugar", qty: 0.05 },
    ]
  }
];

function applyPsychologicalPricing(price) {
  const rounded = Math.round(price);
  if (rounded < 100) return Math.floor(rounded / 10) * 10 + 9;
  return Math.floor(rounded / 10) * 10 + 9; // e.g. 249, 299
}

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
        const authData = await supabaseAdmin.auth.admin.listUsers();
        const existingAuth = authData.data.users.find((u) => u.email === account.email);
        userId = existingAuth.id;
      } else {
        throw authErr;
      }
    } else {
      userId = authUser.user.id;
    }

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
  } else {
    userId = userRecord.id;
  }
  return userId;
}

async function clearData(userId) {
  await supabaseAdmin.from("menu_items").delete().eq("user_id", userId);
  const { data: recipes } = await supabaseAdmin.from("recipes").select("id").eq("user_id", userId);
  if (recipes?.length > 0) {
    await supabaseAdmin.from("recipe_ingredients").delete().in("recipe_id", recipes.map((r) => r.id));
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
  console.log("🚀 Starting Urban Tandoor Demo Seeder...");

  const userId = await setupUser(ACCOUNT);
  await clearData(userId);

  console.log(`\n🏢 Setting up Restaurant Profile: ${ACCOUNT.business_name}`);
  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: userId,
    business_name: ACCOUNT.business_name,
    business_type: ACCOUNT.business_type,
    phone_number: "+91 9820012345",
    tax_id: "27AADCS1234F1Z2",
    address: "45 Bandra West",
    city: "Mumbai",
    state: "MH",
    country: "India",
    postal_code: "400050",
    online_platforms: ["Zomato", "Swiggy"],
    status: "active",
  });

  const vendorMap = {};
  for (const vName of VENDORS) {
    const { data } = await supabaseAdmin.from("vendors").insert({ user_id: userId, vendor_name: vName }).select("id").single();
    vendorMap[vName] = data.id;
  }
  
  // Create Ingredients and Purchase History
  console.log(`🛒 Seeding ${INGREDIENTS.length} Ingredients + Purchase History (OCR Mock)...`);
  const ingredientMap = {};
  const now = new Date();
  
  const { error: phCheckErr } = await supabaseAdmin.from("ingredient_price_history").select("id").limit(1);

  for (const ing of INGREDIENTS) {
    const { data } = await supabaseAdmin.from("ingredients").insert({
      user_id: userId,
      ingredient_name: ing.name,
      unit: ing.unit,
      price_per_unit: ing.price,
      vendor_id: vendorMap[ing.vendor] || null,
    }).select("id, price_per_unit").single();
    ingredientMap[ing.name] = data;

    // Simulate 3 months of OCR history
    for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
      const pDate = new Date(now);
      pDate.setMonth(pDate.getMonth() - monthOffset);
      pDate.setDate(Math.floor(Math.random() * 28) + 1); // Random day of month
      
      let historicalPrice = ing.price;
      
      // Specifically inject some inflation trends
      if (ing.name === "Mozzarella Cheese") {
        if (monthOffset === 2) historicalPrice = 480; // 480 -> 550 = 14% increase
        if (monthOffset === 1) historicalPrice = 510;
      } else if (ing.name === "Tomatoes") {
        if (monthOffset === 2) historicalPrice = 60; // Huge drop in tomatoes
        if (monthOffset === 1) historicalPrice = 50;
      } else {
        // Random slight variation +/- 5%
        historicalPrice = ing.price * (1 + (Math.random() * 0.1 - 0.05));
      }

      const qty = monthOffset === 0 ? 15 : (10 + Math.floor(Math.random() * 20));

      await supabaseAdmin.from("ingredient_purchases").insert({
        user_id: userId,
        vendor_id: vendorMap[ing.vendor] || null,
        ingredient_name: ing.name,
        quantity: qty,
        unit: ing.unit,
        price: historicalPrice * qty, // Total price of invoice line
        purchase_date: pDate.toISOString().split("T")[0],
      });

      if (!phCheckErr) {
        await supabaseAdmin.from("ingredient_price_history").insert({
          user_id: userId,
          ingredient_id: data.id,
          ingredient_name: ing.name,
          price_per_unit: historicalPrice,
          vendor_id: vendorMap[ing.vendor] || null,
          recorded_at: pDate.toISOString(),
          source: monthOffset === 0 ? "manual" : "ocr",
        });
      }
    }
  }

  console.log(`💡 Seeding Operational Costs...`);
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthOffset);
    const monthStr = d.toISOString().slice(0, 7) + "-01";
    // Realistic cloud kitchen costs
    await supabaseAdmin.from("operational_expenses").insert({
      user_id: userId,
      month: monthStr,
      electricity_bill: 22000,
      gas_bill: 14000,
      salary_cost: 85000, // Minimal staff
    });
  }

  console.log(`🍽️ Seeding ${RECIPES.length} Recipes + Menu Items with Normalized Costing...`);
  for (const r of RECIPES) {
    let ingredientCost = 0;
    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (ing) ingredientCost += ing.price_per_unit * i.qty;
    }

    const { data: recipe } = await supabaseAdmin.from("recipes").insert({
      user_id: userId,
      recipe_name: r.name,
      total_cost: ingredientCost.toFixed(2), // We store strictly ingredient cost here if UI relies on it, though costingService recalcs it.
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

    // Mirroring CostingService Logic
    const packagingCost = 15;
    const operationalAllocation = (ingredientCost * 0.15) + packagingCost;
    const salaryAllocation = ingredientCost * 0.10;
    const finalDishCost = ingredientCost + operationalAllocation + salaryAllocation;

    // Pricing Logic
    const targetFoodCostPct = r.category === "Beverages" ? 0.20 : 0.32; // Beverages have higher margins
    const rawIdealPrice = finalDishCost / targetFoodCostPct;
    const idealPrice = applyPsychologicalPricing(rawIdealPrice);
    
    let sellingPrice = idealPrice;
    
    // Deliberately offset one item to trigger "Low Margin" AI insight
    if (r.name === "Chicken Alfredo Pasta") {
      sellingPrice = applyPsychologicalPricing(finalDishCost / 0.50); // 50% food cost -> very low margin
    }

    const profitMargin = ((sellingPrice - finalDishCost) / sellingPrice) * 100;

    await supabaseAdmin.from("menu_items").insert({
      user_id: userId,
      recipe_id: recipe.id,
      selling_price: sellingPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: idealPrice,
    });
  }

  const { error: aiErr } = await supabaseAdmin.from("ai_usage_logs").select("id").limit(1);
  if (!aiErr) {
    await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", userId);
    await supabaseAdmin.from("ai_usage_logs").insert({
      user_id: userId,
      request_count: 142,
      log_date: now.toISOString().split("T")[0],
    });
  }

  console.log("✅ Urban Tandoor Demo Account is Ready.");
  console.log(`   Login: ${ACCOUNT.email} / ${ACCOUNT.password}`);
}

main().catch(console.error);
