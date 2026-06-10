import dns from "dns/promises";

async function main() {
  const host = "db.qqfgolwjuqjvqcmcweua.supabase.co";
  console.log(`Resolving IPv6 addresses for ${host}...`);
  try {
    const addresses = await dns.resolve6(host);
    console.log("✅ Resolved IPv6 addresses:", addresses);
  } catch (err) {
    console.error("❌ Failed to resolve IPv6:", err.message);
  }

  console.log(`Resolving IPv4 addresses for ${host}...`);
  try {
    const addresses = await dns.resolve4(host);
    console.log("✅ Resolved IPv4 addresses:", addresses);
  } catch (err) {
    console.error("❌ Failed to resolve IPv4:", err.message);
  }
}

main().catch(console.error);
