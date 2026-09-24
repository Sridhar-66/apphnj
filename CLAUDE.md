@AGENTS.md

## Phase status

### Stage 1 — Foundation + Authentication (complete)

- Created the basic Next.js App Router foundation for Hirely & Jobly.
- Added protected-route middleware and server-side role checks for ADMIN, MENTOR, CHILD, and INFLUENCER.
- Added login, registration, password reset request/completion, and role-specific dashboard entry points.
- Removed all demo authentication and fabricated dashboard records. Dashboard values now come from Supabase `profiles` or explicit empty states.
- Added admin-only UI user creation backed by the server-only Supabase service-role client. Public registration is restricted to CHILD.
- Applied migrations 001, 002, and 003 to `eitxjwlwmrgylboamyml`; migration 003 protects profile roles/emails, removes client profile insertion, backfills missing profiles, and passes linked schema lint.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, linked Supabase migration status, and a source scan for removed demo data.

### Stage 2 — Course content system (next)

- Add course, module, lesson, materials, enrollment, progress, certificate, referral, and analytics tables with RLS.
- Replace current domain-data empty states with database-backed UI workflows.

### Working pattern

- Main agent coordinates architecture, sequencing, and validation.
- Smaller subagents handle isolated investigative or implementation tasks when it improves reliability.
- After each phase, update this file and AGENTS.md to reflect the latest completed state and the next target stage.
