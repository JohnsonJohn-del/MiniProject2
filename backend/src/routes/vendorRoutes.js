import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { createVendor, deleteVendor, listVendors, updateVendor } from "../controllers/vendorController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listVendors));
router.post("/", asyncHandler(createVendor));
router.put("/:id", asyncHandler(updateVendor));
router.delete("/:id", asyncHandler(deleteVendor));

export default router;
