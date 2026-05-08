# Smart Food Costing & AI Pricing Advisor

Startup-style MERN SaaS MVP for restaurant profitability optimization with multi-tenant client data isolation, admin control panel, smart food costing, and AI pricing recommendation architecture.

## Tech Stack

- Frontend: React, Tailwind CSS, React Router, Axios, Recharts, Framer Motion, Lucide React
- Backend: Node.js, Express
- Database: Supabase PostgreSQL
- Auth: JWT (Admin + Client roles)

## Monorepo Structure

```text
frontend/
backend/
project_tasks.md
```

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Configure environment files:

- Copy `backend/.env.example` to `backend/.env`
- Copy `frontend/.env.example` to `frontend/.env`

3. Run backend schema on Supabase Postgres:

- Execute `backend/sql/schema.sql` against your Supabase database.

4. Start development servers:

```bash
npm run dev
```

## Default Roles

- `admin`: platform management
- `client`: restaurant user

Admin seed is performed at server start when `ADMIN_EMAIL` and `ADMIN_PASSWORD` are configured.

## Demo Access (Development Only)

Demo accounts are seeded automatically on backend start:

- Client demo: `client@demo.com` / `123456`
- Admin demo: `admin@demo.com` / `123456`

Use `/login` or `/pages` for one-click demo access buttons.

## Region-Based Pricing UX

Frontend auto-detects region from browser locale and supports:

- India: INR (`₹`)
- United States: USD (`$`)
- Europe: EUR (`€`)
- United Kingdom: GBP (`£`)

Users can switch region manually via the currency selector, and preference is persisted in localStorage.
