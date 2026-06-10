import puppeteer from "puppeteer";
import fs from "fs";

async function run() {
  console.log("Starting E2E Packaging & Profile Test...");
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

  const outputDir = "./screenshots";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  page.on("console", msg => {
    console.log(`[PAGE LOG][${msg.type().toUpperCase()}] ${msg.text()}`);
  });
  page.on("pageerror", err => console.error(`[PAGE ERROR] ${err.message}`));
  page.on("request", request => {
    const url = request.url();
    if (url.includes("supabase.co")) {
      console.log(`[NET REQ] ${request.method()} ${url}`);
    }
  });
  page.on("response", response => {
    const url = response.url();
    const status = response.status();
    if (url.includes("supabase.co")) {
      console.log(`[NET RES] ${status} ${url}`);
    } else if (url.includes("localhost") && status >= 400) {
      console.log(`[NET RES ERROR] ${status} ${url}`);
    }
  });
  page.on("requestfailed", request => {
    const url = request.url();
    console.log(`[NET FAIL] ${url} - ${request.failure()?.errorText || "Unknown error"}`);
  });

  try {
    // 1. Login
    console.log("Navigating to login page...");
    await page.goto("http://localhost:5173/login", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1000));

    console.log("Clicking Demo Client login button...");
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
    
    console.log("Waiting for navigation to dashboard...");
    await page.waitForNavigation({ waitUntil: "networkidle0" });
    console.log("Dashboard loaded. URL is:", page.url());

    // 2. Navigate to Profile Page
    console.log("Navigating to Profile Settings page...");
    await page.goto("http://localhost:5173/app/profile", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 1500));
    console.log("Profile page loaded. URL is:", page.url());

    // 3. Edit name
    console.log("Updating name in profile settings...");
    const nameInput = await page.waitForSelector('input[name="name"]');
    
    // Clear and type new values
    await nameInput.click({ clickCount: 3 });
    await nameInput.press("Backspace");
    await nameInput.type("Demo Client Pro", { delay: 50 });

    // Save profile settings
    const saveBtn = await page.evaluateHandle(() => {
      return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Save Profile Settings"));
    });
    
    if (saveBtn) {
      console.log("Clicking Save Profile Settings...");
      await saveBtn.click();
    } else {
      throw new Error("Save Profile Settings button not found");
    }

    await new Promise(r => setTimeout(r, 3000));
    console.log("Profile updated.");

    // 4. Navigate to Operational Costing Page
    console.log("Navigating to Operational Costs page...");
    await page.goto("http://localhost:5173/app/operational-costs", { waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 2000));

    // Get recipes in the dropdown
    console.log("Getting recipes list...");
    const recipeOptions = await page.evaluate(() => {
      const select = document.querySelector('select');
      return Array.from(select ? select.options : []).map(o => ({ text: o.text, value: o.value }));
    });
    console.log("Available recipes:", recipeOptions);

    if (recipeOptions.length <= 1) {
      console.log("No recipes found to test costing preview. Creating a dummy ingredient & recipe first...");
      // Let's create an ingredient and recipe
      await page.goto("http://localhost:5173/app/ingredients", { waitUntil: "networkidle0" });
      
      const ingNameInput = await page.waitForSelector('input[placeholder="e.g. Basmati Rice"]');
      await ingNameInput.type("Coffee Powder", { delay: 50 });
      
      const priceInput = await page.waitForSelector('input[placeholder="0.00"]');
      await priceInput.type("1200", { delay: 50 });

      const createIngBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Create Ingredient"));
      });
      await createIngBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log("Ingredient created.");

      // Go to recipes to create a recipe
      await page.goto("http://localhost:5173/app/recipes", { waitUntil: "networkidle0" });
      const dishInput = await page.waitForSelector('input[placeholder="e.g. Signature Butter Chicken"]');
      await dishInput.type("Cold Coffee", { delay: 50 });

      // Select Coffee Powder
      const selectIng = await page.$("select");
      const optVal = await page.evaluate((sel) => {
        const options = Array.from(sel.options);
        const matched = options.find(o => o.text.includes("Coffee Powder"));
        return matched ? matched.value : null;
      }, selectIng);
      await selectIng.select(optVal);

      const qtyInput = await page.$('input[type="number"]');
      await qtyInput.type("12", { delay: 50 });

      const finalizeBtn = await page.evaluateHandle(() => {
        return Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes("Finalize Recipe"));
      });
      await finalizeBtn.click();
      await new Promise(r => setTimeout(r, 2000));
      console.log("Recipe created.");

      // Go back to Operational Costs page
      await page.goto("http://localhost:5173/app/operational-costs", { waitUntil: "networkidle0" });
      await new Promise(r => setTimeout(r, 2000));
    }

    // Select first recipe in dropdown
    console.log("Selecting recipe in simulator dropdown...");
    const select = await page.waitForSelector('select');
    const latestOptions = await page.evaluate(() => {
      const sel = document.querySelector('select');
      return Array.from(sel ? sel.options : []).map(o => ({ text: o.text, value: o.value }));
    });
    console.log("Latest recipes in simulator dropdown:", latestOptions);

    const targetRecipe = latestOptions.find(o => o.value !== "");
    if (!targetRecipe) {
      throw new Error("No recipe option found in simulator dropdown");
    }

    console.log("Selecting target recipe:", targetRecipe.text);
    await select.select(targetRecipe.value);
    await page.evaluate(s => s.dispatchEvent(new Event("change", { bubbles: true })), select);

    await new Promise(r => setTimeout(r, 2000));

    // Verify packaging cost
    const currentPkgVal = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      // The packaging cost input is inside column 1 breakdown
      const pkgInput = inputs.find(i => i.parentElement.classList.contains("relative") && i.previousElementSibling?.textContent === "₹");
      return pkgInput ? pkgInput.value : null;
    });

    console.log("Initial simulator Packaging Cost is:", currentPkgVal);

    // Edit packaging cost in simulator to 22.50
    console.log("Updating packaging cost in simulator to 22.50...");
    const pkgInput = await page.waitForSelector('#simulator_packaging_cost');
    await pkgInput.click({ clickCount: 3 });
    await pkgInput.press("Backspace");
    await pkgInput.type("22.50", { delay: 50 });

    // Click Save icon
    console.log("Clicking Save icon next to packaging cost...");
    await page.evaluate(() => {
      const btn = document.querySelector('#simulator_packaging_cost').parentElement.nextElementSibling;
      if (btn) {
        btn.click();
      } else {
        throw new Error("Save icon next to packaging cost not found inside page!");
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Refresh page
    console.log("Refreshing page to check 22.50 persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 2000));

    // Select recipe again
    console.log("Selecting recipe in simulator dropdown after refresh...");
    const selectAfterRefresh = await page.waitForSelector('select');
    const latestOptionsAfter = await page.evaluate(() => {
      const sel = document.querySelector('select');
      return Array.from(sel ? sel.options : []).map(o => ({ text: o.text, value: o.value }));
    });
    const targetRecipeAfter = latestOptionsAfter.find(o => o.value !== "");
    if (!targetRecipeAfter) {
      throw new Error("No recipe option found after refresh");
    }
    await selectAfterRefresh.select(targetRecipeAfter.value);
    await page.evaluate(s => s.dispatchEvent(new Event("change", { bubbles: true })), selectAfterRefresh);
    await new Promise(r => setTimeout(r, 2000));

    // Verify packaging cost is now 22.50
    const pkgValAfter = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      const pkgInput = inputs.find(i => i.parentElement.classList.contains("relative") && i.previousElementSibling?.textContent === "₹");
      return pkgInput ? pkgInput.value : null;
    });

    console.log("Costing preview Packaging Cost after reload is:", pkgValAfter);
    if (parseFloat(pkgValAfter) === 22.50) {
      console.log("✅ Success: Packaging cost set to 22.50 and persisted correctly!");
    } else {
      throw new Error("Failure: Packaging cost did not persist as 22.50. Got: " + pkgValAfter);
    }

    // Now update packaging cost in simulator to 18.00
    console.log("Updating packaging cost in simulator to 18.00...");
    const pkgInput2 = await page.waitForSelector('#simulator_packaging_cost');
    await pkgInput2.click({ clickCount: 3 });
    await pkgInput2.press("Backspace");
    await pkgInput2.type("18.00", { delay: 50 });

    // Click Save icon
    console.log("Clicking Save icon next to packaging cost...");
    await page.evaluate(() => {
      const btn = document.querySelector('#simulator_packaging_cost').parentElement.nextElementSibling;
      if (btn) {
        btn.click();
      } else {
        throw new Error("Save icon next to packaging cost not found inside page!");
      }
    });
    await new Promise(r => setTimeout(r, 2000));

    // Refresh page
    console.log("Refreshing page to check 18.00 persistence...");
    await page.reload({ waitUntil: "networkidle0" });
    await new Promise(r => setTimeout(r, 2000));

    // Select recipe again
    console.log("Selecting recipe in simulator dropdown after second refresh...");
    const selectAfterRefresh2 = await page.waitForSelector('select');
    await selectAfterRefresh2.select(targetRecipeAfter.value);
    await page.evaluate(s => s.dispatchEvent(new Event("change", { bubbles: true })), selectAfterRefresh2);
    await new Promise(r => setTimeout(r, 2000));

    // Verify packaging cost is now 18.00
    const pkgValAfter2 = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="number"]'));
      const pkgInput = inputs.find(i => i.parentElement.classList.contains("relative") && i.previousElementSibling?.textContent === "₹");
      return pkgInput ? pkgInput.value : null;
    });

    console.log("Costing preview Packaging Cost after second reload is:", pkgValAfter2);
    if (parseFloat(pkgValAfter2) === 18.00) {
      console.log("✅ Success: Packaging cost updated to 18.00 and persisted correctly!");
    } else {
      throw new Error("Failure: Packaging cost did not persist as 18.00. Got: " + pkgValAfter2);
    }

  } catch (err) {
    console.error("Test execution error:", err);
    try {
      const currentUrl = page.url();
      console.log("Timeout page URL was:", currentUrl);
      await page.screenshot({ path: "./screenshots/timeout_error.png" });
      console.log("Saved timeout screenshot to ./screenshots/timeout_error.png");
    } catch (sErr) {
      console.error("Failed to capture error details:", sErr);
    }
  } finally {
    await browser.close();
    console.log("Puppeteer closed.");
  }
}

run();
