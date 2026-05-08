import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import {
  deleteOperationalExpense,
  listOperationalExpenses,
  upsertOperationalExpense
} from "../controllers/operationalExpenseController.js";

const router = Router();

router.use(asyncHandler(requireAuth));

router.get("/", asyncHandler(listOperationalExpenses));
router.post("/", asyncHandler(upsertOperationalExpense));
router.delete("/:id", asyncHandler(deleteOperationalExpense));

export default router;
