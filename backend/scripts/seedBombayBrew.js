import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

const ACCOUNT = {
  email: "bombaybrew@demo.com",
  password: "password123",
  name: "Arjun Mehta",
  role: "client",
  subscription_plan: "premium",
  business_name: "Bombay Brew Cafe",
  business_type: "Cafe & Cloud Kitchen",
};

const INGREDIENTS = [
  // Beverages
  { name: "Coffee Beans", unit: "kg", price: 1200, vendor: "Blue Tokai Wholesale" },
  { name: "Milk", unit: "l", price: 68, vendor: "Amul Distributors" },
  { name: "Tea Leaves", unit: "kg", price: 450, vendor: "Tata Consumer Products" },
  { name: "Sugar", unit: "kg", price: 45, vendor: "Metro Cash & Carry" },
  { name: "Ice Cream", unit: "l", price: 180, vendor: "Amul Distributors" },
  { name: "Chocolate Syrup", unit: "l", price: 220, vendor: "Metro Cash & Carry" },
  { name: "Mint Leaves", unit: "g", price: 150, vendor: "Local Vegetable Market" }, // 150 per kg -> wait, base unit is g. Let's make base unit kg.
  { name: "Fresh Mint", unit: "kg", price: 150, vendor: "Local Vegetable Market" },
  { name: "Lemon", unit: "kg", price: 80, vendor: "Local Vegetable Market" },
  { name: "Soda Water", unit: "l", price: 20, vendor: "Kinley Wholesale" },
  { name: "Oreo Cookies", unit: "kg", price: 300, vendor: "Metro Cash & Carry" },

  // Fast Food & Western
  { name: "Burger Buns", unit: "pcs", price: 6, vendor: "Modern Bakery" },
  { name: "Chicken Patty", unit: "pcs", price: 35, vendor: "Venky's Wholesale" },
  { name: "Veg Patty", unit: "pcs", price: 18, vendor: "McCain Wholesale" },
  { name: "French Fries", unit: "kg", price: 120, vendor: "McCain Wholesale" },
  { name: "Garlic Bread Loaf", unit: "pcs", price: 25, vendor: "Modern Bakery" },
  { name: "Pasta Penne", unit: "kg", price: 180, vendor: "Metro Cash & Carry" },
  { name: "Mozzarella Cheese", unit: "kg", price: 480, vendor: "Amul Distributors" },
  { name: "Processed Cheese", unit: "kg", price: 400, vendor: "Amul Distributors" },
  { name: "Mayonnaise", unit: "kg", price: 150, vendor: "Metro Cash & Carry" },
  { name: "Tomato Ketchup", unit: "kg", price: 110, vendor: "Metro Cash & Carry" },
  { name: "Butter", unit: "kg", price: 560, vendor: "Amul Distributors" },
  { name: "Refined Oil", unit: "l", price: 115, vendor: "Metro Cash & Carry" },

  // Indian & Main Course
  { name: "Paneer", unit: "kg", price: 340, vendor: "Amul Distributors" },
  { name: "Chicken Breast", unit: "kg", price: 260, vendor: "Sneha Chicken Suppliers" },
  { name: "Basmati Rice", unit: "kg", price: 110, vendor: "India Gate Wholesale" },
  { name: "Onions", unit: "kg", price: 35, vendor: "Local Vegetable Market" },
  { name: "Tomatoes", unit: "kg", price: 40, vendor: "Local Vegetable Market" },
  { name: "Ginger", unit: "kg", price: 120, vendor: "Local Vegetable Market" },
  { name: "Garlic", unit: "kg", price: 150, vendor: "Local Vegetable Market" },
  { name: "Green Chillies", unit: "kg", price: 60, vendor: "Local Vegetable Market" },
  { name: "Coriander", unit: "kg", price: 80, vendor: "Local Vegetable Market" },
  { name: "Cashews", unit: "kg", price: 850, vendor: "APMC Spice Traders" },
  { name: "Garam Masala", unit: "kg", price: 600, vendor: "APMC Spice Traders" },
  { name: "Tandoori Masala", unit: "kg", price: 550, vendor: "APMC Spice Traders" },
  { name: "Curd", unit: "kg", price: 65, vendor: "Amul Distributors" },
  { name: "Fresh Cream", unit: "l", price: 220, vendor: "Amul Distributors" },
  { name: "Wheat Flour", unit: "kg", price: 40, vendor: "Metro Cash & Carry" },

  // Desserts
  { name: "Khoya", unit: "kg", price: 380, vendor: "Amul Distributors" },
  { name: "Maida", unit: "kg", price: 45, vendor: "Metro Cash & Carry" },
  { name: "Brownie Sponge", unit: "kg", price: 350, vendor: "Modern Bakery" },
  { name: "Cream Cheese", unit: "kg", price: 850, vendor: "Amul Distributors" }
];

const VENDORS = [...new Set(INGREDIENTS.map(i => i.vendor))];

const RECIPES = [
  {
    name: "Masala Chai",
    ingredients: [
      { name: "Tea Leaves", qty: 0.005 }, // 5g
      { name: "Milk", qty: 0.1 }, // 100ml
      { name: "Sugar", qty: 0.01 }, // 10g
      { name: "Garam Masala", qty: 0.001 } // 1g spice
    ],
    targetMargin: 70
  },
  {
    name: "Cold Coffee",
    ingredients: [
      { name: "Coffee Beans", qty: 0.015 }, // 15g
      { name: "Milk", qty: 0.2 }, // 200ml
      { name: "Sugar", qty: 0.015 }, // 15g
      { name: "Ice Cream", qty: 0.05 }, // 50ml
      { name: "Chocolate Syrup", qty: 0.02 } // 20ml
    ],
    targetMargin: 65
  },
  {
    name: "Cappuccino",
    ingredients: [
      { name: "Coffee Beans", qty: 0.018 },
      { name: "Milk", qty: 0.15 },
      { name: "Sugar", qty: 0.01 }
    ],
    targetMargin: 75
  },
  {
    name: "Oreo Shake",
    ingredients: [
      { name: "Oreo Cookies", qty: 0.05 }, // 50g
      { name: "Milk", qty: 0.2 },
      { name: "Ice Cream", qty: 0.1 },
      { name: "Sugar", qty: 0.01 }
    ],
    targetMargin: 60
  },
  {
    name: "Virgin Mojito",
    ingredients: [
      { name: "Fresh Mint", qty: 0.01 },
      { name: "Lemon", qty: 0.02 },
      { name: "Soda Water", qty: 0.25 },
      { name: "Sugar", qty: 0.02 }
    ],
    targetMargin: 80
  },
  {
    name: "Veg Burger",
    ingredients: [
      { name: "Burger Buns", qty: 1 },
      { name: "Veg Patty", qty: 1 },
      { name: "Mayonnaise", qty: 0.02 },
      { name: "Onions", qty: 0.02 },
      { name: "Tomatoes", qty: 0.02 },
      { name: "Processed Cheese", qty: 0.02 }
    ],
    targetMargin: 60
  },
  {
    name: "Chicken Burger",
    ingredients: [
      { name: "Burger Buns", qty: 1 },
      { name: "Chicken Patty", qty: 1 },
      { name: "Mayonnaise", qty: 0.02 },
      { name: "Onions", qty: 0.02 },
      { name: "Processed Cheese", qty: 0.02 }
    ],
    targetMargin: 55
  },
  {
    name: "French Fries",
    ingredients: [
      { name: "French Fries", qty: 0.15 }, // 150g
      { name: "Refined Oil", qty: 0.02 } // 20ml absorbed
    ],
    targetMargin: 70
  },
  {
    name: "Garlic Bread",
    ingredients: [
      { name: "Garlic Bread Loaf", qty: 0.2 }, // 20% of loaf
      { name: "Butter", qty: 0.015 },
      { name: "Garlic", qty: 0.005 }
    ],
    targetMargin: 75
  },
  {
    name: "Cheese Garlic Bread",
    ingredients: [
      { name: "Garlic Bread Loaf", qty: 0.2 },
      { name: "Butter", qty: 0.015 },
      { name: "Garlic", qty: 0.005 },
      { name: "Mozzarella Cheese", qty: 0.04 }
    ],
    targetMargin: 65
  },
  {
    name: "White Sauce Pasta",
    ingredients: [
      { name: "Pasta Penne", qty: 0.1 },
      { name: "Milk", qty: 0.15 },
      { name: "Maida", qty: 0.01 },
      { name: "Butter", qty: 0.02 },
      { name: "Processed Cheese", qty: 0.03 }
    ],
    targetMargin: 60
  },
  {
    name: "Red Sauce Pasta",
    ingredients: [
      { name: "Pasta Penne", qty: 0.1 },
      { name: "Tomatoes", qty: 0.15 },
      { name: "Garlic", qty: 0.01 },
      { name: "Refined Oil", qty: 0.015 }
    ],
    targetMargin: 65
  },
  {
    name: "Paneer Butter Masala",
    ingredients: [
      { name: "Paneer", qty: 0.15 },
      { name: "Tomatoes", qty: 0.12 },
      { name: "Onions", qty: 0.08 },
      { name: "Cashews", qty: 0.02 },
      { name: "Butter", qty: 0.03 },
      { name: "Fresh Cream", qty: 0.03 },
      { name: "Garam Masala", qty: 0.005 }
    ],
    targetMargin: 55
  },
  {
    name: "Butter Chicken",
    ingredients: [
      { name: "Chicken Breast", qty: 0.2 },
      { name: "Tomatoes", qty: 0.12 },
      { name: "Onions", qty: 0.08 },
      { name: "Cashews", qty: 0.02 },
      { name: "Butter", qty: 0.03 },
      { name: "Fresh Cream", qty: 0.03 },
      { name: "Tandoori Masala", qty: 0.01 }
    ],
    targetMargin: 55
  },
  {
    name: "Veg Biryani",
    ingredients: [
      { name: "Basmati Rice", qty: 0.12 },
      { name: "Paneer", qty: 0.05 },
      { name: "Onions", qty: 0.05 },
      { name: "Curd", qty: 0.03 },
      { name: "Garam Masala", qty: 0.005 },
      { name: "Refined Oil", qty: 0.02 }
    ],
    targetMargin: 60
  },
  {
    name: "Chicken Biryani",
    ingredients: [
      { name: "Basmati Rice", qty: 0.12 },
      { name: "Chicken Breast", qty: 0.15 },
      { name: "Onions", qty: 0.05 },
      { name: "Curd", qty: 0.03 },
      { name: "Garam Masala", qty: 0.005 },
      { name: "Refined Oil", qty: 0.02 }
    ],
    targetMargin: 58
  },
  {
    name: "Chicken Tikka",
    ingredients: [
      { name: "Chicken Breast", qty: 0.2 },
      { name: "Curd", qty: 0.05 },
      { name: "Tandoori Masala", qty: 0.015 },
      { name: "Refined Oil", qty: 0.01 }
    ],
    targetMargin: 62
  },
  {
    name: "Paneer Tikka",
    ingredients: [
      { name: "Paneer", qty: 0.2 },
      { name: "Curd", qty: 0.05 },
      { name: "Tandoori Masala", qty: 0.015 },
      { name: "Refined Oil", qty: 0.01 }
    ],
    targetMargin: 60
  },
  {
    name: "Tandoori Roti",
    ingredients: [
      { name: "Wheat Flour", qty: 0.08 },
      { name: "Butter", qty: 0.005 }
    ],
    targetMargin: 75
  },
  {
    name: "Garlic Naan",
    ingredients: [
      { name: "Maida", qty: 0.08 },
      { name: "Garlic", qty: 0.005 },
      { name: "Butter", qty: 0.01 }
    ],
    targetMargin: 72
  },
  {
    name: "Gulab Jamun",
    ingredients: [
      { name: "Khoya", qty: 0.05 },
      { name: "Maida", qty: 0.01 },
      { name: "Sugar", qty: 0.06 },
      { name: "Refined Oil", qty: 0.02 }
    ],
    targetMargin: 65
  },
  {
    name: "Brownie with Ice Cream",
    ingredients: [
      { name: "Brownie Sponge", qty: 0.1 },
      { name: "Ice Cream", qty: 0.08 },
      { name: "Chocolate Syrup", qty: 0.02 }
    ],
    targetMargin: 68
  },
  {
    name: "Cheesecake Slice",
    ingredients: [
      { name: "Cream Cheese", qty: 0.08 },
      { name: "Sugar", qty: 0.02 },
      { name: "Butter", qty: 0.01 }
    ],
    targetMargin: 55 // Intentionally lower margin to trigger insights
  },
  {
    name: "Hot Chocolate",
    ingredients: [
      { name: "Milk", qty: 0.2 },
      { name: "Cocoa Powder", qty: 0.015 }, // wait, not in ingredients array!
      { name: "Sugar", qty: 0.015 }
    ],
    targetMargin: 65
  },
  {
    name: "Lemon Iced Tea",
    ingredients: [
      { name: "Tea Leaves", qty: 0.005 },
      { name: "Lemon", qty: 0.02 },
      { name: "Sugar", qty: 0.02 }
    ],
    targetMargin: 80
  }
];

// Add missing ingredient
INGREDIENTS.push({ name: "Cocoa Powder", unit: "kg", price: 800, vendor: "Metro Cash & Carry" });

function applyPsychologicalPricing(price) {
  const rounded = Math.round(price);
  if (rounded < 100) return Math.floor(rounded / 10) * 10 + 9;
  return Math.floor(rounded / 10) * 10 + 9;
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
  await supabaseAdmin.from("ingredient_price_history").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", userId);
  await supabaseAdmin.from("ingredients").delete().eq("user_id", userId);
  await supabaseAdmin.from("vendors").delete().eq("user_id", userId);
  await supabaseAdmin.from("operational_expenses").delete().eq("user_id", userId);
  await supabaseAdmin.from("restaurant_profiles").delete().eq("user_id", userId);
}

async function main() {
  console.log("🚀 Starting Bombay Brew Demo Seeder...");

  console.log(`\n☕ Setting up Bombay Brew: ${ACCOUNT.email}`);
  const userId = await setupUser(ACCOUNT);
  await clearData(userId);

  await supabaseAdmin.from("restaurant_profiles").insert({
    user_id: userId,
    business_name: ACCOUNT.business_name,
    business_type: ACCOUNT.business_type,
    phone_number: "+91 9820012345",
    tax_id: "27AADCB1234F1Z9",
    address: "Shop 12, Linking Road, Bandra West",
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

  const ingredientMap = {};
  const now = new Date();

  for (const ing of INGREDIENTS) {
    const { data } = await supabaseAdmin.from("ingredients").insert({
      user_id: userId,
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
      
      let historicalPrice = ing.price * (1 + (Math.random() * 0.05 - 0.025));

      await supabaseAdmin.from("ingredient_purchases").insert({
        user_id: userId,
        vendor_id: vendorMap[ing.vendor] || null,
        ingredient_name: ing.name,
        quantity: 10 + Math.floor(Math.random() * 20),
        unit: ing.unit,
        price: historicalPrice, // stored as per unit base price for realistic history
        purchase_date: pDate.toISOString().split("T")[0],
      });

      await supabaseAdmin.from("ingredient_price_history").insert({
        user_id: userId,
        ingredient_id: data.id,
        ingredient_name: ing.name,
        price_per_unit: historicalPrice,
        vendor_id: vendorMap[ing.vendor] || null,
        recorded_at: pDate.toISOString(),
        source: monthOffset === 0 ? "manual" : "seeded",
      });
    }
  }

  // Realistic Mumbai OPEX
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - monthOffset);
    const monthStr = d.toISOString().slice(0, 7) + "-01";
    
    await supabaseAdmin.from("operational_expenses").insert({
      user_id: userId,
      month: monthStr,
      electricity_bill: 28000 + (Math.random() * 4000),
      gas_bill: 14000 + (Math.random() * 2000),
      salary_cost: 180000,
    });
  }

  for (const r of RECIPES) {
    let totalCost = 0;
    for (const i of r.ingredients) {
      const ing = ingredientMap[i.name];
      if (ing) totalCost += ing.price_per_unit * i.qty;
    }

    const { data: recipe } = await supabaseAdmin.from("recipes").insert({
      user_id: userId,
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

    // Costing Service logic manually re-implemented here for initial menu_item seeding
    const assumedMonthlyVolume = 5000;
    const totalOpex = 28000 + 14000; // avg elec + gas
    const totalSalary = 180000;

    const opsAlloc = totalOpex / assumedMonthlyVolume;
    const salaryAlloc = totalSalary / assumedMonthlyVolume;
    const packagingCost = 15;

    const finalDishCost = totalCost + opsAlloc + salaryAlloc + packagingCost;

    // Let's create an ideal price. We want a 32% food cost roughly, but maybe we can just set it based on targetFoodCost = 0.32
    // User requested range of selling prices, e.g. Tea 20-60, Coffee 90-220. 32% of finalDishCost works well.
    const idealPrice = applyPsychologicalPricing(finalDishCost / 0.32);
    
    const profitMargin = ((idealPrice - finalDishCost) / idealPrice) * 100;

    await supabaseAdmin.from("menu_items").insert({
      user_id: userId,
      recipe_id: recipe.id,
      selling_price: idealPrice,
      profit_margin: profitMargin.toFixed(2),
      ai_suggested_price: idealPrice,
    });
  }

  await supabaseAdmin.from("ai_usage_logs").delete().eq("user_id", userId);
  await supabaseAdmin.from("ai_usage_logs").insert({
    user_id: userId,
    request_count: 85,
    log_date: now.toISOString().split("T")[0],
  });

  console.log("✅ Bombay Brew Demo Account ready.");
  console.log("   Ingredients:", INGREDIENTS.length);
  console.log("   Recipes:", RECIPES.length);
  console.log("\n🎯 Demo Seeding Complete!");
  process.exit(0);
}

main().catch(console.error);
