import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config({ path: "./backend/.env" });

const supabaseUrl = process.env.SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Attempting sign in with password...");
  const { data, error } = await supabase.auth.signInWithPassword({
    email: "client@demo.com",
    password: "password123"
  });

  if (error) {
    console.error("❌ Sign in failed:", error.message);
    return;
  }
  console.log("✅ Sign in successful!", data.user?.id);
  const token = data.session.access_token;
  
  try {
    const res = await axios.get("http://localhost:5000/api/analytics/client", {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log("✅ Analytics fetched successfully:", res.data);
  } catch (err) {
    console.error("❌ Analytics fetch failed:", err.response?.status, err.response?.data || err.message);
  }
}

test().catch(console.error);
