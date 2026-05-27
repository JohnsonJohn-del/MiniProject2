import { config } from "dotenv";
import path from "path";
config({ path: path.resolve(process.cwd(), ".env") });

import { getEngineeringData } from "../src/controllers/engineeringController.js";
import { supabaseAdmin } from "../src/config/supabaseAdmin.js";

async function run() {
  try {
    // 1. Get bombaybrew@demo.com user
    const { data: user } = await supabaseAdmin.from("users").select("id").eq("email", "bombaybrew@demo.com").single();
    
    if (!user) {
      console.log("User not found!");
      return;
    }

    const req = { user: { id: user.id, role: "client" } };
    const res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        console.log("HTTP STATUS:", this.statusCode || 200);
        if (data.success) {
          console.log("SUCCESS. Returned items:", data.data?.length);
          console.log("Insights:", data.insights);
          console.log("Sample Data item 0:", JSON.stringify(data.data?.[0], null, 2));
        } else {
          console.error("FAILED JSON:", data);
        }
      }
    };

    console.log("Calling getEngineeringData...");
    await getEngineeringData(req, res);
    
  } catch (error) {
    console.error("Test Script Error:", error);
  }
}

run();
