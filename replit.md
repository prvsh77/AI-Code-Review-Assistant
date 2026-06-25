# AI Code Review Assistant

An AI-powered code review platform for engineering teams. Reviews pull requests with multi-agent AI analysis covering code quality, security, complexity, and documentation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ai-code-review run dev` — run the frontend (port 18467)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Wouter, TanStack Query, Recharts, shadcn/ui, Tailwind CSS
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI spec (source of truth)
- `lib/db/src/schema/` — Drizzle schema tables (repositories, pullRequests, reviews, reviewFiles, reviewComments, securityIssues, users, activityItems)
- `artifacts/api-server/src/routes/` — Express route handlers (repositories, pullRequests, reviews, security, analytics, user)
- `artifacts/ai-code-review/src/pages/` — All frontend pages
- `artifacts/ai-code-review/src/components/layout/` — AppLayout sidebar component

## Architecture decisions

- Contract-first: OpenAPI spec → codegen → React Query hooks + Zod validators
- Dark-only UI (no light mode toggle) — forced via `document.documentElement.classList.add("dark")`
- Analytics dashboard endpoint computes aggregates server-side from DB
- Review history and main review list share the same `reviews` table with different response shapes
- Seed data provides 6 repositories, 6 PRs, 4 reviews, 8 security issues for a populated first load

## Product

15-page SPA: Landing, Login, Dashboard, Repositories, Pull Requests, AI Analysis Progress, Review Dashboard, Code Viewer, Security Issues, Analytics, Documentation, Settings, User Profile, Review History, 404.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- `SiJava` does not exist in `react-icons/si` — use `FileCode2` from lucide-react as fallback for Java
- API server port is 8080 (not 5000); frontend port is 18467
- Always run codegen after changing `lib/api-spec/openapi.yaml`

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
