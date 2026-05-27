import express from "express";
import { getEngineeringData } from "../controllers/engineeringController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const router = express.Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(getEngineeringData));

export default router;
