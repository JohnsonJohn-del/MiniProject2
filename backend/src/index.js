import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { seedAdminIfMissing } from "./services/adminSeeder.js";

async function start() {
  let pgAvailable = false;
  try {
    await pool.query("SELECT 1");
    pgAvailable = true;
    console.log("PostgreSQL connected (pg)");
  } catch (error) {
    console.warn("PostgreSQL (pg) unavailable:", error.message);
    console.warn("Server will use Supabase REST API for database operations.");
  }

  if (pgAvailable) {
    try {
      await seedAdminIfMissing();
    } catch (error) {
      console.warn("Admin seeding skipped:", error.message);
    }
  }

  app.listen(env.port, () => {
    console.log(`Backend running on port ${env.port}`);
  });
}

start();
