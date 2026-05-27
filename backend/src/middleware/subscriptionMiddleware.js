// Deprecated: Subscription system removed. All features are now free.
export async function enforceRecipeLimit(req, _res, next) {
  next();
}

export function requirePlanFeature(_featureKey) {
  return async (req, _res, next) => {
    next();
  };
}

export async function enforceAiRequestLimit(req, _res, next) {
  next();
}
