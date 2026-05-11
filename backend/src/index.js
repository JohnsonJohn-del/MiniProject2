import app from "./app.js";
import { env } from "./config/env.js";
import { seedAdminIfMissing } from "./services/adminSeeder.js";

async function start() {
  try {
    await seedAdminIfMissing();
  } catch (error) {
    console.warn("Admin seeding skipped:", error.message);
  }

  app.listen(env.port, () => {
    console.log(`Backend running on port ${env.port}`);
  });
}

start();
