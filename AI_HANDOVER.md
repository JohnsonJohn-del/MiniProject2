# AI Handover

> Compact onboarding for Antigravity IDE / Gemini-based agents.
> Smart Food Costing & AI Pricing Advisor — DUO MCA Final Year Project

---

## Project in 1 Sentence

A multi-tenant SaaS web app that helps restaurants calculate dish costs, optimize menu prices, and get AI pricing recommendations — built with React + Express + Supabase.

---

## Current Priorities (Ranked)

1. **Kill stale node processes** → `Get-Process node | Stop-Process -Force` → restart backend
2. **Test recipe CRUD** with admin token (bypasses middleware pg dependency)
3. **Migrate remaining 9 controllers** from `pg` to `supabaseAdmin`: subscriptionController, aiController, costingService, costingController, operationalExpenseController, menuItemController, analyticsController, adminController, authController, importController
4. **Test each migrated controller** immediately after migration
5. **Run `ai_import_tables.sql`** in Supabase SQL Editor for OCR tables
6. **Test full frontend** end-to-end once all controllers work

---

## Architecture Warnings

- **Do NOT use `query()` from `db.js`** — it calls `pg.Pool` which fails because Supabase cloud PostgreSQL is IPv6-only and unreachable via IPv4
- **Do NOT use Docker** — evaluated and rejected. Use Supabase REST API via `@supabase/supabase-js`
- **Do NOT redesign UI** — liquid glassmorphism + indigo-violet/amber palette is final
- **Do NOT add TypeScript** — both contributors prefer JS, not worth the overhead for this scope
- **Do NOT create more documentation files** — there are already 12+ files

---

## What Works

| Feature | Notes |
|---------|-------|
| Supabase Auth | Login, session, logout via `signInWithPassword` |
| Ingredient CRUD | ✅ Full end-to-end via Supabase REST API |
| Vendor CRUD | ✅ Full end-to-end via Supabase REST API |
| Health endpoints | `/api/health`, `/api/health/db`, `/api/health/supabase` |
| Premium UI | All 21 pages render with glassmorphism design |
| Currency system | INR/USD/EUR/GBP auto-detect + manual switch |
| Demo accounts | admin@demo.com + client@demo.com, one-click login |

---

## What's Broken

| Issue | Root Cause | Files Affected |
|-------|-----------|---------------|
| 9 controllers 500 | Still use `pg.Pool.query()` which fails | adminController, aiController, analyticsController, authController, costingController, menuItemController, operationalExpenseController, subscriptionController, importController |
| costingService.js 500 | Still uses `query()` from db.js | costingService.js |
| Recipe CRUD for clients | `enforceRecipeLimit` middleware → subscriptionService (now migrated) but pg still used in other paths | recipeRoutes.js |
| `ai_import_tables.sql` not run | Tables don't exist in Supabase | uploaded_documents, ingredient_purchases |

---

## Key Code References

| What | Where |
|------|-------|
| Supabase admin client | `backend/src/config/supabaseAdmin.js` |
| Auth middleware (dual-path) | `backend/src/middleware/authMiddleware.js` |
| Migrated controllers (reference pattern) | `backend/src/controllers/ingredientController.js` |
| Controllers still on pg | Any importing `{ query } from "../config/db.js"` |
| Design system CSS | `frontend/src/index.css` |
| Route definitions | `frontend/src/App.jsx` |
| API docs | `api_reference.md` (328 lines) |
| Full project intelligence | `PROJECT_INTELLIGENCE.md` (15 sections) |

---

## Database Connection Rule

**ALWAYS use supabaseAdmin, NEVER use query():**
```js
// ✅ CORRECT
import { supabaseAdmin } from "../config/supabaseAdmin.js";
const { data, error } = await supabaseAdmin.from("table").select("*");

// ❌ WRONG — will crash
import { query } from "../config/db.js";
const result = await query("SELECT * FROM table");
```

---

## Migration Pattern

Follow `ingredientController.js` for the correct pattern:

```js
// Before (pg):
import { query } from "../config/db.js";
const result = await query("SELECT * FROM ingredients WHERE id = $1", [id]);

// After (Supabase):
import { supabaseAdmin } from "../config/supabaseAdmin.js";
const { data, error } = await supabaseAdmin
  .from("ingredients")
  .select("*")
  .eq("id", id);
```

Key differences:
- No parameterized SQL (`$1`, `$2`) — use `.eq()`, `.in()`, `.gte()`, `.order()` etc.
- No `.rows[0]` — Supabase returns `data` directly
- `.single()` returns one object instead of array
- `.select()` after `.insert()` / `.update()` / `.delete()` returns the affected rows
- Multi-tenant filtering: add `.eq("user_id", req.user.id)` for non-admin users

---

## How to Start

```powershell
# Kill any running node processes first
Get-Process -Name "node" | Stop-Process -Force

# Start backend (separate terminal)
cd backend; npm run dev

# Start frontend (separate terminal)
cd frontend; npm run dev

# Or use root script
npm run dev
```

---

## Demo Login (Frontend)
- Admin: admin@demo.com / 123456
- Client: client@demo.com / 123456

---

## API Auth Token (for curl/Postman testing)
```powershell
$body = @{ email = "admin@demo.com"; password = "123456" } | ConvertTo-Json
$auth = Invoke-RestMethod -Uri "https://qqfgolwjuqjvqcmcweua.supabase.co/auth/v1/token?grant_type=password" -Method Post -Body $body -ContentType "application/json" -Headers @{ apikey = "SUPABASE_ANON_KEY" }
$token = $auth.access_token
```

---

## Final Rule

**Before writing any code, read `PROJECT_INTELLIGENCE.md`**. It contains the complete architecture, file responsibilities, migration status, and priority order. This file is optimized for fast AI context loading.
