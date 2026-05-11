import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { getProfile, upsertProfile } from "../controllers/profileController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(getProfile));
router.post("/", asyncHandler(upsertProfile));
router.put("/", asyncHandler(upsertProfile));

export default router;
