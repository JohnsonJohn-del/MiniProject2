async function main() {
  console.log("Testing network fetch inside Node environment...");
  
  const urls = [
    "https://api.github.com/zen",
    "https://qqfgolwjuqjvqcmcweua.supabase.co/auth/v1/health",
    "https://www.google.com"
  ];

  for (const url of urls) {
    try {
      console.log(`Fetching: ${url}...`);
      const res = await Promise.race([
        fetch(url),
        new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout after 5s")), 5000))
      ]);
      console.log(`✅ Success: ${url} status is ${res.status}`);
    } catch (err) {
      console.log(`❌ Failed: ${url} error is: ${err.message}`);
    }
  }
}

main().catch(console.error);
