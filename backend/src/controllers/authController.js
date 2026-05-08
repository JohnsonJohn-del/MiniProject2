import bcrypt from "bcryptjs";
import { z } from "zod";
import { query } from "../config/db.js";
import { AppError } from "../utils/appError.js";
import { signToken } from "../utils/jwt.js";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("Invalid registration payload", 400);
  }

  const { name, email, password } = parsed.data;

  const existing = await query("SELECT id FROM users WHERE email = $1", [email]);
  if (existing.rows[0]) throw new AppError("Email already registered", 409);

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await query(
    `INSERT INTO users (name, email, password_hash, role, subscription_plan)
     VALUES ($1, $2, $3, 'client', 'free')
     RETURNING id, name, email, role, subscription_plan`,
    [name, email, passwordHash]
  );

  const user = result.rows[0];
  const token = signToken({ userId: user.id, role: user.role });

  res.status(201).json({ success: true, token, user });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError("Invalid login payload", 400);
  }

  const { email, password } = parsed.data;
  const result = await query(
    "SELECT id, name, email, role, subscription_plan, is_active, password_hash FROM users WHERE email = $1",
    [email]
  );

  const user = result.rows[0];
  if (!user || !user.is_active) throw new AppError("Invalid credentials", 401);

  const isValid = await bcrypt.compare(password, user.password_hash);
  if (!isValid) throw new AppError("Invalid credentials", 401);

  const token = signToken({ userId: user.id, role: user.role });

  res.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscription_plan: user.subscription_plan
    }
  });
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}
