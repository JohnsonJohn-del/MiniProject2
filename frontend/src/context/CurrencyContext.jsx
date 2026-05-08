import { createContext, useMemo, useState } from "react";
import {
  detectRegion,
  formatCurrencyFromUsd,
  formatCurrencyNative,
  REGIONS,
  REGION_OPTIONS,
  STORAGE_REGION_KEY
} from "../config/regionPricing";

export const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [regionCode, setRegionCode] = useState(() => detectRegion());

  const setRegion = (code) => {
    const next = REGIONS[code] ? code : "US";
    setRegionCode(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_REGION_KEY, next);
    }
  };

  const value = useMemo(() => {
    const region = REGIONS[regionCode] || REGIONS.US;
    return {
      regionCode,
      region,
      regionOptions: REGION_OPTIONS,
      setRegion,
      formatUsd(amount) {
        return formatCurrencyFromUsd(amount, regionCode);
      },
      formatNative(amount) {
        return formatCurrencyNative(amount, regionCode);
      },
      convertUsd(amount) {
        return Number(amount || 0) * region.rateFromUsd;
      }
    };
  }, [regionCode]);

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}
