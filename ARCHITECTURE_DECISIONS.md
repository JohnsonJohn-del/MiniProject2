# Architecture Decisions

> Engineering choices and reasoning for Smart Food Costing & AI Pricing Advisor
>
> DUO MCA Final Year Project — Johnny Bhai & Athudon

---

## 1. Why MERN Stack?

### Decision
Adopt a modified MERN stack: **Express + React + Node.js** with PostgreSQL instead of MongoDB.

### Reasoning
- **Familiarity**: Both contributors have strong JavaScript experience; using JS across the full stack minimizes context switching.
- **Vite over CRA**: Vite provides faster HMR, smaller bundle sizes, and modern ESM support compared to Create React App.
- **Framer Motion over plain CSS animations**: Required for the premium SaaS UI vision — staggered reveals, gesture-based interactions, layout animations.
- **Tailwind CSS over styled-components**: Faster iteration, smaller bundle with JIT compilation, consistent design tokens via `tailwind.config.js`.

### Trade-offs
- **PostgreSQL instead of MongoDB**: Relational data (ingredients ↔ recipes ↔ menu items) is naturally structured. PostgreSQL enforces referential integrity via foreign keys. MongoDB would require application-level joins.
- **No TypeScript**: Both contributors are more productive in plain JS. TypeScript would add compilation overhead without proportional benefit for this project scope.

---

## 2. Why Supabase?

### Decision
Use **Supabase** for authentication, database hosting, and auto-generated REST API.

### Reasoning
- **Supabase Auth** replaces custom JWT implementation — provides built-in session management, email confirmation, OAuth providers, and admin APIs.
- **Supabase PostgreSQL** provides managed Postgres with point-in-time recovery, automated backups, and 99.95% uptime SLA.
- **Auto-generated REST API** (`/rest/v1/`) enables direct frontend-to-database queries for simple CRUD without backend endpoints.
- **Supabase Admin SDK** (`@supabase/supabase-js` with `service_role` key) allows backend to perform privileged database operations.
- **Cost**: Free tier (500 MB database, 50,000 monthly active users, 2 GB bandwidth) is sufficient for MVP and viva demonstration.

### Trade-offs
- **IPv6 dependency**: Supabase database hosts only expose IPv6 addresses. Networks without IPv6 routing require the connection pooler.
- **Connection pooler**: Supavisor must be explicitly enabled in the dashboard. Tenant not found errors occur if the pooler add-on isn't activated.
- **Vendor lock-in**: Migration from Supabase would require rewriting auth logic and database connection code.

---

## 3. Why Docker Was Rejected (Adopted then Rejected)

### Decision
Initially used Docker PostgreSQL, then rejected for production.

### History
1. **Phase 10**: Docker PostgreSQL (`postgres:16-alpine`) was set up locally because Supabase cloud PostgreSQL was unreachable via IPv6.
2. **Re-evaluation**: Docker added unnecessary complexity for an MCA SaaS MVP. Contributors need to install Docker Desktop, start the daemon, and manage container lifecycle.
3. **Final decision**: Use Supabase cloud PostgreSQL directly. Fall back to Docker only for offline development.

### Current Stance
- **Production**: Supabase cloud PostgreSQL (via connection pooler or Supabase JS client)
- **Development**: Direct Supabase connection when available; local PostgreSQL as last resort
- **No Docker infrastructure**: Containers, compose files, and orchestration are out of scope

---

## 4. UI Design Philosophy

### Decision
Premium SaaS aesthetic with **glassmorphism + liquid effects + gradient accents**.

### Design System
- **Color Palette**: Indigo-violet primary (#8b5cf6), warm amber accent (#f97316), slate neutrals
- **Typography**: System font stack (`Inter`, system-ui) for consistent cross-platform rendering
- **Glassmorphism**: `backdrop-filter: blur()` cards with semi-transparent backgrounds and subtle borders
- **Liquid Glass**: CSS-only animated gradient overlays using `@keyframes` and `::before`/`::after` pseudo-elements
- **Animations**: Framer Motion for component-level animations; pure CSS keyframes for ambient effects
- **Shadows**: Custom `shadow-glass` and `shadow-glass-lg` in Tailwind config for depth without breaking glass effect

### Reasoning
- **Viva presentation**: A premium UI creates a stronger impression during academic evaluation than a utilitarian interface.
- **Portfolio value**: The design system demonstrates modern frontend engineering skills.
- **Performance**: CSS-only animations (liquid glass, blob drift, ambient glow) avoid JS layout thrashing and maintain 60fps.

---

## 5. SaaS Architecture

### Multi-Tenant Data Isolation

```
Role: admin → can read/write ALL users' data
Role: client → can ONLY read/write their own data
```

**Implementation**: `tenantScope.js` utility with `getReadScope()` and `getTargetUserId()` functions. All queries dynamically inject `WHERE user_id = $1` for non-admin users.

### Subscription Plans (Feature Gating)

```
FREE:    5 recipes,    10 AI requests/day,  basic costing
PRO:    50 recipes,   100 AI requests/day,  + operational costing
PREMIUM: unlimited,    unlimited AI requests, + AI pricing advisor
```

**Implementation**: Middleware chain (`enforceRecipeLimit`, `enforceAiRequestLimit`, `requirePlanFeature`) that checks user's plan before allowing operations.

### Folder Structure

```
backend/
  src/
    config/         — env, db, subscription plans
    controllers/    — route handlers (ingredient, vendor, recipe, etc.)
    middleware/     — auth, role, subscription, error handling
    routes/         — Express router definitions
    services/       — business logic (costing, AI pricing, subscription)
    utils/          — helpers (jwt, appError, tenantScope)
  sql/              — database schema
frontend/
  src/
    components/     — reusable UI components (buttons, inputs, cards)
    config/         — region pricing, app configuration
    context/        — React contexts (auth, currency)
    hooks/          — custom hooks (useAuth, useCurrency)
    layouts/        — public and dashboard layouts
    pages/          — public, client, and admin page components
    services/       — API client, Supabase client
```

### Reasoning
- **Modular by domain**: Each business entity has its own controller + route file, making it easy to locate and modify code.
- **Middleware pipeline**: Auth → Role → Subscription → Controller ensures consistent enforcement without code duplication.
- **Services layer**: Business logic separated from HTTP handling for testability.

---

## 6. Auth Flow Decision

### Final Architecture

```
Frontend (Supabase Auth JS) ←→ Supabase Auth (/auth/v1)
    ↓ (Bearer token via axios interceptor)
Backend (requireAuth middleware)
    ↓ (token verification via Supabase /auth/v1/user API)
    ↓ (fallback: local JWT verification for seeded users)
Database (user lookup + data operations)
```

### Why Not Pure Backend Auth?
- Supabase Auth provides session management, token refresh, and email confirmation out of the box.
- Building equivalent functionality in Express would require significant effort (refresh token rotation, session storage, email verification).

### Why Fallback to Local JWT?
- Demo users are seeded in the local database with a known JWT secret.
- During development, if Supabase Auth is unavailable, the backend can still authenticate using the local JWT verification path.
- This dual-path strategy ensures the backend works regardless of Supabase availability.

---

## 7. AI Integration Strategy

### Design
- **Abstraction Layer**: `aiPricingService.js` wraps OpenAI API calls
- **Mock Fallback**: When `OPENAI_API_KEY` is not set, the service returns plausible mock recommendations
- **Usage Tracking**: Each AI request is logged in `ai_usage_logs` table with daily counters
- **Rate Limiting**: Subscription middleware enforces daily AI request quotas per plan

### Reasoning
- The mock fallback enables viva demonstrations without consuming OpenAI credits.
- Usage tracking allows the subscription page to display "5/10 AI requests used today."

---

## 8. Skills System

### Decision
Use OpenCode's skill system for AI-assisted development.

### 13 Installed Skills
| Skill | Purpose |
|-------|---------|
| supabase-postgres-best-practices | PostgreSQL schema design, query optimization |
| senior-architect | Architecture review, code quality |
| ui-design | UI mockups and inspiration |
| framer-motion-animator | Animation implementation |
| debugger | Error diagnosis |
| saas-ui-master | SaaS UI patterns |
| ui-ux-pro-max | Comprehensive UI/UX |
| front-end-developer | Frontend best practices |
| supabase | Supabase configuration |
| modern-web-design | Modern design patterns |
| improve-codebase-architecture | Refactoring suggestions |
| find-skills | Skill discovery |
| skill-creator | Custom skill development |

### Failed Installations
- `api-architect`: Timed out during installation
- `git-workflow-manager`: Private repository, authentication failed

---

*Last updated: 2026-05-09*
