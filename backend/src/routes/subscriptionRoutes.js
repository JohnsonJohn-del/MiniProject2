import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getCurrentSubscription } from "../controllers/subscriptionController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/me", asyncHandler(getCurrentSubscription));

export default router;
