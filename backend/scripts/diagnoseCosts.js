import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

async function main() {
  // Check columns
  const colChecks = [
    ["recipe_ingredients", "unit"],
    ["operational_expenses", "water_bill"],
  ];
  for (const [table, col] of colChecks) {
    const { data, error } = await supabaseAdmin.from(table).select(col).limit(1);
    console.log(`${table}.${col}: ${error ? "MISSING - " + error.message : "EXISTS"}`);
  }

  // Check recipe total_costs
  const { data: recipes } = await supabaseAdmin.from("recipes").select("id, recipe_name, total_cost").order("recipe_name");
  console.log("\nRecipe costs:");
  recipes?.forEach(r => console.log(`  ${r.recipe_name}: ${r.total_cost}`));

  // Check recipe_ingredients for a zero-cost recipe
  const zeroRecipe = recipes?.find(r => Number(r.total_cost) === 0);
  if (zeroRecipe) {
    const { data: ri, error: riErr } = await supabaseAdmin
      .from("recipe_ingredients").select("*").eq("recipe_id", zeroRecipe.id);
    console.log(`\nrecipe_ingredients for "${zeroRecipe.recipe_name}":`, JSON.stringify(ri), riErr?.message || "");
    
    // Check ingredient prices
    if (ri?.length) {
      const ids = ri.map(r => r.ingredient_id);
      const { data: ings } = await supabaseAdmin.from("ingredients").select("id, ingredient_name, price_per_unit, unit").in("id", ids);
      console.log("Ingredient prices:", JSON.stringify(ings));
    }
  }
  
  // Check opex with water_bill fallback
  const { data: opex, error: opexErr } = await supabaseAdmin.from("operational_expenses").select("electricity_bill, gas_bill, salary_cost").limit(1).maybeSingle();
  console.log("\nOpex (without water):", JSON.stringify(opex), opexErr?.message || "");
}

main().catch(console.error).finally(() => process.exit(0));
