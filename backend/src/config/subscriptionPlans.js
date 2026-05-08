export const SUBSCRIPTION_PLANS = {
  free: {
    key: "free",
    maxRecipes: 3,
    aiRequestsPerDay: 5,
    features: {
      operationalCosting: false,
      aiPricingSuggestions: false,
      fullAnalytics: false,
      aiReports: false
    }
  },
  pro: {
    key: "pro",
    maxRecipes: 20,
    aiRequestsPerDay: 30,
    features: {
      operationalCosting: true,
      aiPricingSuggestions: true,
      fullAnalytics: false,
      aiReports: false
    }
  },
  premium: {
    key: "premium",
    maxRecipes: Infinity,
    aiRequestsPerDay: Infinity,
    features: {
      operationalCosting: true,
      aiPricingSuggestions: true,
      fullAnalytics: true,
      aiReports: true
    }
  }
};
