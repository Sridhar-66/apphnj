<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Phase status

### Stage 1 — Foundation + Authentication (complete)

- Completed: app shell, auth flow, protected routes, role-based dashboards, and Supabase-ready config.
- Authentication: email/password-style flow with demo fallback for local development when env vars are missing; production path uses Supabase auth + server-side checks.
- Security: route protection is enforced in middleware and server-side route guards. No role data is trusted from the browser alone.
- Backend: Supabase project `eitxjwlwmrgylboamyml` is linked; migrations 001 and 002 are applied remotely, and live roles are read from `profiles`.
- Files added/updated: `app/login/page.tsx`, `app/register/page.tsx`, `app/forgot-password/page.tsx`, `app/(dashboard)/admin/page.tsx`, `app/(dashboard)/mentor/page.tsx`, `app/(dashboard)/student/page.tsx`, `app/(dashboard)/influencer/page.tsx`, `app/actions/auth.ts`, `lib/auth.ts`, `middleware.ts`, `supabase/migrations/001_profiles_and_roles.sql`.
- Required next step: Stage 2 course content system with course, module, lesson, materials, and YouTube recording support.

### Operating rules

- Use the main agent to orchestrate the work and break tasks into focused subagent-driven implementation passes.
- Keep each phase small, verifiable, and runnable.
- Update both AGENTS.md and CLAUDE.md after each completed phase.
