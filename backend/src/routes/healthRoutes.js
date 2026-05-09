import { Router } from "express";
import { env } from "../config/env.js";
import { pool } from "../config/db.js";

const router = Router();

router.get("/", (_req, res) => {
  res.json({
    success: true,
    message: "Smart Food Costing API is running",
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv
  });
});

router.get("/db", async (_req, res) => {
  try {
    const result = await pool.query("SELECT 1 AS ok");
    res.json({ success: true, database: "connected", postgres: result.rows[0].ok === 1 });
  } catch (error) {
    res.status(503).json({ success: false, database: "disconnected", error: error.message });
  }
});

router.get("/supabase", async (_req, res) => {
  try {
    const response = await fetch(`${env.supabaseUrl}/auth/v1/user`, {
      headers: {
        apikey: env.supabaseAnonKey,
        Authorization: `Bearer ${env.supabaseAnonKey}`
      }
    });
    const status = response.ok ? "reachable" : "auth_error";
    res.json({ success: response.ok, supabase: status, statusCode: response.status });
  } catch (error) {
    res.status(503).json({ success: false, supabase: "unreachable", error: error.message });
  }
});

export default router;
