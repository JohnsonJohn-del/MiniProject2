# Developer Requirements

Only essential inputs are tracked here. UI decisions are handled autonomously by default.

## Runtime Access

- [x] Local frontend URL (`http://127.0.0.1:5173`)
  Needed for continuous visual QA and interaction testing.

## Environment Variables (Essential)

- [ ] `DATABASE_URL` (Supabase Postgres)
  Needed to run real multi-tenant data and validate production-like behavior.

- [ ] `SUPABASE_URL` (if used in your Supabase setup)
  Needed for complete Supabase integration validation.

- [ ] `SUPABASE_ANON_KEY` (if frontend Supabase usage is added)
  Needed for secure frontend Supabase access in future integrations.

- [ ] `OPENAI_API_KEY`
  Needed to switch from AI mock fallback to real pricing recommendations.

## Optional Branding Asset

- [ ] Final logo (`.svg` preferred)
  Optional but useful for navbar/landing/favicon brand polish.
