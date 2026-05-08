import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  createRecipe,
  deleteRecipe,
  getRecipeById,
  listRecipes,
  updateRecipe
} from "../controllers/recipeController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listRecipes));
router.get("/:id", asyncHandler(getRecipeById));
router.post("/", asyncHandler(createRecipe));
router.put("/:id", asyncHandler(updateRecipe));
router.delete("/:id", asyncHandler(deleteRecipe));

export default router;
