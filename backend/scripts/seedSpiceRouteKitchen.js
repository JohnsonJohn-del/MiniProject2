/**
 * Spice Route Kitchen — Clean Demo Account Seeder
 * 
 * Strategy:
 * 1. Create user in Supabase Auth + users table
 * 2. Insert vendors, ingredients, opex into DB
 * 3. INSERT recipes + recipe_ingredients into DB
 * 4. FETCH back from DB (just like the live app does) to calculate real costs
 * 5. Use those DB-fetched costs to insert menu_items — zero hardcoding
 */

import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

const ACCOUNT = {
  email: "spiceroute@demo.com",
  password: "demo1234",
  name: "Priya Sharma",
  role: "client",
  subscription_plan: "premium",
  business_name: "Spice Route Kitchen",
  business_type: "Cloud Kitchen",
};

// All prices in ₹ per stated unit — realistic Indian market rates
const INGREDIENTS = [
  { name: "Basmati Rice",         unit: "kg",  price: 110  },
  { name: "Wheat Flour (Atta)",   unit: "kg",  price: 42   },
  { name: "Maida",                unit: "kg",  price: 38   },
  { name: "Besan",                unit: "kg",  price: 90   },
  { name: "Paneer",               unit: "kg",  price: 340  },
  { name: "Milk",                 unit: "l",   price: 65   },
  { name: "Curd",                 unit: "kg",  price: 62   },
  { name: "Butter",               unit: "kg",  price: 520  },
  { name: "Fresh Cream",          unit: "l",   price: 210  },
  { name: "Ghee",                 unit: "kg",  price: 580  },
  { name: "Chicken Breast",       unit: "kg",  price: 260  },
  { name: "Mutton (Bone-in)",     unit: "kg",  price: 600  },
  { name: "Eggs",                 unit: "pcs", price: 8    },
  { name: "Onions",               unit: "kg",  price: 35   },
  { name: "Tomatoes",             unit: "kg",  price: 42   },
  { name: "Green Peas",           unit: "kg",  price: 80   },
  { name: "Spinach",              unit: "kg",  price: 60   },
  { name: "Potatoes",             unit: "kg",  price: 30   },
  { name: "Capsicum",             unit: "kg",  price: 55   },
  { name: "Ginger",               unit: "kg",  price: 120  },
  { name: "Garlic",               unit: "kg",  price: 150  },
  { name: "Coriander Leaves",     unit: "kg",  price: 80   },
  { name: "Green Chillies",       unit: "kg",  price: 60   },
  { name: "Lemon",                unit: "kg",  price: 80   },
  { name: "Garam Masala",         unit: "kg",  price: 600  },
  { name: "Chole Masala",         unit: "kg",  price: 500  },
  { name: "Biryani Masala",       unit: "kg",  price: 650  },
  { name: "Turmeric Powder",      unit: "kg",  price: 200  },
  { name: "Red Chilli Powder",    unit: "kg",  price: 280  },
  { name: "Coriander Powder",     unit: "kg",  price: 220  },
  { name: "Cumin Seeds",          unit: "kg",  price: 350  },
  { name: "Cashews",              unit: "kg",  price: 850  },
  { name: "Refined Oil",          unit: "l",   price: 115  },
  { name: "Toor Dal",             unit: "kg",  price: 140  },
  { name: "Chana (Chickpeas)",    unit: "kg",  price: 90   },
  { name: "Rajma",                unit: "kg",  price: 120  },
  { name: "Sugar",                unit: "kg",  price: 45   },
  { name: "Khoya",                unit: "kg",  price: 380  },
  { name: "Dry Fruits Mix",       unit: "kg",  price: 900  },
];

// Vendor for all — simplified single vendor
const VENDOR_NAME = "Metro Cash & Carry";

const RECIPES = [
  // BIRYANI
  { name: "Chicken Biryani", targetMargin: 62, ingredients: [
    { name: "Basmati Rice", qty: 0.15 },
    { name: "Chicken Breast", qty: 0.20 },
    { name: "Onions", qty: 0.08 },
    { name: "Curd", qty: 0.04 },
    { name: "Biryani Masala", qty: 0.008 },
    { name: "Ginger", qty: 0.005 },
    { name: "Garlic", qty: 0.005 },
    { name: "Ghee", qty: 0.015 },
    { name: "Coriander Leaves", qty: 0.005 },
  ]},
  { name: "Veg Biryani", targetMargin: 65, ingredients: [
    { name: "Basmati Rice", qty: 0.15 },
    { name: "Paneer", qty: 0.06 },
    { name: "Green Peas", qty: 0.04 },
    { name: "Potatoes", qty: 0.04 },
    { name: "Onions", qty: 0.06 },
    { name: "Biryani Masala", qty: 0.007 },
    { name: "Ghee", qty: 0.015 },
    { name: "Coriander Leaves", qty: 0.005 },
  ]},
  { name: "Mutton Biryani", targetMargin: 55, ingredients: [
    { name: "Basmati Rice", qty: 0.15 },
    { name: "Mutton (Bone-in)", qty: 0.22 },
    { name: "Onions", qty: 0.08 },
    { name: "Curd", qty: 0.05 },
    { name: "Biryani Masala", qty: 0.01 },
    { name: "Ghee", qty: 0.02 },
  ]},
  // CURRIES
  { name: "Paneer Butter Masala", targetMargin: 60, ingredients: [
    { name: "Paneer", qty: 0.15 },
    { name: "Tomatoes", qty: 0.12 },
    { name: "Onions", qty: 0.08 },
    { name: "Cashews", qty: 0.02 },
    { name: "Butter", qty: 0.025 },
    { name: "Fresh Cream", qty: 0.03 },
    { name: "Garam Masala", qty: 0.005 },
  ]},
  { name: "Dal Makhani", targetMargin: 68, ingredients: [
    { name: "Rajma", qty: 0.05 },
    { name: "Toor Dal", qty: 0.03 },
    { name: "Tomatoes", qty: 0.08 },
    { name: "Onions", qty: 0.06 },
    { name: "Butter", qty: 0.03 },
    { name: "Fresh Cream", qty: 0.025 },
    { name: "Garam Masala", qty: 0.004 },
  ]},
  { name: "Chole Bhature", targetMargin: 70, ingredients: [
    { name: "Chana (Chickpeas)", qty: 0.10 },
    { name: "Maida", qty: 0.10 },
    { name: "Chole Masala", qty: 0.01 },
    { name: "Onions", qty: 0.06 },
    { name: "Tomatoes", qty: 0.05 },
    { name: "Refined Oil", qty: 0.03 },
  ]},
  { name: "Palak Paneer", targetMargin: 65, ingredients: [
    { name: "Spinach", qty: 0.20 },
    { name: "Paneer", qty: 0.10 },
    { name: "Onions", qty: 0.06 },
    { name: "Tomatoes", qty: 0.06 },
    { name: "Fresh Cream", qty: 0.02 },
    { name: "Garam Masala", qty: 0.004 },
    { name: "Butter", qty: 0.015 },
  ]},
  { name: "Butter Chicken", targetMargin: 58, ingredients: [
    { name: "Chicken Breast", qty: 0.20 },
    { name: "Tomatoes", qty: 0.12 },
    { name: "Onions", qty: 0.08 },
    { name: "Cashews", qty: 0.02 },
    { name: "Butter", qty: 0.03 },
    { name: "Fresh Cream", qty: 0.03 },
    { name: "Garam Masala", qty: 0.006 },
  ]},
  { name: "Aloo Gobi", targetMargin: 72, ingredients: [
    { name: "Potatoes", qty: 0.15 },
    { name: "Onions", qty: 0.06 },
    { name: "Tomatoes", qty: 0.06 },
    { name: "Turmeric Powder", qty: 0.003 },
    { name: "Coriander Powder", qty: 0.004 },
    { name: "Refined Oil", qty: 0.02 },
  ]},
  // BREADS
  { name: "Butter Naan", targetMargin: 78, ingredients: [
    { name: "Maida", qty: 0.09 },
    { name: "Curd", qty: 0.02 },
    { name: "Butter", qty: 0.012 },
    { name: "Sugar", qty: 0.003 },
  ]},
  { name: "Tandoori Roti", targetMargin: 80, ingredients: [
    { name: "Wheat Flour (Atta)", qty: 0.09 },
    { name: "Butter", qty: 0.005 },
  ]},
  // STARTERS
  { name: "Chicken Tikka", targetMargin: 62, ingredients: [
    { name: "Chicken Breast", qty: 0.20 },
    { name: "Curd", qty: 0.05 },
    { name: "Garam Masala", qty: 0.008 },
    { name: "Ginger", qty: 0.005 },
    { name: "Garlic", qty: 0.005 },
    { name: "Refined Oil", qty: 0.01 },
  ]},
  { name: "Paneer Tikka", targetMargin: 63, ingredients: [
    { name: "Paneer", qty: 0.18 },
    { name: "Capsicum", qty: 0.04 },
    { name: "Onions", qty: 0.04 },
    { name: "Curd", qty: 0.04 },
    { name: "Garam Masala", qty: 0.006 },
    { name: "Refined Oil", qty: 0.01 },
  ]},
  // DAL
  { name: "Dal Tadka", targetMargin: 72, ingredients: [
    { name: "Toor Dal", qty: 0.08 },
    { name: "Onions", qty: 0.04 },
    { name: "Tomatoes", qty: 0.04 },
    { name: "Ghee", qty: 0.015 },
    { name: "Cumin Seeds", qty: 0.003 },
    { name: "Turmeric Powder", qty: 0.002 },
  ]},
  // DESSERTS
  { name: "Gulab Jamun (2 pcs)", targetMargin: 68, ingredients: [
    { name: "Khoya", qty: 0.06 },
    { name: "Maida", qty: 0.01 },
    { name: "Sugar", qty: 0.08 },
    { name: "Refined Oil", qty: 0.015 },
  ]},
  { name: "Kheer", targetMargin: 65, ingredients: [
    { name: "Basmati Rice", qty: 0.04 },
    { name: "Milk", qty: 0.35 },
    { name: "Sugar", qty: 0.05 },
    { name: "Dry Fruits Mix", qty: 0.02 },
  ]},
  // BEVERAGES
  { name: "Masala Lassi", targetMargin: 78, ingredients: [
    { name: "Curd", qty: 0.20 },
    { name: "Sugar", qty: 0.02 },
    { name: "Milk", qty: 0.05 },
  ]},
  { name: "Mango Lassi", targetMargin: 72, ingredients: [
    { name: "Curd", qty: 0.15 },
    { name: "Milk", qty: 0.10 },
    { name: "Sugar", qty: 0.025 },
  ]},
];

function applyPsychologicalPricing(price) {
  const rounded = Math.round(price);
  return Math.floor(rounded / 10) * 10 + 9;
}

async function setupUser(account) {
  const { data: existingUser } = await supabaseAdmin.from("users").select("id").eq("email", account.email).maybeSingle();
  if (existingUser) return existingUser.id;

  let authUserId;
  const { data: authUser, error: authErr } = await supabaseAdmin.auth.admin.createUser({
    email: account.email,
    password: account.password,
    email_confirm: true,
    user_metadata: { role: account.role, name: account.name, subscription_plan: account.subscription_plan },
  });

  if (authErr) {
    if (authErr.message.includes("already been registered") || authErr.message.includes("already registered")) {
      const { data: list } = await supabaseAdmin.auth.admin.listUsers();
      authUserId = list.users.find(u => u.email === account.email)?.id;
    } else throw authErr;
  } else {
    authUserId = authUser.user.id;
  }

  const { data: newUser, error: dbErr } = await supabaseAdmin.from("users").upsert({
    id: authUserId,
    email: account.email,
    password_hash: "supabase-auth",
    name: account.name,
    role: account.role,
    subscription_plan: account.subscription_plan,
  }).select("id").single();
  if (dbErr) throw dbErr;

  return newUser.id;
}

async function clearData(userId) {
  await supabaseAdmin.from("menu_items").delete().eq("user_id", userId);
  const { data: existingRecipes } = await supabaseAdmin.from("recipes").select("id").eq("user_id", userId);
  if (existingRecipes?.length > 0) {
    await supabaseAdmin.from("recipe_ingredients").delete().in("recipe_id", existingRecipes.map(r => r.id));
  }
  await supabaseAdmin.from("recipes").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredient_price_history").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredients").delete().eq("user_id", userId);
  await supabaseAdmin.from("vendors").delete().eq("user_id", userId);
  await supabaseAdmin.from("operational_expenses").delete().eq("user_id", userId);
  await supabaseAdmin.from("restaurant_profiles").delete().eq("user_id", userId);
}

async function main() {
  console.log("🚀 Seeding Spice Route Kitchen (DB-first approach)...\n");

  // ── 1. Create user ──────────────────────────────────────────────────────────
  const userId = await setupUser(ACCOUNT);
  console.log("✅ User:", userId);
  await clearData(userId);

  // ── 2. Restaurant profile ──────────────────────────────────────────────────
  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: userId,
    business_name: ACCOUNT.business_name,
    business_type: ACCOUNT.business_type,
    phone_number: "+91 9876543210",
    tax_id: "09ABCDE1234F1Z5",
    address: "Unit 7, Cloud Kitchen Hub, Sector 18",
    city: "Noida",
    state: "UP",
    country: "India",
    postal_code: "201301",
    online_platforms: ["Zomato", "Swiggy"],
    status: "active",
  });

  // ── 3. Single vendor ────────────────────────────────────────────────────────
  const { data: vendor } = await supabaseAdmin.from("vendors")
    .insert({ user_id: userId, vendor_name: VENDOR_NAME })
    .select("id").single();
  const vendorId = vendor.id;

  // ── 4. Insert all ingredients into DB ───────────────────────────────────────
  const ingredientIdMap = {}; // name → id
  const now = new Date();

  for (const ing of INGREDIENTS) {
    const { data: ingRow, error } = await supabaseAdmin.from("ingredients").insert({
      user_id: userId,
      ingredient_name: ing.name,
      unit: ing.unit,
      price_per_unit: ing.price,
      vendor_id: vendorId,
    }).select("id").single();

    if (error) { console.error("Ingredient insert failed:", ing.name, error.message); continue; }
    ingredientIdMap[ing.name] = ingRow.id;

    // 3 months of purchase history
    for (let mo = 2; mo >= 0; mo--) {
      const pDate = new Date(now);
      pDate.setMonth(pDate.getMonth() - mo);
      const histPrice = ing.price * (1 + (Math.random() * 0.04 - 0.02));
      await supabaseAdmin.from("ingredient_purchases").insert({
        user_id: userId, vendor_id: vendorId,
        ingredient_name: ing.name, quantity: 10 + Math.floor(Math.random() * 15),
        unit: ing.unit, price: Math.round(histPrice * 100) / 100,
        purchase_date: pDate.toISOString().split("T")[0],
      });
      await supabaseAdmin.from("ingredient_price_history").insert({
        user_id: userId, ingredient_id: ingRow.id,
        ingredient_name: ing.name, price_per_unit: Math.round(histPrice * 100) / 100,
        vendor_id: vendorId, recorded_at: pDate.toISOString(),
        source: mo === 0 ? "manual" : "seeded",
      });
    }
  }
  console.log(`✅ ${INGREDIENTS.length} ingredients inserted into DB`);

  // ── 5. Insert realistic OPEX (Noida cloud kitchen) ──────────────────────────
  for (let mo = 0; mo < 3; mo++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - mo);
    const monthStr = d.toISOString().slice(0, 7) + "-01";
    await supabaseAdmin.from("operational_expenses").insert({
      user_id: userId,
      month: monthStr,
      electricity_bill: Math.round((18000 + Math.random() * 2000) * 100) / 100,
      gas_bill: Math.round((12000 + Math.random() * 1500) * 100) / 100,
      salary_cost: 120000,
    });
  }
  console.log("✅ 3 months of operational expenses inserted\n");

  // ── 6. Fetch opex from DB (exactly as live app does) ────────────────────────
  const { data: opexRow } = await supabaseAdmin
    .from("operational_expenses")
    .select("electricity_bill, gas_bill, salary_cost")
    .eq("user_id", userId)
    .order("month", { ascending: false })
    .limit(1)
    .single();

  const electricity = Number(opexRow.electricity_bill);
  const gas = Number(opexRow.gas_bill);
  const salary = Number(opexRow.salary_cost);
  const assumedMonthlyVolume = 5000;
  const opsPerServing = (electricity + gas) / assumedMonthlyVolume;
  const salaryPerServing = salary / assumedMonthlyVolume;
  const packagingCost = 12;

  console.log("📊 Opex fetched from DB:");
  console.log(`   Electricity: ₹${electricity} | Gas: ₹${gas} | Salary: ₹${salary}`);
  console.log(`   Per-serving: ops=₹${opsPerServing.toFixed(2)}, salary=₹${salaryPerServing.toFixed(2)}, pkg=₹${packagingCost}\n`);

  // ── 7. Insert recipes + ingredients, then fetch from DB to compute cost ──────
  for (const r of RECIPES) {
    // 7a. Insert recipe shell
    const { data: recipe } = await supabaseAdmin.from("recipes").insert({
      user_id: userId,
      recipe_name: r.name,
      total_cost: 0, // placeholder — we'll update after fetching real cost
    }).select("id").single();

    // 7b. Insert recipe_ingredients
    let missingIngredient = false;
    for (const i of r.ingredients) {
      const ingId = ingredientIdMap[i.name];
      if (!ingId) { console.warn(`  ⚠️  Missing: ${i.name} in ${r.name}`); missingIngredient = true; continue; }
      await supabaseAdmin.from("recipe_ingredients").insert({
        recipe_id: recipe.id,
        ingredient_id: ingId,
        quantity: i.qty,
      });
    }
    if (missingIngredient) console.log(`  ⚠️  Some ingredients missing in ${r.name}`);

    // 7c. Fetch recipe_ingredients WITH prices from DB (same query as costingService)
    const { data: riRows } = await supabaseAdmin
      .from("recipe_ingredients")
      .select("quantity, ingredients(price_per_unit)")
      .eq("recipe_id", recipe.id);

    let ingredientCost = 0;
    (riRows || []).forEach(ri => {
      if (ri.ingredients) ingredientCost += Number(ri.quantity) * Number(ri.ingredients.price_per_unit);
    });

    // 7d. Update recipe with real DB-computed ingredient cost
    await supabaseAdmin.from("recipes").update({ total_cost: ingredientCost.toFixed(2) }).eq("id", recipe.id);

    // 7e. Calculate true per-serving cost (same formula as costingService.js)
    const finalDishCost = ingredientCost + opsPerServing + salaryPerServing + packagingCost;
    const idealPrice = applyPsychologicalPricing(finalDishCost / (1 - r.targetMargin / 100));
    const profitMargin = ((idealPrice - finalDishCost) / idealPrice) * 100;

    // 7f. Insert menu_item
    await supabaseAdmin.from("menu_items").insert({
      user_id: userId,
      recipe_id: recipe.id,
      selling_price: idealPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: idealPrice,
    });

    console.log(`  ✅ ${r.name}`);
    console.log(`     Ingredients (DB): ₹${ingredientCost.toFixed(2)} | True cost: ₹${finalDishCost.toFixed(2)} | Price: ₹${idealPrice} | Margin: ${profitMargin.toFixed(1)}%`);
  }

  console.log("\n🎉 Spice Route Kitchen ready!");
  console.log("   📧 Email:    spiceroute@demo.com");
  console.log("   🔑 Password: demo1234");
  console.log(`   🍽️  Dishes:   ${RECIPES.length}`);
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
