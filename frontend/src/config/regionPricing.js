export const STORAGE_REGION_KEY = "sfca_region";

export const REGIONS = {
  IN: {
    code: "IN",
    label: "India",
    currency: "INR",
    locale: "en-IN",
    flag: "IN",
    rateFromUsd: 83,
    planPrices: { free: 0, pro: 999, premium: 2499 }
  },
  US: {
    code: "US",
    label: "United States",
    currency: "USD",
    locale: "en-US",
    flag: "US",
    rateFromUsd: 1,
    planPrices: { free: 0, pro: 39, premium: 99 }
  },
  EU: {
    code: "EU",
    label: "Europe",
    currency: "EUR",
    locale: "en-IE",
    flag: "EU",
    rateFromUsd: 0.92,
    planPrices: { free: 0, pro: 35, premium: 89 }
  },
  GB: {
    code: "GB",
    label: "United Kingdom",
    currency: "GBP",
    locale: "en-GB",
    flag: "GB",
    rateFromUsd: 0.79,
    planPrices: { free: 0, pro: 31, premium: 79 }
  }
};

export const REGION_OPTIONS = [REGIONS.IN, REGIONS.US, REGIONS.EU, REGIONS.GB];

const EU_COUNTRY_CODES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE"
]);

export function detectRegion() {
  if (typeof window === "undefined") return "US";

  const stored = window.localStorage.getItem(STORAGE_REGION_KEY);
  if (stored && REGIONS[stored]) return stored;

  const locales = Array.isArray(window.navigator.languages) && window.navigator.languages.length
    ? window.navigator.languages
    : [window.navigator.language || "en-US"];

  for (const rawLocale of locales) {
    const locale = String(rawLocale || "").trim();
    const parts = locale.split("-");
    const country = (parts[1] || "").toUpperCase();

    if (country === "IN") return "IN";
    if (country === "US") return "US";
    if (country === "GB") return "GB";
    if (EU_COUNTRY_CODES.has(country)) return "EU";
  }

  return "US";
}

export function formatCurrencyFromUsd(amount, regionCode = "US") {
  const region = REGIONS[regionCode] || REGIONS.US;
  const converted = Number(amount || 0) * region.rateFromUsd;

  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 2
  }).format(converted);
}

export function formatCurrencyNative(amount, regionCode = "US") {
  const region = REGIONS[regionCode] || REGIONS.US;
  return new Intl.NumberFormat(region.locale, {
    style: "currency",
    currency: region.currency,
    maximumFractionDigits: 2
  }).format(Number(amount || 0));
}
