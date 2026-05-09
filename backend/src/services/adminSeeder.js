import bcrypt from "bcryptjs";
import { supabaseAdmin } from "../config/supabaseAdmin.js";
import { env } from "../config/env.js";

async function seedUserIfMissing({ name, email, password, role = "client", subscriptionPlan = "free" }) {
  const { data: existing } = await supabaseAdmin
    .from("users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (existing) return;

  const passwordHash = await bcrypt.hash(password, 10);
  await supabaseAdmin.from("users").insert({
    name,
    email,
    password_hash: passwordHash,
    role,
    subscription_plan: subscriptionPlan
  });
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
