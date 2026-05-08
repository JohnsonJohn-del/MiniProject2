import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error("SUPABASE_SERVICE_ROLE_KEY is required. Get it from Supabase Dashboard > Project Settings > API > service_role key");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const demoUsers = [
  {
    email: "admin@demo.com",
    password: "123456",
    email_confirm: true,
    user_metadata: { name: "Demo Admin", role: "admin", subscription_plan: "premium" }
  },
  {
    email: "client@demo.com",
    password: "123456",
    email_confirm: true,
    user_metadata: { name: "Demo Client", role: "client", subscription_plan: "premium" }
  }
];

async function seed() {
  for (const user of demoUsers) {
    const { data: existing } = supabase.auth.admin.getUserByEmail ? await supabase.auth.admin.getUserByEmail(user.email) : { data: { user: null } };

    if (existing?.user) {
      console.log(`User ${user.email} already exists, skipping.`);
      continue;
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: user.email_confirm,
      user_metadata: user.user_metadata
    });

    if (error) {
      console.error(`Failed to create ${user.email}:`, error.message);
    } else {
      console.log(`Created demo user: ${user.email} (${user.user_metadata.role})`);
    }
  }

  console.log("Demo seed complete.");
}

seed().catch(console.error);