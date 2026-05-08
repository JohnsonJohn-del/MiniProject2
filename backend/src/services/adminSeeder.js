import bcrypt from "bcryptjs";
import { query } from "../config/db.js";
import { env } from "../config/env.js";

async function seedUserIfMissing({ name, email, password, role = "client", subscriptionPlan = "free" }) {
  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows[0]) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await query(
    `INSERT INTO users (name, email, password_hash, role, subscription_plan)
     VALUES ($1, $2, $3, $4, $5)`,
    [name, email, passwordHash, role, subscriptionPlan]
  );
}

export async function seedAdminIfMissing() {
  if (env.adminEmail && env.adminPassword) {
    await seedUserIfMissing({
      name: "Platform Admin",
      email: env.adminEmail,
      password: env.adminPassword,
      role: "admin",
      subscriptionPlan: "premium"
    });
  }

  await seedUserIfMissing({
    name: "Demo Client",
    email: "client@demo.com",
    password: "123456",
    role: "client",
    subscriptionPlan: "premium"
  });

  await seedUserIfMissing({
    name: "Demo Admin",
    email: "admin@demo.com",
    password: "123456",
    role: "admin",
    subscriptionPlan: "premium"
  });

  console.log("Admin and demo accounts seeded when missing.");
}
