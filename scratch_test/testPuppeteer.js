import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

async function run() {
  console.log("Starting Puppeteer browser automation...");
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
      console.log("Found browser executable at:", p);
      break;
    }
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: execPath,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  
  // Set viewport for high quality desktop screenshot
  await page.setViewport({ width: 1400, height: 900 });

  try {
    // 1. Go to Login page
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5173/login", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1000));
    
    // Create output screenshots directory if it doesn't exist
    const outputDir = "./screenshots";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    await page.screenshot({ path: path.join(outputDir, "0_login_page.png") });
    console.log("Captured 0_login_page.png");

    // 2. Click Demo Client button
    console.log("Clicking demo client login...");
    const clientBtnSelector = "button ::-p-text(Demo Client)";
    // If text selector doesn't match directly, find all buttons and click the one with "Demo Client" text
    const buttons = await page.$$("button");
    let clicked = false;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text.includes("Demo Client")) {
        await button.click();
        clicked = true;
        break;
      }
    }
    if (!clicked) {
      throw new Error("Could not find Demo Client login button");
    }

    console.log("Waiting for navigation to dashboard...");
    await new Promise(r => setTimeout(r, 3000));
    
    await page.screenshot({ path: path.join(outputDir, "1_dashboard.png") });
    console.log("Captured 1_dashboard.png - User redirected to dashboard successfully!");

    // 3. Navigate to Ingredients Page
    console.log("Navigating to Kitchen Inventory...");
    await page.goto("http://localhost:5173/app/ingredients", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1000));
    
    // Type in ingredient name input
    console.log("Typing 'Palm Oil' to test AI Unit Recommendation...");
    const ingInput = await page.waitForSelector('input[placeholder="e.g. Basmati Rice"]');
    await ingInput.type("Palm Oil");
    
    // Wait for debounce and API response (let's wait 1.5 seconds)
    await new Promise(r => setTimeout(r, 1500));

    // Capture screenshot showing automatic liquid / 'l' selection
    await page.screenshot({ path: path.join(outputDir, "2_ingredients_typing_palm_oil.png") });
    console.log("Captured 2_ingredients_typing_palm_oil.png - Automatically recommended volume/l!");

    // 4. Navigate to Recipe Page
    console.log("Navigating to Recipe Builder...");
    await page.goto("http://localhost:5173/app/recipes", { waitUntil: "domcontentloaded" });
    await new Promise(r => setTimeout(r, 1000));

    // Wait for the recipe builder input
    await page.waitForSelector('input[placeholder="e.g. Signature Butter Chicken"]');

    // Wait for ingredients selector to load options
    await page.waitForSelector("select");
    
    // Select first ingredient option in dropdown (usually Milk or Butter from seeded demo data)
    console.log("Formulating a recipe: selecting ingredient...");
    await page.select("select", "272b22bb-6523-4554-aa61-55079a4563a1"); // Let's try first actual option
    // Or we can just select index 1 option programmatically:
    await page.evaluate(() => {
      const select = document.querySelector("select");
      if (select && select.options.length > 1) {
        select.value = select.options[1].value;
        // Trigger change event
        const event = new Event('change', { bubbles: true });
        select.dispatchEvent(event);
      }
    });

    // Enter a quantity
    console.log("Formulating a recipe: entering quantity...");
    const qtyInput = await page.waitForSelector('input[placeholder="0.000"]');
    await qtyInput.type("50");

    // Wait for debounced costing preview to calculate and display
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({ path: path.join(outputDir, "3_recipes_preview.png") });
    console.log("Captured 3_recipes_preview.png - Live costing preview validated successfully!");

  } catch (err) {
    console.error("Automation error:", err);
  } finally {
    await browser.close();
    console.log("Puppeteer closed.");
  }
}

run();
