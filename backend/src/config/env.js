import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "dev-secret",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  openAiApiKey: process.env.OPENAI_API_KEY,
  openAiModel: process.env.OPENAI_MODEL || "gpt-4o-mini",
  supabaseUrl: process.env.SUPABASE_URL || "https://qqfgolwjuqjvqcmcweua.supabase.co",
  supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFxZmdvbHdqdXFqdnFjbWN3ZXVhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNzA5MjcsImV4cCI6MjA5Mzg0NjkyN30.CzVyo2fXePgy_7lSBUDDoIgXs09kshib5c1k78RjxhQ",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
};
