import { AppError } from "../utils/appError.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal server error"
  });
}
