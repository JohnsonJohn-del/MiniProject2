import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

if (!env.databaseUrl) {
  console.warn("DATABASE_URL is not set. Database operations will fail until configured.");
}

export const pool = new Pool({
  connectionString: env.databaseUrl,
  ssl: env.databaseUrl?.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : false
});

export async function query(text, params = []) {
  return pool.query(text, params);
}
