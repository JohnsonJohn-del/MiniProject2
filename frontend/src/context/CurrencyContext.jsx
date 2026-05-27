import { createContext, useMemo, useState } from "react";
import {
  detectRegion,
  formatCurrencyFromUsd,
  formatCurrencyNative,
  REGIONS,
  REGION_OPTIONS,
  STORAGE_REGION_KEY
} from "../config/regionPricing";

// Exported from a separate non-JSX reference if needed
export const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [regionCode, setRegionCode] = useState(() => detectRegion());

  const setRegion = (code) => {
    const next = REGIONS[code] ? code : "IN";
    setRegionCode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_REGION_KEY, next);
    }
  };

  const value = useMemo(() => {
    const region = REGIONS[regionCode] || REGIONS.IN;
    return {
      regionCode,
      region,
      regionOptions: REGION_OPTIONS,
      setRegion,
      // All values are already in INR — just format, never convert
      formatUsd(amount) {
        return formatCurrencyFromUsd(amount, regionCode);
      },
      formatNative(amount) {
        return formatCurrencyNative(amount, regionCode);
      },
      convertUsd(amount) {
        return Number(amount || 0); // No-op: values are already in INR
      }
    };
  }, [regionCode]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
