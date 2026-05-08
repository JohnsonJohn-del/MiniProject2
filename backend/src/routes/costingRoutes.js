import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePlanFeature } from "../middleware/subscriptionMiddleware.js";
import { getRecipeCostBreakdown } from "../controllers/costingController.js";

const router = Router();

router.use(asyncHandler(requireAuth));
router.use(asyncHandler(requirePlanFeature("operationalCosting")));

router.get("/recipes/:recipeId", asyncHandler(getRecipeCostBreakdown));

export default router;
