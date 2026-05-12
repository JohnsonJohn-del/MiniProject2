import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  getPriceHistory,
  getPriceTrends,
  getAiInsights,
  recordIngredientPrice
} from "../controllers/insightController.js";

const router = Router();
router.use(asyncHandler(requireAuth));

router.get("/price-history", asyncHandler(getPriceHistory));
router.get("/price-trends", asyncHandler(getPriceTrends));
router.get("/ai-insights", asyncHandler(getAiInsights));
router.post("/record-price", asyncHandler(recordIngredientPrice));

export default router;
