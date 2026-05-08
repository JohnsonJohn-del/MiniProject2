# Developer Requirements

This file tracks all inputs needed from you to continue improving quality, realism, and deployment readiness.

## Access and Environment

- [x] Local frontend URL (`http://localhost:5173/`)
  Needed for continuous UI verification while refining visuals and interactions.

- [ ] `DATABASE_URL` (Supabase Postgres connection string)
  Needed to test real multi-tenant data, dashboard metrics, and production-like API behavior.

- [ ] `JWT_SECRET` (production-grade secret)
  Needed to validate secure auth behavior in production-style environment settings.

- [ ] `FRONTEND_URL` for deployment domain
  Needed to finalize CORS and deployment-safe backend config.

## AI Integration

- [ ] `OPENAI_API_KEY`
  Needed to switch from mock AI recommendations to real model-generated pricing insights.

- [ ] Preferred OpenAI model (for example `gpt-4o-mini` / `gpt-4.1-mini`)
  Needed to tune response quality, latency, and operating cost.

## Branding and Visual Identity

- [ ] Final logo (`.svg` preferred)
  Needed for navbar, auth pages, footer, and favicon polish.

- [ ] Brand color palette (primary, accent, neutral preferences)
  Needed to evolve the current default palette into your final visual identity.

- [ ] Typography preference (if different from current)
  Needed to lock a consistent premium design system across all screens.

- [ ] 2-4 design references you like + 1-2 you dislike
  Needed to align motion language and visual style quickly without guesswork.

## Product and Demo Content

- [ ] Final marketing copy for landing hero and CTA text
  Needed to improve storytelling quality and investor-demo clarity.

- [ ] Sample restaurant dataset (ingredients, recipes, menu prices, expenses)
  Needed to make analytics and AI sections look realistic instead of sparse.

- [ ] Preferred pricing values for Free/Pro/Premium plans
  Needed to finalize public pricing page and subscription messaging.

## Deployment and Handover

- [ ] Deployment targets (Vercel/Netlify for frontend, Render/Railway for backend, etc.)
  Needed to provide exact build/start/env deployment instructions.

- [ ] Git author identity (`user.name`, `user.email`) on your machine
  Needed so commits use your preferred authorship without temporary local override.
