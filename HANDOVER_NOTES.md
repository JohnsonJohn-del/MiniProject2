# Handover Notes

> Collaboration document between Johnny Bhai and Athudon
>
> Smart Food Costing & AI Pricing Advisor — DUO MCA Final Year Project

---

## Current Working Module

**Ingredient CRUD Integration** — Johnny Bhai driving, Athudon supporting

### Status
🟡 **Blocked** — Database connection pending.

### What's Done
- ✅ Backend ingredient controller (`ingredientController.js`) — Full CRUD with Zod validation
- ✅ Backend vendor controller (`vendorController.js`) — Full CRUD with Zod validation
- ✅ Backend routes registered at `/api/ingredients` and `/api/vendors`
- ✅ Frontend `IngredientsPage.jsx` — Complete UI with forms, tables, loading states, empty states
- ✅ Frontend `api.js` — Axios service with Supabase token interceptor
- ✅ Auth middleware — Dual-path verification (Supabase token + local JWT)
- ✅ `@supabase/supabase-js` installed in backend

### What's Needed
- ❌ **Run schema SQL in Supabase Dashboard SQL Editor** (see below for SQL)
- ❌ Connect backend to Supabase using service_role key
- ❌ Test end-to-end CRUD flow

---

## Blockers

### 🚨 BLOCKER 1: Supabase Cloud PostgreSQL Unreachable
**Priority: HIGH** | **Owner: Athudon**

**Problem**: `db.qqfgolwjuqjvqcmcweua.supabase.co` only has AAAA (IPv6) record. This Windows environment has no IPv6 routing (`ENETUNREACH`). Supavisor connection pooler returns "Tenant not found" — likely needs enabling in dashboard.

**Workaround 1**: `@supabase/supabase-js` with service_role key works over HTTPS IPv4. Tables must exist first.

**Workaround 2**: Connection pooler at `aws-0-ap-south-1.pooler.supabase.com:6543` needs enabling in Supabase Dashboard > Database > Connection Pooling.

**Requires**: User action in Supabase Dashboard (either enable pooler or run schema SQL).

---

### 🚨 BLOCKER 2: SSH Remote Access (Resolved)
**Priority: LOW** | **Owner: Athudon**

**Problem**: Attempted to install OpenSSH Server for phone remote access. All admin-level operations blocked by UAC (user asleep, cannot accept dialog prompts).

**Status**: Not needed for now. Development continues on PC.

---

## Unfinished Features

| Feature | Status | Owner | Notes |
|---------|--------|-------|-------|
| Ingredient CRUD integration | 🟡 Blocked | Johnny | Needs Supabase tables created |
| Recipe CRUD frontend integration | ⬜ Not started | Johnny | Depends on ingredients working |
| Operational costing frontend | ⬜ Not started | Johnny | Depends on recipes |
| Vercel deployment | ⬜ Not started | Athudon | After frontend is complete |
| Supabase pooler configuration | 🟡 Blocked | Athudon | Needs dashboard access |
| Reinstall api-architect skill | ⬜ Not started | Athudon | Timed out previously |

---

## Important Warnings

### ⚠️ Environment Variables
- **Never commit `.env` files**. Protected by `.gitignore`.
- Backend needs: `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `OPENAI_API_KEY`
- Frontend needs: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`
- The frontend env var is `VITE_SUPABASE_ANON_KEY` (NOT `VITE_SUPABASE_PUBLISHABLE_KEY`)

### ⚠️ Demo Users
- `admin@demo.com` / `123456` — role: admin
- `client@demo.com` / `123456` — role: client
- These exist in Supabase Auth AND need to exist in the local `users` table
- Backend auto-creates users in local DB on first Supabase login

### ⚠️ Supabase Auth State
- Demo users were created via Admin API with `email_confirm: true`
- If users don't exist in Supabase Auth, they must be re-created via the seed script
- Supabase sessions persist in localStorage; clearing browser storage will log out

### ⚠️ Backend Auth Middleware
The `requireAuth` middleware uses a **dual verification strategy**:
1. First tries to verify as a local JWT token (for seeded demo users)
2. Falls back to verifying via Supabase `/auth/v1/user` API (for Supabase Auth users)
3. If both fail, returns 401

### ⚠️ Database Connection
- Current `DATABASE_URL` in `.env` points to `localhost:5432` (old Docker setup)
- When switching to Supabase, update to: `postgresql://postgres:P9zNYx6pMvvnF29w@db.qqfgolwjuqjvqcmcweua.supabase.co:5432/postgres`
- BUT this only works if IPv6 is available — otherwise use Supabase JS client or pooler

---

## Temporary Workarounds

1. **Database**: Currently using local Docker PostgreSQL as fallback. To use Supabase:
   - Option A: Enable pooler in dashboard → use pooler connection string
   - Option B: Run schema SQL in dashboard → use `@supabase/supabase-js` with service_role key
   - Option C: Use Supabase Management API with PAT → run SQL programmatically

2. **Phone Access**: VS Code Tunnels and `code-server` both failed. Recommended approach:
   - Install Termux on Android
   - `git clone https://github.com/JohnsonJohn-del/MiniProject2.git`
   - `cd MiniProject2/frontend && npm install && npx opencode@latest`
   - The frontend dev server can be accessed from any device on the same network

---

## Next Recommended Task

1. ✅ ~~Enable connection pooler OR run schema SQL in Supabase Dashboard~~ (waiting on user)
2. Update `DATABASE_URL` in backend `.env` to Supabase connection string
3. Start backend: `cd backend && npm run dev`
4. Start frontend: `cd frontend && npm run dev`
5. Test ingredient CRUD: create vendor → create ingredient → edit → delete
6. Test auth flow: login, demo login, protected routes
7. Move to Recipe CRUD integration

---

## Key File Reference

| File | Purpose |
|------|---------|
| `backend/src/config/env.js` | Environment configuration |
| `backend/src/config/db.js` | PostgreSQL pool (pg) |
| `backend/src/middleware/authMiddleware.js` | Dual-path auth verification |
| `backend/src/controllers/ingredientController.js` | Ingredient CRUD logic |
| `backend/src/routes/ingredientRoutes.js` | Ingredient route definitions |
| `frontend/src/services/api.js` | Axios client with auth interceptors |
| `frontend/src/context/AuthContext.jsx` | Auth state management |
| `frontend/src/pages/client/IngredientsPage.jsx` | Ingredient management UI |
| `frontend/src/index.css` | Liquid glassmorphism + design system |
| `frontend/tailwind.config.js` | Brand palette + custom shadows |

---

*Last updated: 2026-05-09*
