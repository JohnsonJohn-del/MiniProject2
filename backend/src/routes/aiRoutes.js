import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { enforceAiRequestLimit, requirePlanFeature } from "../middleware/subscriptionMiddleware.js";
import { getAiPricingAdvice, listMyAiUsageLogs } from "../controllers/aiController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.post(
  "/pricing-advice",
  asyncHandler(requirePlanFeature("aiPricingSuggestions")),
  asyncHandler(enforceAiRequestLimit),
  asyncHandler(getAiPricingAdvice)
);
router.get("/usage", asyncHandler(listMyAiUsageLogs));

export default router;
