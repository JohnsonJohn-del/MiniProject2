import { Router } from "express";
import multer from "multer";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  parseBill,
  parseRecipe,
  saveBillImport,
  saveRecipeImport,
  uploadBill,
  uploadRecipeImage,
  listPurchases
} from "../controllers/importController.js";

const router = Router();
const upload = multer({ dest: "uploads/" });

router.use(asyncHandler(requireAuth));

router.post("/upload-bill", upload.single("image"), asyncHandler(uploadBill));
router.post("/upload-recipe-image", upload.single("image"), asyncHandler(uploadRecipeImage));
router.post("/parse-bill", asyncHandler(parseBill));
router.post("/save-bill", asyncHandler(saveBillImport));
router.post("/parse-recipe", asyncHandler(parseRecipe));
router.post("/save-recipe", asyncHandler(saveRecipeImport));
router.get("/purchases", asyncHandler(listPurchases));

export default router;
