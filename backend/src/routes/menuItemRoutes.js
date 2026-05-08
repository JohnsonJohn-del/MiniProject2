import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { requirePlanFeature } from "../middleware/subscriptionMiddleware.js";
import {
  createMenuItem,
  deleteMenuItem,
  listMenuItems,
  updateMenuItem
} from "../controllers/menuItemController.js";

const router = Router();

router.use(asyncHandler(requireAuth));
router.use(asyncHandler(requirePlanFeature("operationalCosting")));

router.get("/", asyncHandler(listMenuItems));
router.post("/", asyncHandler(createMenuItem));
router.put("/:id", asyncHandler(updateMenuItem));
router.delete("/:id", asyncHandler(deleteMenuItem));

export default router;
