import pg from "pg";

async function testConnection(port) {
  console.log(`Trying pooler connection on port ${port}...`);
  const connectionString = `postgresql://postgres.qqfgolwjuqjvqcmcweua:P9zNYx6pMvvnF29w@aws-0-ap-south-1.pooler.supabase.com:${port}/postgres`;
  
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log(`✅ Connected successfully on port ${port}!`);
    const sql = "ALTER TABLE restaurant_profiles ADD COLUMN IF NOT EXISTS packaging_cost NUMERIC(12,2) NOT NULL DEFAULT 15.00;";
    await client.query(sql);
    console.log(`✅ Migration SQL executed successfully on port ${port}.`);
    await client.end();
    return true;
  } catch (err) {
    console.error(`❌ Failed on port ${port}:`, err.message);
    try { await client.end(); } catch (e) {}
    return false;
  }
}

async function main() {
  const success5432 = await testConnection(5432);
  if (!success5432) {
    await testConnection(6543);
  }
}

main().catch(console.error);
