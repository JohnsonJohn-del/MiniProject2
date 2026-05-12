import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { mockCheckout, mockSuccess, mockFailure } from "../controllers/paymentController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.post("/mock-checkout", asyncHandler(mockCheckout));
router.post("/mock-success", asyncHandler(mockSuccess));
router.post("/mock-failure", asyncHandler(mockFailure));

export default router;
