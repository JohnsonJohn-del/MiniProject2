import { normalizeQuantity } from "../src/utils/unitConverter.js";

function runTests() {
  console.log("Starting unit converter and costing tests...\n");

  const testCases = [
    // Weight conversions
    { quantity: 1, from: "kg", to: "g", expected: 1000 },
    { quantity: 500, from: "g", to: "kg", expected: 0.5 },
    { quantity: 2.5, from: "kg", to: "kg", expected: 2.5 },
    { quantity: 10, from: "g", to: "g", expected: 10 },

    // Volume conversions
    { quantity: 1, from: "l", to: "ml", expected: 1000 },
    { quantity: 250, from: "ml", to: "l", expected: 0.25 },
    { quantity: 1.5, from: "l", to: "l", expected: 1.5 },
    { quantity: 50, from: "ml", to: "ml", expected: 50 }
  ];

  let passed = 0;
  let failed = 0;

  for (const tc of testCases) {
    try {
      const result = normalizeQuantity(tc.quantity, tc.from, tc.to);
      if (Math.abs(result - tc.expected) < 1e-9) {
        console.log(`✅ PASSED: convert ${tc.quantity} ${tc.from} to ${tc.to} = ${result}`);
        passed++;
      } else {
        console.error(`❌ FAILED: convert ${tc.quantity} ${tc.from} to ${tc.to}. Expected ${tc.expected}, got ${result}`);
        failed++;
      }
    } catch (err) {
      console.error(`❌ FAILED: convert ${tc.quantity} ${tc.from} to ${tc.to}. Threw error: ${err.message}`);
      failed++;
    }
  }

  // Test error throwing for incompatible units
  try {
    normalizeQuantity(100, "kg", "ml");
    console.error("❌ FAILED: Converting kg to ml should have thrown an error but succeeded.");
    failed++;
  } catch (err) {
    console.log("✅ PASSED: Converting kg to ml correctly threw error: " + err.message);
    passed++;
  }

  try {
    normalizeQuantity(50, "l", "g");
    console.error("❌ FAILED: Converting l to g should have thrown an error but succeeded.");
    failed++;
  } catch (err) {
    console.log("✅ PASSED: Converting l to g correctly threw error: " + err.message);
    passed++;
  }

  // Test casing and whitespace trimming
  try {
    const result = normalizeQuantity(2, " Kg  ", "  g ");
    if (result === 2000) {
      console.log("✅ PASSED: Standardizing whitespace and case-insensitive matching works (2 Kg -> g = 2000)");
      passed++;
    } else {
      console.error(`❌ FAILED: Standardizing casing/whitespace failed. Expected 2000, got ${result}`);
      failed++;
    }
  } catch (err) {
    console.error(`❌ FAILED: Whitespace/case test threw error: ${err.message}`);
    failed++;
  }

  // Test mock recipe cost calculations
  console.log("\nTesting recipe cost logic simulation...");
  // Let's mock a recipe ingredients list:
  // 1. Butter: 20g, base unit = kg, price = 620 rs per kg
  // 2. Milk: 250ml, base unit = l, price = 60 rs per l
  const recipeItems = [
    { name: "Butter", qty: 20, unit: "g", baseUnit: "kg", pricePerUnit: 620 },
    { name: "Milk", qty: 250, unit: "ml", baseUnit: "l", pricePerUnit: 60 }
  ];

  let calculatedTotal = 0;
  recipeItems.forEach(item => {
    const normQty = normalizeQuantity(item.qty, item.unit, item.baseUnit);
    const itemCost = normQty * item.pricePerUnit;
    calculatedTotal += itemCost;
    console.log(`  - ${item.name}: ${item.qty} ${item.unit} @ ${item.pricePerUnit}/${item.baseUnit} = ₹${itemCost.toFixed(2)} (normalized qty: ${normQty})`);
  });

  const expectedTotal = (20 / 1000) * 620 + (250 / 1000) * 60; // 0.02 * 620 (12.40) + 0.25 * 60 (15.00) = 27.40
  if (Math.abs(calculatedTotal - expectedTotal) < 1e-9) {
    console.log(`✅ PASSED: Calculated recipe cost ₹${calculatedTotal.toFixed(2)} matches expected ₹${expectedTotal.toFixed(2)}`);
    passed++;
  } else {
    console.error(`❌ FAILED: Calculated recipe cost ₹${calculatedTotal.toFixed(2)} does not match expected ₹${expectedTotal.toFixed(2)}`);
    failed++;
  }

  console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests();
