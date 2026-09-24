<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Phase status

### Stage 1 — Foundation + Authentication (complete)

- Completed: app shell, Supabase email/password auth, protected routes, role-based dashboards, and server-side user creation.
- Authentication: demo sessions and missing-environment fallbacks were removed. Public registration creates only `CHILD` profiles through Supabase Auth; admins create managed users from `/admin/users` through a server-only service-role action.
- Security: route protection is enforced in middleware and server-side route guards. Public forms cannot assign roles, profile inserts are trigger-only, and profile role/email changes are blocked by RLS.
- Backend: Supabase project `eitxjwlwmrgylboamyml` is linked; migrations 001, 002, and 003 are applied remotely and pass linked schema lint. Dashboards query live `profiles` data and show empty states where domain tables do not exist.
- Password recovery: reset-link completion is implemented at `/reset-password`.
- Required next step: Stage 2 course content system with course, module, lesson, materials, and YouTube recording support.

### Operating rules

- Use the main agent to orchestrate the work and break tasks into focused subagent-driven implementation passes.
- Keep each phase small, verifiable, and runnable.
- Update both AGENTS.md and CLAUDE.md after each completed phase.
