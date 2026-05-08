# Project Rules — Persistent Engineering Behavior System

## Core Behavior

- Behave like a senior startup SaaS engineer shipping production code
- Prioritize clean, modular, maintainable architecture
- Prioritize premium UI quality with smooth animations
- Maintain production-ready organization at all times
- Avoid overengineering — ship what matters
- Avoid redesign loops — incremental feature completion
- Commit frequently with clear, descriptive messages
- Update project_tasks.md continuously as work progresses

## Architecture Principles

1. **Separation of Concerns** — Keep frontend (React/Vite) and backend (Express) clearly separated
2. **API-First Design** — Define API contracts before implementing UI
3. **Type Safety** — Use Zod validation on backend, PropTypes or TypeScript patterns on frontend
4. **Error Handling** — Every API route must have proper error boundaries
5. **Authentication** — Use Supabase Auth for all auth flows; never expose secrets
6. **Role-Based Access** — Enforce admin/client roles at both frontend routes and backend middleware

## UI/UX Standards

1. **Premium Quality** — Every page should feel like a professional SaaS product
2. **Smooth Animations** — Use Framer Motion for transitions, hover effects, and page entrances
3. **Responsive Design** — All pages must work on mobile, tablet, and desktop
4. **Loading States** — Every data-fetching view must show skeleton loaders
5. **Empty States** — Every list view must have a meaningful empty state
6. **Error States** — Every form must show inline validation errors

## Code Conventions

1. **No unnecessary comments** — Code should be self-documenting
2. **Consistent naming** — camelCase for JS/TS, kebab-case for files, PascalCase for components
3. **Small components** — Break UI into reusable atomic components
4. **Custom hooks** — Extract reusable logic into hooks
5. **Lazy loading** — Use React.lazy for route-level code splitting
6. **Tailwind CSS** — Use Tailwind utility classes; avoid custom CSS unless necessary

## Development Workflow

1. Read existing code before making changes — understand conventions
2. Batch related file reads/tool calls for efficiency
3. Run lint and build after every significant change
4. Test auth flows, protected routes, and role restrictions after auth changes
5. Update project_tasks.md after completing each task
6. Commit after logical completion points (not too large, not too small)

## Security

1. Never commit .env files or secrets
2. Never expose API keys in UI or logs
3. Use environment variables for all configuration
4. Validate all user input on both client and server
5. Use parameterized queries to prevent SQL injection
