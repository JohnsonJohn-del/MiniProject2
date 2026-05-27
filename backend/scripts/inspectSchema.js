import "dotenv/config";
import { env } from "../src/config/env.js";

async function inspect() {
  const url = `${env.supabaseUrl}/rest/v1/`;
  console.log(`Fetching OpenAPI spec from: ${env.supabaseUrl}...`);
  try {
    const res = await fetch(url, {
      headers: {
        "apikey": env.supabaseServiceRoleKey,
        "Authorization": `Bearer ${env.supabaseServiceRoleKey}`
      }
    });
    if (!res.ok) {
      console.error(`Failed to fetch spec: ${res.status} ${res.statusText}`);
      return;
    }
    const spec = await res.json();
    const paths = Object.keys(spec.paths || {});
    const rpcPaths = paths.filter(p => p.startsWith("/rpc/"));
    console.log("Available RPC functions:");
    rpcPaths.forEach(p => console.log(`  - ${p.slice(5)}`));
  } catch (err) {
    console.error("Error inspecting schema:", err.message);
  }
}

inspect().catch(console.error);
