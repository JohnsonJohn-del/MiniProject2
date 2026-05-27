export const STORAGE_REGION_KEY = "sfca_region";

export const REGIONS = {
  IN: {
    code: "IN",
    label: "India",
    currency: "INR",
    locale: "en-IN",
    flag: "IN",
    rateFromUsd: 1
  }
};

export const REGION_OPTIONS = [REGIONS.IN];

export function detectRegion() {
  return "IN";
}

// All amounts are in INR — format only
export function formatCurrencyFromUsd(amount, _regionCode = "IN") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
}

export function formatCurrencyNative(amount, _regionCode = "IN") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
}
