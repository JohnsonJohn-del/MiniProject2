import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config({ path: "./backend/.env" });

const supabaseUrl = process.env.SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Supabase Key starts with:", supabaseKey?.substring(0, 15));

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting sign in with password...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "client@demo.com",
    password: "password123"
  });

  if (error) {
    console.error("❌ Sign in failed:", error.message);
  } else {
    console.log("✅ Sign in successful!", data.user?.id);
  }
}

test().catch(console.error);
