# Developer Requirements

Only essential inputs are tracked here. UI decisions are handled autonomously by default.

## Runtime Access

- [x] Local frontend URL (`http://127.0.0.1:5173`)
  Needed for continuous visual QA and interaction testing.

- [x] Local backend API (`http://localhost:5000`)
  Running Express server with Supabase Auth integration.

- [x] Local PostgreSQL (`localhost:5432`)
  Docker PostgreSQL 16 Alpine — local dev database.

## Supabase Integration

- [x] `SUPABASE_URL` (`https://qqfgolwjuqjvqcmcweua.supabase.co`)
  Supabase project URL — configured in both frontend and backend `.env`.

- [x] `VITE_SUPABASE_ANON_KEY`
  Frontend Supabase anon key for auth operations.

- [x] `SUPABASE_ANON_KEY`
  Backend Supabase anon key for token verification fallback.

- [x] Supabase Auth
  Fully migrated from custom JWT backend. Uses `signInWithPassword`, `signUp`, `onAuthStateChanged`.

- [x] Demo users in Supabase Auth
  `admin@demo.com` / `123456`, `client@demo.com` / `123456` — created via Admin API with confirmed emails.

- [x] Auth Middleware
  Backend `requireAuth` verifies Supabase access tokens via `/auth/v1/user` API with custom JWT fallback.

- [ ] Supabase Cloud PostgreSQL
  BLOCKED — Host has only IPv6 (AAAA) record; IPv6 connectivity fails with `ENETUNREACH`. Using local Docker PostgreSQL as workaround.

## Database

- [x] Local Docker PostgreSQL (`postgres:16-alpine`)
  Database: `smartpricing`, running on port 5432.

- [x] Schema applied
  All tables created: users, vendors, ingredients, recipes, recipe_ingredients, operational_expenses, menu_items, ai_usage_logs.

- [x] Demo users seeded
  Admin and demo client accounts with proper roles (admin/client) and subscription plans (premium).

## AI Integration

- [x] `OPENAI_API_KEY`
  Configured in backend `.env` — used for AI pricing advice.

- [x] AI Pricing Service
  OpenAI integration with mock fallback. Generates pricing recommendations, margin warnings, and improvement suggestions.

## Branding

- [ ] Final logo (`.svg` preferred)
  Optional but useful for navbar/landing/favicon brand polish.

## UI & Frontend

- [x] Premium workspace launcher at `/pages`
  Redesigned as SaaS workspace hub with role selection cards, feature bento grid, and demo access.

- [x] Enhanced landing page
  Premium gradient text, improved animations, glassmorphism cards, scroll-triggered reveals.

- [x] Premium CSS utilities
  `glass-card-premium`, `text-gradient`, `glow-card`, `shimmer`, `animate-float`, `gradient-border` classes added.

- [x] Responsive layouts
  PublicLayout with sticky header + mobile menu. DashboardLayout with slide-out sidebar.

- [x] Framer Motion animations
  Page transitions, hover effects, stagger reveals, scroll-triggered animations throughout.

- [x] Currency/Region selector
  USD, EUR, GBP, INR support with automatic locale detection.

- [x] 13 development skills installed
  supabase-postgres-best-practices, supabase, senior-architect, ui-design, ui-ux-pro-max, saas-ui-master, modern-web-design, framer-motion-animator, front-end-developer, debugger, improve-codebase-architecture, find-skills, skill-creator.

## Backend

- [x] Full REST API
  Auth, vendors, ingredients, recipes, operational expenses, menu items, costing, AI, analytics, admin, subscription routes.

- [x] Multi-tenant data scoping
  `tenantScope.js` — clients scoped to own user_id, admins can read all.

- [x] Subscription enforcement
  Middleware gates recipe creation and AI requests by plan limits.

- [x] Role-based access control
  `roleMiddleware.js` restricts endpoints to client/admin roles.
