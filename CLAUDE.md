@AGENTS.md

## Phase status

### Stage 1 — Foundation + Authentication (complete)

- Created the basic Next.js App Router foundation for Hirely & Jobly.
- Added protected-route middleware and server-side role checks for ADMIN, MENTOR, CHILD, and INFLUENCER.
- Added login, register, forgot-password flows and role-specific dashboard entry points.
- Added a Supabase migration for `profiles` plus the base app_role enum and RLS foundation.
- Connected the app to the live Supabase project and applied migrations 001 and 002; role checks now read from database profiles, and public registration is restricted to CHILD.
- Verified behavior: anonymous access to `/admin` redirects to `/login`, and authenticated demo sessions redirect the user to the correct role dashboard.

### Working pattern

- Main agent coordinates architecture, sequencing, and validation.
- Smaller subagents handle isolated investigative or implementation tasks when it improves reliability.
- After each phase, update this file and AGENTS.md to reflect the latest completed state and the next target stage.
