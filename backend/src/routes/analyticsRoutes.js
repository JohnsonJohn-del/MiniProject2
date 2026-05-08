import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getClientAnalytics } from "../controllers/analyticsController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/client", asyncHandler(getClientAnalytics));

export default router;
