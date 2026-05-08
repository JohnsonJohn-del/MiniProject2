import { AppError } from "../utils/appError.js";
import {
  getPlanConfig,
  getTodayAiRequests,
  getUserSubscriptionUsage
} from "../services/subscriptionService.js";

export async function enforceRecipeLimit(req, _res, next) {
  if (req.user.role === "admin") return next();

  const usage = await getUserSubscriptionUsage(req.user.id);
  const plan = getPlanConfig(usage.subscription_plan);

  if (usage.recipes_created >= plan.maxRecipes) {
    return next(
      new AppError(
        `Recipe limit reached for ${plan.key} plan. Upgrade subscription to add more recipes.`,
        403
      )
    );
  }

  next();
}

export function requirePlanFeature(featureKey) {
  return async (req, _res, next) => {
    if (req.user.role === "admin") return next();

    const usage = await getUserSubscriptionUsage(req.user.id);
    const plan = getPlanConfig(usage.subscription_plan);

    if (!plan.features[featureKey]) {
      return next(new AppError(`Feature unavailable on ${plan.key} plan. Please upgrade.`, 403));
    }
    next();
  };
}

export async function enforceAiRequestLimit(req, _res, next) {
  if (req.user.role === "admin") return next();

  const usage = await getUserSubscriptionUsage(req.user.id);
  const plan = getPlanConfig(usage.subscription_plan);
  const todayUsage = await getTodayAiRequests(req.user.id);

  if (todayUsage >= plan.aiRequestsPerDay) {
    return next(new AppError(`Daily AI request quota reached for ${plan.key} plan.`, 403));
  }

  req.subscription = {
    ...usage,
    plan,
    todayAiUsage: todayUsage
  };

  next();
}
