# Development Environment

## Overview

This project is a full-stack MERN-style SaaS application for restaurant profitability management, using Supabase for authentication and PostgreSQL for data storage.

---

## Frontend Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + Vite |
| Routing | React Router v6 (lazy-loaded) |
| Auth | Supabase Auth (email/password) |
| API Client | Axios with Supabase token interceptor |
| Styling | Tailwind CSS |
| Animation | Framer Motion |
| Icons | Lucide React |
| Charts | Recharts |
| Currency | Intl.NumberFormat |

## Backend Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 with ES Modules |
| Framework | Express 4 |
| Database | PostgreSQL 16 (Docker local) |
| Auth Middleware | Custom JWT + Supabase token verification |
| Validation | Zod |
| ORM/Database | pg (raw SQL queries) |
| Password Hashing | bcryptjs |
| Logging | Morgan |

## Supabase Configuration

- **Project URL**: `https://qqfgolwjuqjvqcmcweua.supabase.co`
- **Auth**: Supabase Auth with email/password
- **Database**: Supabase PostgreSQL (target) / Local Docker PostgreSQL (current development)
- **Demo Accounts**:
  - `admin@demo.com` / `123456` (admin role)
  - `client@demo.com` / `123456` (client role)

## Local Development Setup

```bash
# Start PostgreSQL (Docker)
docker run -d --name postgres-dev -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=smartpricing -p 5432:5432 postgres:16-alpine

# Run schema
docker exec -i postgres-dev psql -U postgres -d smartpricing < backend/sql/schema.sql

# Start backend
cd backend && npm run dev

# Start frontend
cd frontend && npm run dev
```

## OpenCode Workflow

1. **Skills System**: Installed skills provide domain-specific guidance for each task
   - `supabase-postgres-best-practices`: Database design and queries
   - `senior-architect`: Architecture decisions
   - `ui-design`: UI/UX patterns
   - `framer-motion-animator`: Animation implementation
   - `debugger`: Troubleshooting

2. **Task Tracking**: `project_tasks.md` is the source of truth for current and completed work

3. **Commit Pattern**: Frequent commits after each logical completion point

## Installed Skills

Skills are installed via `npx skills add <repo> --skill <name>` and stored in `.agents/skills/`.
See `skills_status.md` for detailed status of each skill.

## Environment Variables

### Frontend (`frontend/.env`)
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (`backend/.env`)
```
DATABASE_URL=
JWT_SECRET=
SUPABASE_URL=
SUPABASE_ANON_KEY=
OPENAI_API_KEY=
```

## Demo Auth Setup

Demo users are seeded via:
1. `backend/src/services/adminSeeder.js` — creates users in local `users` table on backend start
2. `frontend/src/context/AuthContext.jsx` — handles sign-up fallback if demo users don't exist in Supabase Auth

## Animation Stack

- Page transitions: Framer Motion `AnimatePresence` with `mode="wait"`
- Route entrance: `motion.div` with opacity + y-axis shift
- Hover effects: Tailwind `transition` with `hover:-translate-y-0.5`
- Loading skeletons: Custom `SkeletonCard` component
