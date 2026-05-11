# File Map

Quick-reference project navigation index for AI agents and contributors.

---

## Root Level

| File | Purpose |
|------|---------|
| `PROJECT_INTELLIGENCE.md` | Master project understanding — architecture, status, blockers, priorities |
| `FILE_MAP.md` | THIS FILE — quick file index |
| `AI_HANDOVER.md` | AI onboarding file — compact context for new agents |
| `HANDOVER_NOTES.md` | Human handover between Johnny & Athudon |
| `ARCHITECTURE_DECISIONS.md` | Engineering rationale for all major decisions |
| `CONTRIBUTOR_LOG.md` | Human contributor history |
| `DEVELOPMENT_JOURNAL.md` | Full session logs with failures and fixes |
| `project_tasks.md` | Feature tracker with phased checklist |
| `api_reference.md` | Complete REST API documentation |
| `developer_requirements.md` | Dev setup requirements checklist |
| `development_environment.md` | Environment configuration guide |
| `skills_status.md` | OpenCode skills installation status |
| `project_rules.md` | Persistent engineering rulebook |
| `.opencode-rules` | Auto-loaded AI behavior rules |
| `package.json` | Root workspace config (dev script runs both frontend + backend) |

---

## Frontend — D:\MiniProject\frontend\src\

### Entry Points

| File | Responsibility |
|------|---------------|
| `main.jsx` | ReactDOM render, provider wrapping (BrowserRouter, CurrencyProvider, AuthProvider, App) |
| `App.jsx` | Route definitions with lazy loading — public, client (7 routes), admin (7 routes) |
| `index.css` | Entire design system — liquid glassmorphism, animations, gradient text, glow effects |

### Layouts

| File | Responsibility |
|------|---------------|
| `layouts/PublicLayout.jsx` | Public pages shell: glass navbar, footer, backdrop gradient |
| `layouts/DashboardLayout.jsx` | Authenticated shell: premium sidebar with nav icons, header, content area |

### Contexts

| File | Responsibility | Status |
|------|---------------|--------|
| `context/AuthContext.jsx` | Supabase Auth state — login, logout, session, onAuthStateChanged | ✅ Stable |
| `context/CurrencyContext.jsx` | Region auto-detection, manual currency switcher, localStorage persistence | ✅ Stable |

### Services

| File | Responsibility | Status |
|------|---------------|--------|
| `services/supabase.js` | Supabase client init (anon key) | ✅ Stable |
| `services/api.js` | Axios instance with Supabase token interceptor, 15s timeout, 401 handling | ✅ Stable |

### Pages — Public (Unauthenticated)

| File | Responsibility | Status |
|------|---------------|--------|
| `pages/public/LandingPage.jsx` | Hero, features, AI priceboard preview, staggered reveals | ✅ Complete |
| `pages/public/LoginPage.jsx` | Supabase Auth login + demo one-click buttons | ✅ Complete |
| `pages/public/RegisterPage.jsx` | Supabase Auth sign-up form | ✅ Complete |
| `pages/public/PricingPage.jsx` | Plan comparison with localized currency | ✅ Complete |
| `pages/public/PagesDirectoryPage.jsx` | Route hub with auth badges + metadata | ✅ Complete |

### Pages — Client (Authenticated)

| File | Responsibility | Status |
|------|---------------|--------|
| `pages/client/ClientDashboardPage.jsx` | KPI overview cards | 🟡 Backend may 500 |
| `pages/client/IngredientsPage.jsx` | Full CRUD: table, create form, edit modal, delete | ✅ Complete |
| `pages/client/RecipesPage.jsx` | Recipe builder with ingredient selector | 🟡 Backend may 500 |
| `pages/client/OperationalCostsPage.jsx` | Utility cost forms | 🟡 Backend may 500 |
| `pages/client/PricingAdvisorPage.jsx` | AI recommendation cards + pricing history | 🟡 Backend may 500 |
| `pages/client/AnalyticsPage.jsx` | Recharts margin/profitability charts | 🟡 Backend may 500 |
| `pages/client/SubscriptionPage.jsx` | Usage meters, plan details | 🟡 Backend may 500 |
| `pages/client/ImportPage.jsx` | OCR bill upload UI | 🟡 Backend may 500 |

### Pages — Admin (Authenticated)

| File | Responsibility | Status |
|------|---------------|--------|
| `pages/admin/AdminDashboardPage.jsx` | Platform stats overview | 🟡 Backend may 500 |
| `pages/admin/UsersPage.jsx` | User table with plan/status actions | 🟡 Backend may 500 |
| `pages/admin/SubscriptionsPage.jsx` | Plan management per user | 🟡 Backend may 500 |
| `pages/admin/RecipesAdminPage.jsx` | Admin recipe listing | 🟡 Backend may 500 |
| `pages/admin/IngredientsAdminPage.jsx` | Admin ingredient listing | 🟡 Backend may 500 |
| `pages/admin/AiUsagePage.jsx` | AI request logs per user | 🟡 Backend may 500 |
| `pages/admin/ReportsPage.jsx` | Platform reports | 🟡 Backend may 500 |

### Components

| File | Responsibility |
|------|---------------|
| `components/auth/ProtectedRoute.jsx` | Redirects unauthenticated/unauthorized users |
| `components/ui/PrimaryButton.jsx` | Brand-gradient button with loading state |
| `components/ui/TextInput.jsx` | Styled input with label + error support |
| `components/ui/Logo.jsx` | Gradient icon + text brand logo |
| `components/ui/PageHeader.jsx` | Consistent page title + description |
| `components/ui/EmptyState.jsx` | Empty data placeholder with icon + action |
| `components/ui/SkeletonCard.jsx` | Loading skeleton placeholder |
| `components/ui/CurrencySelector.jsx` | Region/currency dropdown switcher |
| `components/ui/DemoModeChip.jsx` | Demo mode badge indicator |

### Config

| File | Responsibility |
|------|---------------|
| `config/regionPricing.js` | INR/USD/EUR/GBP pricing definitions + locale mapping |

---

## Backend — D:\MiniProject\backend\src\

### Entry & App

| File | Responsibility | Status |
|------|---------------|--------|
| `index.js` | Server start — pg check (graceful), admin seed (skipped if pg unavailable), listen | ✅ Stable |
| `app.js` | Express setup — cors, helmet, morgan, JSON parsing, 13 route mounts, error handlers | ✅ Stable |

### Config

| File | Responsibility | Status |
|------|---------------|--------|
| `config/env.js` | Centralized env vars (port, database, supabase, jwt, openai) | ✅ Stable |
| `config/db.js` | Legacy pg pool — `new Pool({ connectionString: DATABASE_URL })` | 🔴 Deprecated |
| `config/supabaseAdmin.js` | Supabase admin client (service_role key) | ✅ Stable |
| `config/subscriptionPlans.js` | Free/Pro/Premium plan definitions (limits, features) | ✅ Stable |

### Controllers — Database Access Method

| Controller | DB Method | Status |
|-----------|-----------|--------|
| `ingredientController.js` | supabaseAdmin | ✅ Migrated, tested |
| `vendorController.js` | supabaseAdmin | ✅ Migrated, tested |
| `recipeController.js` | supabaseAdmin | ✅ Migrated, untested |
| `authController.js` | pg (query) | 🔴 Broken |
| `adminController.js` | pg (query) | 🔴 Broken |
| `aiController.js` | pg (query) | 🔴 Broken |
| `analyticsController.js` | pg (query) | 🔴 Broken |
| `costingController.js` | pg (query) | 🔴 Broken |
| `menuItemController.js` | pg (query) | 🔴 Broken |
| `operationalExpenseController.js` | pg (query) | 🔴 Broken |
| `subscriptionController.js` | pg (query) | 🔴 Broken |
| `importController.js` | pg (query) | 🔴 Broken |

### Middleware

| File | Responsibility | Status |
|------|---------------|--------|
| `middleware/authMiddleware.js` | Supabase token verify → user lookup/auto-create → req.user | ✅ Stable |
| `middleware/roleMiddleware.js` | `requireRole("admin")` — checks req.user.role | ✅ Stable |
| `middleware/subscriptionMiddleware.js` | `enforceRecipeLimit`, `enforceAiRequestLimit`, `requirePlanFeature` | ✅ Migrated |
| `middleware/errorMiddleware.js` | Global error handler + 404 fallback | ✅ Stable |
| `middleware/asyncHandler.js` | Wraps async route handlers to catch errors | ✅ Stable |

### Routes

| Route file | Mount path | Controllers used | Status |
|-----------|-----------|-----------------|--------|
| `healthRoutes.js` | `/api/health` | Inline handlers | ✅ Stable |
| `authRoutes.js` | `/api/auth` | authController | 🔴 Broken |
| `vendorRoutes.js` | `/api/vendors` | vendorController | ✅ Stable |
| `ingredientRoutes.js` | `/api/ingredients` | ingredientController | ✅ Stable |
| `recipeRoutes.js` | `/api/recipes` | recipeController | 🟡 Partially |
| `operationalExpenseRoutes.js` | `/api/operational-expenses` | operationalExpenseController | 🔴 Broken |
| `menuItemRoutes.js` | `/api/menu-items` | menuItemController | 🔴 Broken |
| `costingRoutes.js` | `/api/costing` | costingController | 🔴 Broken |
| `subscriptionRoutes.js` | `/api/subscription` | subscriptionController | 🔴 Broken |
| `aiRoutes.js` | `/api/ai` | aiController | 🔴 Broken |
| `analyticsRoutes.js` | `/api/analytics` | analyticsController | 🔴 Broken |
| `adminRoutes.js` | `/api/admin` | adminController | 🔴 Broken |
| `importRoutes.js` | `/api/import` | importController | 🔴 Broken |

### Services

| File | Responsibility | Status |
|------|---------------|--------|
| `services/subscriptionService.js` | Plan config, user usage, AI request tracking | ✅ Migrated |
| `services/costingService.js` | Cost calculation (ingredients + ops + salary) per recipe | 🔴 Still uses pg |
| `services/aiPricingService.js` | OpenAI pricing advice + mock fallback | ✅ Complete |
| `services/aiImportService.js` | AI bill/recipe JSON structuring from OCR text | 🟡 Written, untested |
| `services/ocrService.js` | Tesseract.js OCR wrapper | 🟡 Written, untested |
| `services/adminSeeder.js` | Create admin user if missing on startup | ✅ Migrated |

### Utils

| File | Responsibility | Status |
|------|---------------|--------|
| `utils/appError.js` | Custom error class with statusCode | ✅ Stable |
| `utils/jwt.js` | JWT sign/verify utilities | ✅ Stable (legacy) |
| `utils/tenantScope.js` | `getReadScope()`, `getTargetUserId()` for multi-tenant queries | ✅ Stable |

---

## Database — D:\MiniProject\backend\sql\

| File | Tables | Status |
|------|--------|--------|
| `sql/schema.sql` | users, vendors, ingredients, recipes, recipe_ingredients, operational_expenses, menu_items, ai_usage_logs | 🟡 Run partially (tables exist) |
| `sql/ai_import_tables.sql` | uploaded_documents, ingredient_purchases | ❌ Not run in Supabase |
