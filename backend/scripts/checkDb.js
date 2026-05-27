import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

async function check() {
  const tables = [
    "users",
    "vendors",
    "ingredients",
    "recipes",
    "recipe_ingredients",
    "operational_expenses",
    "menu_items",
    "ai_usage_logs",
    "restaurant_profiles",
    "uploaded_documents",
    "ingredient_purchases",
    "ingredient_price_history",
    "subscriptions",
    "payment_history"
  ];

  console.log("Checking tables existence...");
  for (const table of tables) {
    const { error } = await supabaseAdmin.from(table).select("*").limit(1);
    if (error) {
      console.log(`❌ Table '${table}' check error: ${error.message} (${error.code})`);
    } else {
      console.log(`✅ Table '${table}' exists!`);
    }
  }

  console.log("\nChecking 'unit' column in 'recipe_ingredients'...");
  const { data, error } = await supabaseAdmin.from("recipe_ingredients").select("unit").limit(1);
  if (error) {
    console.log(`❌ Column 'unit' in 'recipe_ingredients' error: ${error.message} (${error.code})`);
  } else {
    console.log("✅ Column 'unit' in 'recipe_ingredients' exists!");
  }
}

check().catch(console.error);
