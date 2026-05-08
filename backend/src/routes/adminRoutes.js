import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import {
  getAdminOverview,
  listAdminAiUsage,
  listEntityRecords,
  listUsers,
  resetUserAiUsage,
  updateUserActiveStatus,
  updateUserPlan
} from "../controllers/adminController.js";

const router = Router();

router.use(asyncHandler(requireAuth));
router.use(asyncHandler(requireRole("admin")));

router.get("/overview", asyncHandler(getAdminOverview));
router.get("/users", asyncHandler(listUsers));
router.patch("/users/:userId/plan", asyncHandler(updateUserPlan));
router.patch("/users/:userId/active", asyncHandler(updateUserActiveStatus));
router.post("/users/:userId/reset-ai", asyncHandler(resetUserAiUsage));
router.get("/ai-usage", asyncHandler(listAdminAiUsage));
router.get("/records/:entity", asyncHandler(listEntityRecords));

export default router;
