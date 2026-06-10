import pg from "pg";

async function main() {
  console.log("Running migration to add packaging_cost to restaurant_profiles...");
  
  // Use the newly resolved IPv6 address
  const connectionString = "postgresql://postgres:P9zNYx6pMvvnF29w@[2406:da1a:82a:9d00:2de1:a123:a553:3f65]:5432/postgres";

  const client = new pg.Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log("✅ Connected to Supabase Postgres.");

    const sql = "ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC(12,2) NOT NULL DEFAULT 15.00;";
    await client.query(sql);
    console.log("✅ Column packaging_cost added successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

main().catch(console.error);
