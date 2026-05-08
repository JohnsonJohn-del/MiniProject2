import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { env } from "../config/env.js";

export async function seedAdminIfMissing() {
  if (!env.adminEmail || !env.adminPassword) return;

  const existing = await query("SELECT id FROM users WHERE email = $1", [env.adminEmail]);
  if (existing.rows[0]) return;

  const passwordHash = await bcrypt.hash(env.adminPassword, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role, subscription_plan)
     VALUES ($1, $2, $3, 'admin', 'premium')`,
    ["Platform Admin", env.adminEmail, passwordHash]
  );

  console.log("Admin account seeded.");
}
