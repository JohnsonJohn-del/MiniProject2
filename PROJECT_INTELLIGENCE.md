# Project Intelligence

## Smart Food Costing & AI Pricing Advisor

> Single source of truth for architecture, progress, and AI onboarding.
> DUO MCA Final Year Project — Johnny Bhai & Athudon

---

## 1. Project Overview

**What it is**: A SaaS web application that helps small to medium restaurants calculate accurate food costs, optimize menu pricing, and generate AI-powered pricing recommendations.

**Target audience**: Restaurant owners, chefs, and food business operators who need to understand their profitability at the ingredient, recipe, and menu level.

**Business problem**: Most restaurants price menu items based on intuition or competitor benchmarking, ignoring actual ingredient costs, operational overhead (electricity, gas, salaries), and market positioning. This leads to thin margins or uncompetitive pricing.

**SaaS concept**: Multi-tenant platform where each restaurant (client) has isolated data. An admin oversees all clients. Subscription tiers (Free/Pro/Premium) gate features like recipe limits, AI requests, and operational costing.

**AI features**: OpenAI-powered pricing advisor that analyzes recipe cost + operational overhead and suggests optimal selling prices. OCR-based bill scanning (Tesseract.js) for automated ingredient import. AI fallback to mock data when no API key is configured.

**Subscription model**:
- Free: 5 recipes, 10 AI requests/day, basic costing
- Pro: 50 recipes, 100 AI requests/day, operational costing
- Premium: Unlimited recipes, unlimited AI requests, AI pricing advisor + full analytics

**Hospitality industry focus**: Designed for restaurant, cafe, and cloud kitchen operators who need per-dish profitability visibility.

---

## 2. Tech Stack Overview

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI framework |
| Vite | 5.4.0 | Build tool / dev server |
| Tailwind CSS | 3.4.7 | Utility-first styling |
| Framer Motion | 11.3.12 | Page transitions, micro-interactions |
| Recharts | 2.12.7 | Analytics charts |
| Lucide React | 0.408.0 | Icon library |
| React Router DOM | 6.25.1 | Client-side routing |
| Axios | 1.7.2 | HTTP client |
| @supabase/supabase-js | 2.105.4 | Supabase client (Auth + REST API) |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 24.11.0 | Runtime |
| Express | 4.19.2 | HTTP server / routing |
| pg | 8.12.0 | PostgreSQL client (legacy, mostly unused now) |
| @supabase/supabase-js | 2.105.4 | Supabase REST API client |
| bcryptjs | 2.4.3 | Password hashing (legacy, for local JWT fallback) |
| jsonwebtoken | 9.0.2 | JWT signing (legacy, for local auth fallback) |
| zod | 3.23.8 | Request validation |
| multer | 2.1.1 | File upload handling |
| tesseract.js | 7.0.0 | OCR for bill scanning |
| cors, helmet, morgan | various | Standard Express middleware |

### Database
| Technology | Purpose |
|------------|---------|
| Supabase PostgreSQL | Primary database (hosted, managed Postgres) |
| schema.sql | All table definitions (must be run manually in Supabase SQL Editor) |
| ai_import_tables.sql | Additional tables for OCR/import pipeline |

### Authentication
| Technology | Purpose |
|------------|---------|
| Supabase Auth | Primary auth (email/password, session management, token refresh) |
| Local JWT (legacy) | Fallback for development when Supabase Auth unavailable |

---

## 3. Full Directory Breakdown

```
MiniProject/
├── .agents/                       # OpenCode AI skill system files
├── backend/
│   ├── node_modules/
│   ├── sql/
│   │   ├── schema.sql             # Core database schema (9 tables)
│   │   └── ai_import_tables.sql   # OCR/import pipeline tables (2 tables)
│   └── src/
│       ├── app.js                 # Express app setup (middleware + route mounting)
│       ├── index.js               # Server entry point (pg check → listen)
│       ├── config/
│       │   ├── db.js              # Legacy pg pool configuration
│       │   ├── env.js             # Centralized environment variable access
│       │   ├── subscriptionPlans.js # Free/Pro/Premium feature definitions
│       │   └── supabaseAdmin.js   # Supabase admin client (service_role key)
│       ├── controllers/           # Business logic for each API domain
│       │   ├── adminController.js       # Admin dashboard, user management
│       │   ├── aiController.js          # AI pricing advice + usage logs
│       │   ├── analyticsController.js   # Client analytics KPI endpoints
│       │   ├── authController.js        # Register/login/me (local JWT fallback)
│       │   ├── costingController.js     # Recipe cost breakdown calculations
│       │   ├── importController.js      # OCR bill upload, parse, save
│       │   ├── ingredientController.js  # ✅ Migrated to Supabase
│       │   ├── menuItemController.js    # Menu item CRUD with margin tracking
│       │   ├── operationalExpenseController.js # Electricity/gas/salary CRUD
│       │   ├── recipeController.js      # ✅ Migrated to Supabase
│       │   ├── subscriptionController.js # User plan + usage endpoint
│       │   └── vendorController.js      # ✅ Migrated to Supabase
│       ├── middleware/
│       │   ├── asyncHandler.js          # Wraps async route handlers
│       │   ├── authMiddleware.js        # ✅ Migrated: Supabase token + JWT fallback
│       │   ├── errorMiddleware.js       # Global error handler + 404
│       │   ├── roleMiddleware.js        # Role-based access control
│       │   └── subscriptionMiddleware.js # Plan enforcement (recipe/AI limits)
│       ├── routes/               # Express router definitions (13 route files)
│       ├── services/
│       │   ├── adminSeeder.js           # ✅ Migrated to Supabase
│       │   ├── aiImportService.js       # AI bill/recipe parsing logic
│       │   ├── aiPricingService.js      # OpenAI pricing + mock fallback
│       │   ├── costingService.js        # ❌ Still uses pg
│       │   ├── ocrService.js            # Tesseract.js OCR wrapper
│       │   └── subscriptionService.js   # ✅ Migrated to Supabase
│       └── utils/
│           ├── appError.js             # Custom error class
│           ├── jwt.js                  # JWT sign/verify utilities
│           └── tenantScope.js          # Multi-tenant query scope helpers
├── frontend/
│   ├── node_modules/
│   └── src/
│       ├── App.jsx              # Route definitions (lazy-loaded)
│       ├── main.jsx             # React entry point (providers wrapping)
│       ├── index.css            # Design system: liquid glassmorphism, animations
│       ├── components/
│       │   ├── auth/
│       │   │   └── ProtectedRoute.jsx  # Role-based route guarding
│       │   └── ui/
│       │       ├── CurrencySelector.jsx # Region/currency switcher
│       │       ├── DemoModeChip.jsx     # Demo mode indicator badge
│       │       ├── EmptyState.jsx       # Empty data placeholder
│       │       ├── Logo.jsx             # Brand logo with gradient icon
│       │       ├── PageHeader.jsx       # Consistent page title component
│       │       ├── PrimaryButton.jsx    # Brand gradient button
│       │       ├── SkeletonCard.jsx     # Loading skeleton
│       │       └── TextInput.jsx        # Styled input component
│       ├── config/
│       │   └── regionPricing.js        # INR/USD/EUR/GBP pricing definitions
│       ├── context/
│       │   ├── AuthContext.jsx         # Supabase Auth state management
│       │   └── CurrencyContext.jsx     # Region/currency state + detection
│       ├── hooks/
│       │   ├── useAuth.js             # Shortcut hook for AuthContext
│       │   └── useCurrency.js         # Shortcut hook for CurrencyContext
│       ├── layouts/
│       │   ├── DashboardLayout.jsx    # App shell: sidebar, header, content area
│       │   └── PublicLayout.jsx       # Landing pages layout with navbar
│       └── pages/
│           ├── NotFoundPage.jsx
│           ├── public/
│           │   ├── LandingPage.jsx         # Premium hero, features, testimonials
│           │   ├── LoginPage.jsx           # Supabase Auth login form
│           │   ├── RegisterPage.jsx        # Supabase Auth sign-up
│           │   ├── PricingPage.jsx         # Subscription plan comparison
│           │   └── PagesDirectoryPage.jsx  # Route hub with auth badges
│           ├── client/
│           │   ├── AnalyticsPage.jsx       # Charts: margin, profitability
│           │   ├── ClientDashboardPage.jsx # Overview KPIs
│           │   ├── ImportPage.jsx          # OCR bill upload interface
│           │   ├── IngredientsPage.jsx     # ✅ Complete ingredient management
│           │   ├── OperationalCostsPage.jsx # Electricity/gas/salary forms
│           │   ├── PricingAdvisorPage.jsx  # AI recommendation cards
│           │   ├── RecipesPage.jsx         # Recipe builder UI
│           │   └── SubscriptionPage.jsx    # Plan details + usage meter
│           └── admin/
│               ├── AdminDashboardPage.jsx  # Platform overview stats
│               ├── AiUsagePage.jsx         # AI request logs
│               ├── IngredientsAdminPage.jsx # Admin ingredient view
│               ├── RecipesAdminPage.jsx    # Admin recipe view
│               ├── ReportsPage.jsx         # Platform reports
│               ├── SubscriptionsPage.jsx   # Plan management per user
│               └── UsersPage.jsx           # User CRUD + plan changes
├── .opencode-rules            # Auto-loaded AI behavior rules
├── AI_HANDOVER.md             # NEW: AI-specific handover
├── api_reference.md           # Full API surface documentation
├── ARCHITECTURE_DECISIONS.md  # Engineering decisions with rationale
├── CONTRIBUTOR_LOG.md         # Contributor history
├── DEVELOPMENT_JOURNAL.md     # Detailed session logs
├── FILE_MAP.md                # NEW: Quick reference file index
├── HANDOVER_NOTES.md          # Human handover notes
├── PROJECT_INTELLIGENCE.md    # THIS FILE: master understanding
├── developer_requirements.md  # Setup requirements checklist
├── development_environment.md # Environment setup guide
├── project_rules.md           # Persistent engineering rules
├── project_tasks.md           # Feature development tracker
├── skills_status.md           # Installed AI skills status
└── skills-lock.json           # Skill version lock
```

---

## 4. File Responsibility Mapping

### Backend Controllers

| File | Status | Purpose | Notes |
|------|--------|---------|-------|
| `ingredientController.js` | ✅ Complete | CRUD for ingredients with tenant isolation | Migrated to Supabase, tested end-to-end |
| `vendorController.js` | ✅ Complete | CRUD for vendors with tenant isolation | Migrated to Supabase, tested end-to-end |
| `recipeController.js` | 🟡 Migrated, untested | CRUD for recipes with ingredient linking | Migrated to Supabase, test blocked by pg-dependent middleware |
| `authController.js` | 🔴 Broken | Register/login/me using local JWT | Still uses pg, will fail. Frontend uses Supabase Auth directly |
| `adminController.js` | 🔴 Broken | Admin overview, user management, entity listing | Still uses pg |
| `aiController.js` | 🔴 Broken | AI pricing advice endpoint | Still uses pg |
| `analyticsController.js` | 🔴 Broken | Client analytics KPIs | Still uses pg |
| `costingController.js` | 🔴 Broken | Recipe cost breakdown | Still uses pg |
| `menuItemController.js` | 🔴 Broken | Menu item CRUD with margin | Still uses pg |
| `operationalExpenseController.js` | 🔴 Broken | Utility expense CRUD | Still uses pg |
| `subscriptionController.js` | 🔴 Broken | User plan/usage endpoint | Still uses pg |
| `importController.js` | 🟡 Partially functional | OCR bill upload, AI parse, save | Mixed: some operations use pg |

### Backend Services

| File | Status | Purpose | Notes |
|------|--------|---------|-------|
| `subscriptionService.js` | ✅ Migrated | Plan config, usage lookup, AI request tracking | Migrated to Supabase |
| `costingService.js` | 🔴 Broken | Cost calculation (ingredients + operational + salary) | Still uses pg |
| `aiPricingService.js` | ✅ Complete | OpenAI pricing + mock fallback | No database dependency, fully functional |
| `aiImportService.js` | 🟡 Written, untested | AI bill/recipe parsing from text | Depends on importController working |
| `ocrService.js` | 🟡 Written, untested | Tesseract.js OCR wrapper | Depends on importController working |
| `adminSeeder.js` | ✅ Migrated | Seed admin user on startup | Migrated to Supabase |

### Backend Middleware

| File | Status | Purpose | Notes |
|------|--------|---------|-------|
| `authMiddleware.js` | ✅ Complete | Dual-path auth: Supabase token + JWT fallback | Migrated, working |
| `subscriptionMiddleware.js` | 🟡 Partially functional | Recipe limit, AI limit, feature gating | Uses subscriptionService which is now migrated |
| `errorMiddleware.js` | ✅ Complete | Global error handler | No dependencies |
| `roleMiddleware.js` | ✅ Complete | Role-based access | Simple check, no database |
| `asyncHandler.js` | ✅ Complete | Async error wrapper | No dependencies |

### Frontend Pages

| Page | Status | Notes |
|------|--------|-------|
| `LandingPage.jsx` | ✅ Complete | Premium hero, staggered reveals, mock previews |
| `LoginPage.jsx` | ✅ Complete | Supabase Auth login + demo quick buttons |
| `RegisterPage.jsx` | ✅ Complete | Supabase Auth sign-up form |
| `PricingPage.jsx` | ✅ Complete | Plan comparison with localized currency |
| `PagesDirectoryPage.jsx` | ✅ Complete | Route hub with metadata + auth badges |
| `IngredientsPage.jsx` | ✅ Complete | Full CRUD UI: table, forms, filters, |
| `RecipesPage.jsx` | 🟡 Built, untested | Recipe builder with ingredient selector |
| `ClientDashboardPage.jsx` | 🟡 Partial | Shows overview but backend data may fail |
| `PricingAdvisorPage.jsx` | 🟡 Partial | Calls `/api/ai/pricing-advice` which may fail |
| `OperationalCostsPage.jsx` | 🟡 Partial | Forms for utility costs, backend may fail |
| `AnalyticsPage.jsx` | 🟡 Partial | Recharts charts, backend may fail |
| `SubscriptionPage.jsx` | 🟡 Partial | Usage meters, backend may fail |
| `ImportPage.jsx` | 🟡 Partial | Upload UI, backend may fail |
| `AdminDashboardPage.jsx` | 🟡 Partial | Stats cards, backend may fail |
| `UsersPage.jsx` | 🟡 Partial | User table + actions, backend may fail |
| `SubscriptionsPage.jsx` | 🟡 Partial | Plan management, backend may fail |
| `RecipesAdminPage.jsx` | 🟡 Partial | Admin recipe view, backend may fail |
| `IngredientsAdminPage.jsx` | 🟡 Partial | Admin ingredient view, backend may fail |
| `AiUsagePage.jsx` | 🟡 Partial | AI usage logs, backend may fail |
| `ReportsPage.jsx` | 🟡 Partial | Platform reports, backend may fail |

---

## 5. Current Feature Status

### ✅ COMPLETED (Frontend + Backend + Database, tested end-to-end)

- Supabase Auth: Login, session management, token refresh
- Vendor CRUD: Create, list, update, delete with tenant isolation
- Ingredient CRUD: Create, list, update, delete with tenant isolation
- API health check endpoints (`/api/health`, `/api/health/db`, `/api/health/supabase`)
- Multi-tenant data isolation (admin sees all, client sees own)
- Premium UI design system (liquid glassmorphism, animations, brand palette)

### 🟡 PARTIALLY COMPLETED (Frontend works, backend may fail)

- Recipe CRUD: Backend controller migrated to Supabase, but `enforceRecipeLimit` middleware causes crash for non-admin users. Admin users should work.
- AI Pricing Advisor: Frontend UI complete. Backend AI service (aiPricingService.js) has no pg dependency and works. But `aiController.js` uses pg for logging usage.
- Operational Expenses CRUD: Frontend forms built. Backend still uses pg.
- Menu Item CRUD: Frontend built. Backend still uses pg.
- Costing Engine: Backend service (costingService.js) still uses pg.
- Admin dashboard: Frontend complete. Backend still uses pg.
- Client analytics: Frontend complete. Backend still uses pg.

### 🔴 MOCKED (Works with fake data, no real integration)

- AI pricing recommendations fall back to mock when no OpenAI API key. This is intentional and works correctly.
- Demo accounts are pre-seeded and functional.

### 🔴 BROKEN (Currently non-functional)

- Local JWT registration/login via `/api/auth/register` and `/api/auth/login` — still uses pg, will crash.
- Any endpoint that calls a controller still using `query()` from `db.js` will return 500 Internal Server Error.
- `api_import_tables.sql` has NOT been run in Supabase — OCR/import features have no database tables.
- `enforceRecipeLimit` middleware causes 500 for client users trying to create recipes (though the middleware itself now uses migrated subscriptionService, the controller also needs pg-based services).

### ⬜ NOT STARTED

- Recipe CRUD frontend integration (UI built but needs backend working)
- Operational costing frontend integration
- Vercel deployment
- Phone/tablet responsive QA
- Viva presentation preparation
- Reinstall `api-architect` skill (timed out)
- Reinstall `git-workflow-manager` skill (private repo)

---

## 6. Development History Summary

### Phase 1 (Apr 28): Foundation
- Monorepo scaffold: Vite + React (frontend), Express (backend)
- JWT authentication, admin/client roles, PostgreSQL schema
- Custom CSS design tokens, Tailwind setup

### Phase 2 (Apr 29): Ingredient + Recipe Management
- Vendor, ingredient, recipe CRUD APIs with multi-tenant isolation
- `tenantScope.js` for query-scoped data access

### Phase 3 (Apr 30): Costing Engine
- Operational expenses API (electricity, gas, salary)
- Cost allocation engine: ingredient cost + utility overhead + salary per-recipe
- Menu item pricing with profit margin

### Phase 4 (May 1): Subscription System
- Free/Pro/Premium plans with `maxRecipes`, `aiRequestsPerDay`, feature matrix
- Middleware: `enforceRecipeLimit`, `enforceAiRequestLimit`, `requirePlanFeature`

### Phase 5 (May 2): AI Pricing Advisor
- OpenAI integration with structured JSON prompts
- Mock fallback when no API key
- AI usage tracking in `ai_usage_logs` table

### Phase 6 (May 3): Analytics
- Client analytics: margin analysis, profitability, cost impact
- Admin analytics: user stats, plan distribution, AI usage
- Recharts charts on frontend

### Phase 7 (May 4): Polish
- Loading skeletons, empty states, error states
- Responsive refinements, route validation

### Phase 8 (May 5): Premium UI — First Pass
- Landing page premium redesign (hero, storytelling, mock previews)
- `/pages` route hub, lazy loading, chunk splitting
- API documentation (`api_reference.md`)

### Phase 9 (May 6): Localization + Demo UX
- Currency: INR/USD/EUR/GBP auto-detection + manual switcher
- Demo accounts with one-click login
- Page transition refinement (Framer Motion)

### Phase 10 (May 7): Supabase Auth Migration
- **What worked**: AuthContext rewritten to use `signInWithPassword`, Supabase session tokens, backend token verification via `/auth/v1/user` API. Demo users created with `email_confirm: true`.
- **What failed**: Direct PostgreSQL connection to Supabase cloud — IPv6 ENETUNREACH. Connection pooler returned "tenant not found". Docker PostgreSQL used as local workaround.
- **Lesson**: Supabase cloud databases are IPv6-only by default. The connection pooler (Supavisor) must be explicitly enabled in dashboard settings.

### Phase 11 (May 7): Skills System
- 13 OpenCode skills installed, 2 failed (api-architect timeout, git-workflow-manager private repo)

### Phase 12 (May 8): Premium UI — Overhaul
- **What worked**: Liquid glassmorphism CSS effects with animated gradient overlays. Brand color changed from blue to indigo-violet + amber accent. All 16+ pages upgraded. Health endpoints added. authMiddleware hardcoded values fixed.
- **Architecture decision**: Pure CSS animations (no JS libraries) for ambient effects to maintain 60fps.

### Phase 13 (May 9): Collaboration Docs
- Created CONTRIBUTOR_LOG.md, DEVELOPMENT_JOURNAL.md, ARCHITECTURE_DECISIONS.md, HANDOVER_NOTES.md

### Phase 14 (May 9): Supabase Database Integration
- **What worked**: `supabaseAdmin.js` created with service_role key. ingredientController and vendorController rewritten to use Supabase REST API. Full CRUD tested end-to-end: create vendor → create ingredient → list → update → delete. Auth protection verified (401 for no token). Tenant isolation verified (admin sees all, client sees own).
- **What's pending**: 9 controllers still use `pg` (direct PostgreSQL). recipeController migrated but test blocked by middleware dependency. costingService.js still uses pg.

---

## 7. Known Problems & Blockers

### 🚨 BLOCKER 1: 9 Controllers Still Use pg (PostgreSQL Pool)
**Impact**: HIGH — Most API endpoints return 500 Internal Server Error.
**Files**: adminController, aiController, analyticsController, authController, costingController, menuItemController, operationalExpenseController, subscriptionController, costingService.js
**Root cause**: All import `{ query } from "../config/db.js"` which initializes a `pg.Pool`. The Supabase cloud database is unreachable via IPv4 direct connection (IPv6 only), and the connection pooler isn't enabled.
**Fix needed**: Rewrite each controller to use `supabaseAdmin` from `supabaseAdmin.js` instead of `query()`.
**Order of priority**: subscriptionService.js (done) → recipeController (done) → aiController + subscriptionController → costingService.js → remaining controllers.

### 🚨 BLOCKER 2: Schema SQL Not Executed in Supabase
**Impact**: Tables may not exist in Supabase. The API tests worked (ingredients/vendors existed), suggesting someone ran the schema, but `ai_import_tables.sql` has NOT been run.
**Root cause**: Supabase Dashboard SQL Editor requires manual execution. The `pg` connection also fails, so schema creation via backend isn't possible.
**Fix**: Run `backend/sql/schema.sql` and `backend/sql/ai_import_tables.sql` in Supabase Dashboard > SQL Editor.

### 🚨 BLOCKER 3: authController Uses pg for Local Registration/Login
**Impact**: Users cannot register or login via `/api/auth/*` endpoints. However, frontend uses Supabase Auth directly (`signInWithPassword`, `signUp`), so the main auth flow works. The backend authMiddleware correctly verifies Supabase tokens.
**Severity**: LOW — The frontend auth flow works via Supabase. The local auth endpoints are a development fallback.

### ⚠️ WARNING: Admin Seeding Skipped on Startup
Since pg is unavailable, `seedAdminIfMissing()` is skipped. Users are auto-created on first Supabase login via `authMiddleware.js`. The demo users already exist in both Supabase Auth and the users table.

### ⚠️ WARNING: Mock AI Fallback Is the Default
`OPENAI_API_KEY` is likely not configured in `.env`. The `aiPricingService.js` falls back to mock recommendations. This is intentional and sufficient for viva demonstration.

---

## 8. AI Agent Guidelines

### Instructions For Future AI Agents

**What NOT to do:**
- Do NOT redesign the UI. The liquid glassmorphism + indigo-violet + amber palette is final.
- Do NOT add new architecture layers or abstractions (no additional services, no new middleware patterns, no TypeScript migration).
- Do NOT suggest Docker. Docker was evaluated and rejected. Use Supabase REST API.
- Do NOT rewrite working code for style preferences.
- Do NOT create new documentation files unless explicitly requested. There are already 12+ documentation files.
- Do NOT overengineer solutions. This is an MCA final year project, not a production system.
- Do NOT modify `index.css` design system classes without understanding the liquid glassmorphism layering.

**What caused previous problems:**
- IPv6 connectivity assumed (Supabase cloud). Always check IPv4 fallback.
- pg vs Supabase dual database state. Always check which database backend the code uses.
- Async errors crashing nodemon. Always wrap async handlers.
- Middleware chain failures causing 500 instead of 403. Always test middleware independently.

**Correct development priorities:**
1. FIRST stabilize database connectivity (migrate remaining controllers to Supabase)
2. SECOND verify end-to-end CRUD flows (recipe → menu item → costing)
3. THEN integrate frontend pages with working backend
4. THEN add new features (OCR, deployment)
5. NEVER skip testing after migration

---

## 9. Current Priority Order

| Priority | Task | Status | Dependencies |
|----------|------|--------|-------------|
| P0 | Migrate subscriptionService.js to Supabase | ✅ DONE | — |
| P0 | Migrate recipeController.js to Supabase | ✅ DONE | — |
| P0 | Test recipe CRUD end-to-end | 🔴 PENDING | Backend must restart + middleware must work |
| P1 | Migrate costingService.js to Supabase | 🔴 PENDING | Needed for costing endpoints |
| P1 | Migrate aiController + subscriptionController | 🔴 PENDING | Needed for AI + subscription features |
| P1 | Migrate remaining 6 controllers | 🔴 PENDING | Needed for full app functionality |
| P2 | Recipe frontend integration | ⬜ PENDING | Backend must work first |
| P2 | Operational costing frontend integration | ⬜ PENDING | Backend must work first |
| P3 | AI OCR import system (run import SQL) | ⬜ PENDING | SQL must be run in Supabase |
| P3 | Analytics integration | ⬜ PENDING | Backend must work first |
| P4 | Vercel deployment | ⬜ PENDING | All features working + env config |
| P4 | Phone/tablet responsive QA | ⬜ PENDING | Before viva |
| P4 | Viva presentation preparation | ⬜ PENDING | After all features stable |

---

## 10. Database & Supabase Status

### Existing Tables (verified working)
| Table | Status | Notes |
|-------|--------|-------|
| `users` | ✅ Working | Demo users exist. Auto-created on first Supabase login. |
| `vendors` | ✅ Working | CRUD tested via Supabase REST API |
| `ingredients` | ✅ Working | CRUD tested via Supabase REST API |
| `recipes` | ✅ Working | Verified by listing ingredients (recipes table exists) |
| `recipe_ingredients` | ✅ Working | Junction table exists |
| `operational_expenses` | 🟡 Unknown | Table should exist but untested via Supabase |
| `menu_items` | 🟡 Unknown | Table should exist but untested via Supabase |
| `ai_usage_logs` | 🟡 Unknown | Table should exist but untested via Supabase |

### Missing Tables (SQL not run)
| Table | File | Status |
|-------|------|--------|
| `uploaded_documents` | `ai_import_tables.sql` | ❌ Not created |
| `ingredient_purchases` | `ai_import_tables.sql` | ❌ Not created |

### Supabase Auth Configuration
| Setting | Status |
|---------|--------|
| Auth enabled | ✅ Yes |
| Email/password sign-in | ✅ Enabled |
| Email confirmation | ✅ Disabled for demo users (`email_confirm: true`) |
| Demo users (admin@demo.com, client@demo.com) | ✅ Created |
| Service role key configured | ✅ Yes |
| Connection pooler (Supavisor) | ❌ Not enabled (tenant not found error) |

### RLS Strategy
Currently **NO Row-Level Security** is configured on Supabase tables. All access control happens at the application layer:
- Backend middleware (`requireAuth`, `requireRole`)
- Controller-level user_id filtering (`tenantScope.js` or manual `.eq("user_id", req.user.id)`)
- The `supabaseAdmin` client uses the `service_role` key which bypasses RLS entirely

**Future consideration**: RLS policies on Supabase tables would add defense-in-depth, but is not needed for MVP/viva.

---

## 11. OCR & AI Import Roadmap

### Planned Architecture

```
User uploads bill image (JPEG/PNG)
  → multer saves to memory buffer
  → tesseract.js extracts text (ocrService.js)
  → Raw OCR text displayed to user for review
  → User clicks "Parse with AI"
  → aiImportService.js calls OpenAI to structure:
        { vendor_name, items: [{ name, quantity, unit, price }] }
  → User reviews structured data
  → User clicks "Save"
  → saveBillImport creates vendor + ingredient_purchases
```

### Current State
- `ocrService.js`: Written, uses Tesseract.js. Untested end-to-end.
- `aiImportService.js`: Written, calls OpenAI for structured parsing. Untested.
- `importController.js`: Written with 6 endpoints (upload, parse bill, save bill, parse recipe, save recipe, list purchases). Still uses `pg` for database operations.
- `uploaded_documents` and `ingredient_purchases` tables: Not created in Supabase.

### What's Needed
1. Run `ai_import_tables.sql` in Supabase SQL Editor
2. Migrate `importController.js` to use `supabaseAdmin`
3. Test end-to-end flow with a sample bill image
4. Frontend `ImportPage.jsx` is already built and ready

### Recipe Auto-Generation (Future)
Same pipeline but with recipe-specific prompts:
- Input: Text description of a recipe (or OCR from a recipe book)
- AI output: structured recipe with name, ingredients, quantities
- Backend creates recipe + recipe_ingredients in one flow

---

## 12. UI/UX Design Language

### Visual Philosophy
Premium SaaS minimalism with glassmorphism depth. Inspired by Linear (clean typography, subtle animations), Vercel (spacing, geometry), Stripe (gradient accents, documentation quality), and Framer (motion polish).

### Motion Language
- **Page transitions**: Framer Motion `AnimatePresence` with fade + slight vertical slide (0.3s)
- **Card interactions**: Hover lift (`translateY(-2px)`) with shadow deepening (0.3s ease)
- **Button press**: Scale(0.97) on click with immediate snap-back
- **Stagger reveals**: Children fade in sequentially with 0.05s delay between each
- **Ambient**: CSS keyframe animations for gradient blob drift, liquid border flow, floating elements

### Color System
```
Primary: Indigo-violet (#8b5cf6)
  → Range: 50 (bg-light) to 900 (text-dark)
Accent: Warm amber (#f97316)
  → Range: 50 to 900
Neutral: Slate (#0f172a text, #f8fafc bg)
Glass: White 70-90% opacity + backdrop-blur + subtle border
Gradients: brand→fuchsia, brand→blue, accent→rose, brand→violet→indigo
```

### Typography
- Font: Manrope (Google Fonts) — weights 400-800
- Headings: Extrabold (800) or Bold (700), gradient text for emphasis
- Body: Medium (500) or Regular (400)
- Monospace: System default (minimal usage)

### Glassmorphism System
- `.glass-card`: Standard white card with border, shadow, backdrop-blur
- `.glass-card-premium`: Rounded-3xl with hover lift effect
- `.liquid-glass`: Animated gradient pseudo-element background + flowing gradient border
- `.liquid-blob`: Floating blurred orbs with organic drift
- `.liquid-ambient`: Large background gradient orbs

### SaaS Inspirations
- **Linear**: Clean monochrome + accent color, subtle hover states, kanban-like visual density
- **Vercel**: Geometric spacing, border-radius consistency, typographic hierarchy
- **Stripe**: Gradient hero sections, documentation clarity, testimonial social proof
- **Framer**: Component motion design, gesture interactions, layout animations

---

## 13. Contributor Responsibilities

### Johnny Bhai — UI/Frontend Direction & Product Owner
- Frontend architecture and component design
- UI/UX decisions (layout, animations, design system)
- AI feature planning and product direction
- Landing page, pricing page, public pages
- Motion design and animation implementation
- Route design and navigation architecture
- Premium UI overhaul and brand identity

### Athudon — Backend Engineering & Integration
- Backend API development and database logic
- Supabase integration and auth migration
- Technical implementation of backend features
- Legacy pg code migration to Supabase REST API
- Environment configuration and deployment planning
- Documentation and handover materials

### OpenCode AI — Assisted Development
- Code generation, debugging, and refactoring
- Architecture analysis and improvement suggestions
- Documentation generation and maintenance
- Skill-based specialized assistance (Supabase, UI, animation, etc.)

---

## 14. Environment Setup Guide

### Quick Start

```bash
# 1. Install root dependencies
cd MiniProject
npm install

# 2. Install backend dependencies
cd backend && npm install

# 3. Install frontend dependencies
cd ../frontend && npm install

# 4. Configure environment (backend)
# Copy backend/.env.example to backend/.env
# Fill in: SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY
# Optional: OPENAI_API_KEY, DATABASE_URL

# 5. Configure environment (frontend)
# Copy frontend/.env.example to frontend/.env
# Fill in: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_API_BASE_URL

# 6. Run SQL schema in Supabase Dashboard
# Open Supabase Dashboard → SQL Editor → Paste schema.sql → Run
# Repeat for ai_import_tables.sql (if using OCR features)

# 7. Start development
npm run dev    # Starts both frontend (5173) and backend (5000)
```

### Required Environment Variables

**Backend (.env)**
```
SUPABASE_URL=https://qqfgolwjuqjvqcmcweua.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...  # For admin operations
DATABASE_URL=postgresql://...       # Optional, for pg fallback
JWT_SECRET=your-secret              # For legacy JWT fallback
OPENAI_API_KEY=sk-...              # Optional, mock fallback if missing
ADMIN_EMAIL=admin@demo.com         # For auto-seed
ADMIN_PASSWORD=123456              # For auto-seed
```

**Frontend (.env)**
```
VITE_SUPABASE_URL=https://qqfgolwjuqjvqcmcweua.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
VITE_API_BASE_URL=http://localhost:5000/api
```

### Dev Server URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health check: http://localhost:5000/api/health

### Demo Credentials
- Admin: admin@demo.com / 123456 → role: admin
- Client: client@demo.com / 123456 → role: client

---

## 15. Final AI Context Summary

### Project Maturity Assessment

This project is in **mid-development** with a clear functional core and significant migration work in progress.

**Genuinely functional:**
- Frontend renders all pages with premium UI
- Supabase Auth (login, session, logout)
- Ingredient CRUD (full end-to-end via Supabase REST API)
- Vendor CRUD (full end-to-end via Supabase REST API)
- Recipe controller code (migrated but untested due to middleware)
- Health check endpoints
- Demo user accounts
- Currency localization system

**Only mocked / placeholder:**
- AI pricing recommendations (mock fallback — intentional)
- OCR import (code written, tables not created, untested)
- Analytics (charts render but backend 500s)

**What should happen next:**
1. Kill existing node processes and restart backend cleanly
2. Test recipe CRUD with admin token (bypasses middleware pg dependency)
3. Migrate remaining controllers from pg to Supabase (starting with low-dependency ones: subscriptionController, aiController, then costingService, then the rest)
4. Test each migrated controller immediately
5. Once all controllers work, test frontend pages end-to-end
6. Run `ai_import_tables.sql` in Supabase SQL Editor
7. Migrate `importController.js` to Supabase
8. Test OCR/import flow
9. Run `npm run build` to verify production build
10. Prepare viva presentation

### Key Technical Constraints
- No direct PostgreSQL connection — use `@supabase/supabase-js` REST API
- All controllers must use `supabaseAdmin` (service_role key) for database operations
- The `query()` function from `db.js` (pg pool) is deprecated — do NOT write new code using it
- Frontend uses Supabase Auth — do NOT revert to local JWT
- All CSS animations are pure CSS (in `index.css`) — do not add JS animation libraries
