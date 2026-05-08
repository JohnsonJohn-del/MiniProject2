import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createIngredient,
  deleteIngredient,
  listIngredients,
  updateIngredient
} from "../controllers/ingredientController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listIngredients));
router.post("/", asyncHandler(createIngredient));
router.put("/:id", asyncHandler(updateIngredient));
router.delete("/:id", asyncHandler(deleteIngredient));

export default router;
