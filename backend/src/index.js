import app from "./app.js";
import { env } from "./config/env.js";
import { pool } from "./config/db.js";
import { seedAdminIfMissing } from "./services/adminSeeder.js";

async function start() {
  try {
    await pool.query("SELECT 1");
    await seedAdminIfMissing();

    app.listen(env.port, () => {
      console.log(`Backend running on port ${env.port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

start();
