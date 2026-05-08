import { AppError } from "../utils/appError.js";

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError("Forbidden: insufficient role", 403));
    }
    next();
  };
}
