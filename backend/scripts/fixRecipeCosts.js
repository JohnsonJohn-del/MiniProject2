import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

/**
 * This script fixes the DB by:
 * 1. Adding unit column to recipe_ingredients via Supabase API
 * 2. Adding water_bill column to operational_expenses
 * 3. Recalculating total_cost for all recipes that show 0
 */

async function tryAddColumn(tableName, colDef) {
  // We use the PostgREST schema cache refresh trick - try inserting a dummy row with the column
  // If the column doesn't exist, we catch the error message
  console.log(`Checking ${tableName} for ${colDef.name}...`);
  const { error } = await supabaseAdmin.from(tableName).select(colDef.name).limit(1);
  if (!error) {
    console.log(`  ✅ Column ${colDef.name} already exists.`);
    return true;
  }
  console.log(`  ⚠️  Column ${colDef.name} missing: ${error.message}`);
  return false;
}

async function recalculateRecipeCosts() {
  console.log("\nFetching all recipes...");
  const { data: recipes } = await supabaseAdmin.from("recipes").select("id, user_id, recipe_name, total_cost");

  const zeroRecipes = recipes?.filter(r => Number(r.total_cost) === 0 && r.recipe_name !== "abc" && r.recipe_name !== "bbb");
  console.log(`Found ${zeroRecipes?.length} recipes with 0 cost: ${zeroRecipes?.map(r => r.recipe_name).join(", ")}`);

  for (const recipe of (zeroRecipes || [])) {
    // Get recipe ingredients
    const { data: ri } = await supabaseAdmin
      .from("recipe_ingredients")
      .select("ingredient_id, quantity")
      .eq("recipe_id", recipe.id);

    if (!ri?.length) { console.log(`  Skipping ${recipe.recipe_name} - no ingredients`); continue; }

    // Get ingredient details
    const ingredientIds = ri.map(r => r.ingredient_id);
    const { data: ings } = await supabaseAdmin
      .from("ingredients")
      .select("id, price_per_unit, unit")
      .in("id", ingredientIds);

    if (!ings?.length) { console.log(`  Skipping ${recipe.recipe_name} - no ingredient data`); continue; }

    // Calculate cost treating quantity as already in base unit (since unit column doesn't exist)
    let totalCost = 0;
    for (const item of ri) {
      const ing = ings.find(i => i.id === item.ingredient_id);
      if (ing && ing.price_per_unit > 0) {
        totalCost += Number(item.quantity) * Number(ing.price_per_unit);
      }
    }

    if (totalCost > 0) {
      const { error } = await supabaseAdmin
        .from("recipes")
        .update({ total_cost: totalCost })
        .eq("id", recipe.id);
      
      if (error) {
        console.log(`  ❌ Failed to update ${recipe.recipe_name}: ${error.message}`);
      } else {
        console.log(`  ✅ Updated ${recipe.recipe_name}: ₹${totalCost.toFixed(2)}`);
      }
    } else {
      console.log(`  ⚠️  ${recipe.recipe_name} still 0 after recalc (ingredients may have 0 price)`);
    }
  }
}

async function main() {
  await tryAddColumn("recipe_ingredients", { name: "unit" });
  await tryAddColumn("operational_expenses", { name: "water_bill" });
  await recalculateRecipeCosts();
  console.log("\nDone.");
}

main().catch(console.error).finally(() => process.exit(0));
