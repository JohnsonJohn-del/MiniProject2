import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

const INGREDIENTS_TO_ADD = [
  { name: "Butter", type: "weight", unit: "kg", price: "620" },
  { name: "Milk", type: "liquid", unit: "l", price: "68" },
  { name: "Coffee Powder", type: "weight", unit: "kg", price: "1200" },
  { name: "Sugar", type: "weight", unit: "kg", price: "45" },
  { name: "Fresh Cream", type: "liquid", unit: "l", price: "240" },
  { name: "Paneer", type: "weight", unit: "kg", price: "360" },
  { name: "Tomato", type: "weight", unit: "kg", price: "40" },
  { name: "Onion", type: "weight", unit: "kg", price: "32" },
  { name: "Garam Masala", type: "weight", unit: "kg", price: "900" },
  { name: "Palm Oil", type: "liquid", unit: "l", price: "145" },
  { name: "Basmati Rice", type: "weight", unit: "kg", price: "140" },
  { name: "Chicken", type: "weight", unit: "kg", price: "320" },
  { name: "Mozzarella Cheese", type: "weight", unit: "kg", price: "780" },
  { name: "Pasta", type: "weight", unit: "kg", price: "180" },
  { name: "Cocoa Powder", type: "weight", unit: "kg", price: "850" }
];

const RECIPES_TO_ADD = [
  {
    name: "Cold Coffee",
    ingredients: [
      { name: "Milk", qty: "250", unit: "ml" },
      { name: "Coffee Powder", qty: "12", unit: "g" },
      { name: "Sugar", qty: "18", unit: "g" },
      { name: "Fresh Cream", qty: "20", unit: "ml" }
    ]
  },
  {
    name: "Paneer Butter Masala",
    ingredients: [
      { name: "Paneer", qty: "180", unit: "g" },
      { name: "Butter", qty: "25", unit: "g" },
      { name: "Tomato", qty: "120", unit: "g" },
      { name: "Onion", qty: "80", unit: "g" },
      { name: "Fresh Cream", qty: "30", unit: "ml" },
      { name: "Garam Masala", qty: "5", unit: "g" }
    ]
  },
  {
    name: "Chicken Biryani",
    ingredients: [
      { name: "Chicken", qty: "220", unit: "g" },
      { name: "Basmati Rice", qty: "180", unit: "g" },
      { name: "Palm Oil", qty: "20", unit: "ml" },
      { name: "Onion", qty: "90", unit: "g" },
      { name: "Garam Masala", qty: "6", unit: "g" }
    ]
  },
  {
    name: "White Sauce Pasta",
    ingredients: [
      { name: "Pasta", qty: "150", unit: "g" },
      { name: "Milk", qty: "200", unit: "ml" },
      { name: "Butter", qty: "20", unit: "g" },
      { name: "Mozzarella Cheese", qty: "60", unit: "g" },
      { name: "Fresh Cream", qty: "25", unit: "ml" }
    ]
  },
  {
    name: "Chocolate Shake",
    ingredients: [
      { name: "Milk", qty: "300", unit: "ml" },
      { name: "Cocoa Powder", qty: "15", unit: "g" },
      { name: "Sugar", qty: "20", unit: "g" },
      { name: "Fresh Cream", qty: "30", unit: "ml" }
    ]
  }
];

async function run() {
  console.log("Starting full costing simulation...");
  
  const executablePaths = [
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe"
  ];
  let execPath = undefined;
  for (const p of executablePaths) {
    if (fs.existsSync(p)) {
      execPath = p;
      console.log("Using browser at:", p);
      break;
    }
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: execPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });

  // Page logs and errors for troubleshooting
  page.on("console", msg => console.log(`[PAGE LOG] ${msg.text()}`));
  page.on("pageerror", err => console.error(`[PAGE ERROR] ${err.message}`));

  const outputDir = "./screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  // Handle confirm/alert dialogs
  page.on("dialog", async dialog => {
    console.log(`[Dialog] Accepting: ${dialog.message()}`);
    await dialog.accept();
  });

  // Enable request interception to translate 'volume' recommendations to 'liquid'
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    const url = request.url();
    if (url.includes("/api/ai/recommend-unit")) {
      if (request.method() === "OPTIONS") {
        await request.continue();
        return;
      }
      
      console.log(`[Puppeteer Intercept] Intercepting request to: ${url}`);
      try {
        const postData = request.postData();
        const payload = JSON.parse(postData || "{}");
        const name = payload.ingredient_name || "";
        const ing = INGREDIENTS_TO_ADD.find(i => i.name.toLowerCase() === name.toLowerCase());

        if (ing) {
          console.log(`[Puppeteer Intercept] Mocking recommendation for ${name} -> ${ing.type} (${ing.unit})`);
          await request.respond({
            status: 200,
            headers: {
              "access-control-allow-origin": "*",
              "content-type": "application/json"
            },
            body: JSON.stringify({
              success: true,
              source: "puppeteer-mock",
              unit_type: ing.type,
              suggested_unit: ing.unit
            })
          });
          return;
        } else {
          // Fallback: Fetch from the real backend, and translate volume -> liquid
          const headers = request.headers();
          const response = await fetch(url, {
            method: request.method(),
            headers: headers,
            body: postData
          });
          
          const text = await response.text();
          let data = {};
          try {
            data = JSON.parse(text);
          } catch (e) {}

          if (data && data.unit_type === "volume") {
            console.log(`[Puppeteer Intercept] Sanitizing 'volume' to 'liquid' for: ${name}`);
            data.unit_type = "liquid";
          }
          await request.respond({
            status: response.status,
            headers: {
              "access-control-allow-origin": "*",
              "content-type": "application/json"
            },
            body: JSON.stringify(data)
          });
          return;
        }
      } catch (err) {
        console.error("[Puppeteer Intercept] Error processing recommendation interception:", err);
      }
    }
    await request.continue();
  });

  try {
    // 1. Login
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1500));

    console.log("Clicking Demo Client login...");
    const buttons = await page.$$("button");
    let clickedDemo = false;
    for (const btn of buttons) {
      const text = await page.evaluate(el => el.textContent, btn);
      if (text.includes("Demo Client")) {
        await btn.click();
        clickedDemo = true;
        break;
      }
    }
    if (!clickedDemo) throw new Error("Demo Client button not found");
    await new Promise(r => setTimeout(r, 3000));

    // 2. Clear existing Recipes
    console.log("Navigating to Recipe Builder for cleanup...");
    await page.goto("http://localhost:5173/app/recipes", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 2000));
    
    let deleteRecipeBtns = await page.$$('table button[class*="hover:text-rose-600"]');
    while (deleteRecipeBtns.length > 0) {
      console.log(`Cleaning up recipe (${deleteRecipeBtns.length} remaining)...`);
      await deleteRecipeBtns[0].click();
      await new Promise(r => setTimeout(r, 1500));
      deleteRecipeBtns = await page.$$('table button[class*="hover:text-rose-600"]');
    }

    // 3. Clear existing Ingredients
    console.log("Navigating to Kitchen Inventory for cleanup...");
    await page.goto("http://localhost:5173/app/ingredients", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 2000));

    let deleteIngBtns = await page.$$('table button[class*="hover:text-rose-600"]');
    while (deleteIngBtns.length > 0) {
      console.log(`Cleaning up ingredient (${deleteIngBtns.length} remaining)...`);
      await deleteIngBtns[0].click();
      await new Promise(r => setTimeout(r, 1500));
      deleteIngBtns = await page.$$('table button[class*="hover:text-rose-600"]');
    }

    // 4. Add new Ingredients
    console.log("\n--- ADDING INGREDIENTS ---");
    for (const ing of INGREDIENTS_TO_ADD) {
      console.log(`Adding: ${ing.name} (${ing.price} per ${ing.unit})`);
      
      const nameInput = await page.waitForSelector('input[placeholder="e.g. Basmati Rice"]');
      await nameInput.click({ clickCount: 3 });
      await nameInput.press("Backspace");
      await nameInput.type(ing.name, { delay: 50 });
      
      // Wait for any preset dropdown animations to fully exit before clicking other elements
      await new Promise(r => setTimeout(r, 600));

      const categoryLabel = ing.type === "weight" ? "Weight based" : "Liquid based";
      const catButtons = await page.$$("button");
      for (const btn of catButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes(categoryLabel)) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 100));

      const unitButtons = await page.$$("button");
      for (const btn of unitButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.trim() === ing.unit) {
          await btn.click();
          break;
        }
      }
      await new Promise(r => setTimeout(r, 100));

      const priceInput = await page.waitForSelector('input[placeholder="0.00"]');
      await priceInput.click({ clickCount: 3 });
      await priceInput.press("Backspace");
      await priceInput.type(ing.price, { delay: 10 });

      let clickedCreate = false;
      const ingFormButtons = await page.$$("button");
      let submitBtn = null;
      for (const btn of ingFormButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes("Create Ingredient") || text.includes("Update Ingredient")) {
          submitBtn = btn;
          clickedCreate = true;
          break;
        }
      }
      if (!clickedCreate) throw new Error("Could not find Create Ingredient button");
      
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/ingredients') && ['POST', 'PUT'].includes(res.request().method())).then(async (res) => {
          const text = await res.text();
          console.log(`[Save Ingredient] ${ing.name} -> Status: ${res.status()}, Response: ${text.substring(0, 100)}`);
          if (!res.ok) throw new Error(`Failed to save ${ing.name}`);
        }),
        submitBtn.click()
      ]);
      await new Promise(r => setTimeout(r, 800)); // buffer for form reset state
    }

    // 5. Formulate and Screenshot Recipes
    console.log("\n--- FORMULATING RECIPES ---");
    
    // Debug fetch ingredients
    await page.goto("http://localhost:5173/app/recipes", { waitUntil: "domcontentloaded" });
    const rawIngs = await page.evaluate(async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/ingredients', {
          headers: { 'Authorization': 'Bearer ' + token }
        });
        const data = await res.json();
        return data.ingredients;
      } catch (e) { return e.toString(); }
    });
    console.log("DEBUG: raw ingredients from API:", JSON.stringify(rawIngs, null, 2));

    for (const recipe of RECIPES_TO_ADD) {
      console.log(`Creating recipe: ${recipe.name}`);
      await page.goto("http://localhost:5173/app/recipes", { waitUntil: "domcontentloaded" });
      await new Promise(r => setTimeout(r, 2000));

      const dishNameInput = await page.waitForSelector('input[placeholder="e.g. Signature Butter Chicken"]');
      await dishNameInput.type(recipe.name, { delay: 10 });

      for (let i = 0; i < recipe.ingredients.length; i++) {
        const item = recipe.ingredients[i];

        if (i > 0) {
          const buttons = await page.$$("button");
          let clickedAdd = false;
          for (const btn of buttons) {
            const text = await page.evaluate(el => el.textContent, btn);
            if (text.includes("Add Ingredient Line")) {
              await btn.click();
              clickedAdd = true;
              break;
            }
          }
          if (!clickedAdd) throw new Error("Could not add ingredient line");
          await new Promise(r => setTimeout(r, 300));
        }

        const rows = await page.$$("form div.group");
        const row = rows[i];
        if (!row) throw new Error(`Ingredient row ${i} not found`);

        const selects = await row.$$("select");
        const selectIng = selects[0];
        const selectUnit = selects[1];
        const qtyInput = await row.$('input[type="number"]');

        // Select matching ingredient option
        const optVal = await page.evaluate((sel, text) => {
          const options = Array.from(sel.options);
          console.log("AVAILABLE INGREDIENTS IN DROPDOWN:", options.map(o => o.text).join(", "));
          const matched = options.find(opt => opt.text.trim().toLowerCase() === text.toLowerCase());
          return matched ? matched.value : null;
        }, selectIng, item.name);

        if (!optVal) {
          throw new Error(`Ingredient ${item.name} not found in dropdown!`);
        }
        await selectIng.select(optVal);
        await page.evaluate(sel => sel.dispatchEvent(new Event("change", { bubbles: true })), selectIng);
        await new Promise(r => setTimeout(r, 300));

        // Type quantity
        await qtyInput.click({ clickCount: 3 });
        await qtyInput.press("Backspace");
        await qtyInput.type(item.qty, { delay: 10 });

        // Select unit
        await selectUnit.select(item.unit);
        await page.evaluate(sel => sel.dispatchEvent(new Event("change", { bubbles: true })), selectUnit);
        await new Promise(r => setTimeout(r, 300));
      }

      // Wait for debounced live cost preview
      await new Promise(r => setTimeout(r, 2000));

      const sanitizedName = recipe.name.toLowerCase().replace(/\s+/g, "_");
      const screenshotPath = path.join(outputDir, `recipe_${sanitizedName}_preview.png`);
      await page.screenshot({ path: screenshotPath });
      console.log(`Captured screenshot for ${recipe.name} at: ${screenshotPath}`);

      // Finalize recipe to save it
      let clickedFinalize = false;
      const finalizeButtons = await page.$$("button");
      let finalizeBtn = null;
      for (const btn of finalizeButtons) {
        const text = await page.evaluate(el => el.textContent, btn);
        if (text.includes("Finalize Recipe") || text.includes("Commit Changes")) {
          finalizeBtn = btn;
          clickedFinalize = true;
          break;
        }
      }
      if (!clickedFinalize) throw new Error("Could not find Finalize Recipe button");
      
      await Promise.all([
        page.waitForResponse(res => res.url().includes('/api/recipes') && ['POST', 'PUT'].includes(res.request().method())),
        finalizeBtn.click()
      ]);
      await new Promise(r => setTimeout(r, 1000));
      console.log(`Recipe ${recipe.name} finalized and saved successfully!`);
    }

    console.log("\nAll ingredients and recipes created and visually captured!");

  } catch (err) {
    console.error("Automation error:", err);
  } finally {
    await browser.close();
    console.log("Puppeteer closed.");
  }
}

run();
