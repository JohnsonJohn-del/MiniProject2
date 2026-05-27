/**
 * Strictly normalizes quantities between standardized units: kg, g, l, ml.
 * Throws an error if units are incompatible (e.g. converting kg to ml).
 */
export function normalizeQuantity(quantity, fromUnit, toUnit) {
  const from = (fromUnit || "").toLowerCase().trim();
  const to = (toUnit || "").toLowerCase().trim();

  if (!from || !to || from === to) {
    return Number(quantity);
  }

  const weightUnits = ["kg", "g"];
  const volumeUnits = ["l", "ml"];

  const isFromWeight = weightUnits.includes(from);
  const isToWeight = weightUnits.includes(to);
  const isFromVolume = volumeUnits.includes(from);
  const isToVolume = volumeUnits.includes(to);

  if ((isFromWeight && isToVolume) || (isFromVolume && isToWeight)) {
    throw new Error(`Incompatible unit types: cannot convert from '${fromUnit}' to '${toUnit}'`);
  }

  if (!isFromWeight && !isFromVolume) {
    throw new Error(`Unsupported from unit: '${fromUnit}'`);
  }
  if (!isToWeight && !isToVolume) {
    throw new Error(`Unsupported to unit: '${toUnit}'`);
  }

  // Standardize weight to Grams
  let grams = null;
  if (from === "kg") grams = quantity * 1000;
  else if (from === "g") grams = quantity;

  // Standardize volume to Milliliters
  let ml = null;
  if (from === "l") ml = quantity * 1000;
  else if (from === "ml") ml = quantity;

  // Conversion for Weight
  if (grams !== null) {
    if (to === "kg") return grams / 1000;
    if (to === "g") return grams;
  }

  // Conversion for Volume
  if (ml !== null) {
    if (to === "l") return ml / 1000;
    if (to === "ml") return ml;
  }

  return Number(quantity);
}
