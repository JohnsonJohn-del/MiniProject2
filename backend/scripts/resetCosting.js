import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import path from "path";

config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function resetAndSeed() {
  console.log("Starting costing reset...");

  // 1. Get all users
  const { data: users } = await supabaseAdmin.from("users").select("id, email");
  if (!users) return console.error("No users found");

  const realisticIngredients = [
    { name: "Coffee Beans", unit: "kg", price: 1200 },
    { name: "Milk", unit: "l", price: 65 },
    { name: "Sugar", unit: "kg", price: 45 },
    { name: "Cocoa Powder", unit: "kg", price: 800 },
    { name: "Chicken Breast", unit: "kg", price: 280 },
    { name: "Paneer", unit: "kg", price: 350 },
    { name: "Basmati Rice", unit: "kg", price: 110 },
    { name: "Onions", unit: "kg", price: 40 },
    { name: "Tomatoes", unit: "kg", price: 50 },
    { name: "Khoya", unit: "kg", price: 380 },
    { name: "Maida", unit: "kg", price: 45 },
    { name: "Butter", unit: "kg", price: 550 },
    { name: "Ice Cream", unit: "l", price: 180 },
    { name: "Pasta", unit: "kg", price: 150 },
    { name: "Cheese", unit: "kg", price: 480 }
  ];

  for (const user of users) {
    console.log(`Resetting data for user: ${user.email}`);

    // 2. Delete all existing ingredient purchases to reset pricing history
    await supabaseAdmin.from("ingredient_purchases").delete().eq("user_id", user.id);

    // 3. Update ingredients with realistic base prices
    for (const item of realisticIngredients) {
      const { data: existing } = await supabaseAdmin
        .from("ingredients")
        .select("id")
        .eq("user_id", user.id)
        .eq("ingredient_name", item.name)
        .maybeSingle();

      if (existing) {
        await supabaseAdmin.from("ingredients").update({ price_per_unit: item.price, unit: item.unit }).eq("id", existing.id);
      } else {
        await supabaseAdmin.from("ingredients").insert({
          user_id: user.id,
          ingredient_name: item.name,
          unit: item.unit,
          price_per_unit: item.price
        });
      }
    }

    // Delete any absurd ingredients created by OCR tests (e.g., those > 5000)
    await supabaseAdmin.from("ingredients").delete().eq("user_id", user.id).gt("price_per_unit", 5000);

    // 4. Recalculate all recipes
    const { data: recipes } = await supabaseAdmin.from("recipes").select("id").eq("user_id", user.id);
    if (recipes && recipes.length > 0) {
      for (const recipe of recipes) {
        const { data: recipeItems } = await supabaseAdmin
          .from("recipe_ingredients")
          .select("ingredient_id, quantity, ingredients(price_per_unit)")
          .eq("recipe_id", recipe.id);
          
        let totalCost = 0;
        if (recipeItems) {
          recipeItems.forEach(ri => {
            if (ri.ingredients) {
               // Since we now rely on normalizeQuantity during SAVE, let's assume current DB quantities are messed up if they are > 10
               // Let's forcibly fix quantities if they look like they were typed as grams instead of kg.
               let qty = Number(ri.quantity);
               if (qty > 10) qty = qty / 1000; 

               // Update the DB to the fixed qty
               supabaseAdmin.from("recipe_ingredients")
                 .update({ quantity: qty })
                 .eq("recipe_id", recipe.id)
                 .eq("ingredient_id", ri.ingredient_id)
                 .then();

               totalCost += qty * Number(ri.ingredients.price_per_unit);
            }
          });
        }

        await supabaseAdmin.from("recipes").update({ total_cost: totalCost.toFixed(2) }).eq("id", recipe.id);
        console.log(`Updated recipe ${recipe.id} cost to ${totalCost.toFixed(2)}`);
      }
    }
  }

  console.log("Reset Complete!");
  process.exit(0);
}

resetAndSeed().catch(console.error);
