import "dotenv/config";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

async function main() {
  console.log("Creating ingredient_price_history table...");

  // Use Supabase's REST API to check if table exists by inserting a test
  const { error: checkError } = await supabaseAdmin
    .from("ingredient_price_history")
    .select("id")
    .limit(1);

  if (!checkError) {
    console.log("✅ Table already exists.");
    return;
  }

  // Table doesn't exist - use the Supabase management API via fetch
  const projectRef = process.env.SUPABASE_URL?.match(/https:\/\/([^.]+)\./)?.[1];
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!projectRef || !serviceKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    process.exit(1);
  }

  const sql = `
    CREATE TABLE IF NOT EXISTS ingredient_price_history (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      ingredient_id UUID NOT NULL REFERENCES ingredients(id) ON DELETE CASCADE,
      ingredient_name TEXT NOT NULL,
      price_per_unit NUMERIC(12, 4) NOT NULL,
      vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      source TEXT NOT NULL DEFAULT 'manual'
    );
    CREATE INDEX IF NOT EXISTS idx_price_history_user_id ON ingredient_price_history(user_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_ingredient_id ON ingredient_price_history(ingredient_id);
    CREATE INDEX IF NOT EXISTS idx_price_history_recorded_at ON ingredient_price_history(recorded_at DESC);
  `;

  const res = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`
      },
      body: JSON.stringify({ query: sql })
    }
  );

  if (res.ok) {
    console.log("✅ ingredient_price_history table created successfully.");
  } else {
    const body = await res.text();
    console.log("Management API response:", res.status, body);
    console.log("\n⚠️  Please run this SQL manually in Supabase Dashboard > SQL Editor:");
    console.log(sql);
  }
}

main().catch(console.error);
