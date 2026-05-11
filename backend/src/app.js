import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import healthRoutes from "./routes/healthRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import vendorRoutes from "./routes/vendorRoutes.js";
import ingredientRoutes from "./routes/ingredientRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import operationalExpenseRoutes from "./routes/operationalExpenseRoutes.js";
import menuItemRoutes from "./routes/menuItemRoutes.js";
import costingRoutes from "./routes/costingRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import importRoutes from "./routes/importRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorMiddleware.js";

const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/vendors", vendorRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/operational-expenses", operationalExpenseRoutes);
app.use("/api/menu-items", menuItemRoutes);
app.use("/api/costing", costingRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/import", importRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
