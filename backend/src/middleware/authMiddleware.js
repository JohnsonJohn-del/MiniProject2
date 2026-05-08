import { query } from "../config/db.js";
import { verifyToken } from "../utils/jwt.js";
import { AppError } from "../utils/appError.js";

export async function requireAuth(req, _res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next(new AppError("Authentication required", 401));
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    const result = await query(
      "SELECT id, email, role, subscription_plan, is_active FROM users WHERE id = $1",
      [decoded.userId]
    );

    if (!result.rows[0] || !result.rows[0].is_active) {
      return next(new AppError("User not found or inactive", 401));
    }

    req.user = result.rows[0];
    next();
  } catch {
    return next(new AppError("Invalid or expired token", 401));
  }
}
