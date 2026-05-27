import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

async function main() {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    query: 'ALTER TABLE recipes ADD COLUMN IF NOT EXISTS servings numeric DEFAULT 1;'
  });
  if (error) {
    console.log("RPC exec_sql failed, trying direct query if possible or maybe we don't need to add it via SQL if Supabase data API allows updating it if the column exists.");
    console.log(error);
  }
  console.log("Done.");
}

main();
