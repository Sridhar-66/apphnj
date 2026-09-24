@AGENTS.md

## Phase status

### Stage 1 — Foundation + Authentication (complete)

- Created the basic Next.js App Router foundation for Hirely & Jobly.
- Added protected-route middleware and server-side role checks for ADMIN, MENTOR, CHILD, and INFLUENCER.
- Added login, registration, password reset request/completion, and role-specific dashboard entry points.
- Removed all demo authentication and fabricated dashboard records. Dashboard values now come from Supabase `profiles` or explicit empty states.
- Added admin-only UI user creation backed by the server-only Supabase service-role client. Public registration is restricted to CHILD.
- Applied migrations 001, 002, and 003 to `eitxjwlwmrgylboamyml`; migration 003 protects profile roles/emails, removes client profile insertion, backfills missing profiles, and passes linked schema lint.
- Deployment: the repository is connected to Vercel and live in production. Vercel environment variables must include `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_APP_URL`, and server-only `SUPABASE_SERVICE_ROLE_KEY`.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, linked Supabase migration status, and a source scan for removed demo data.

### Stage 2 — Course content system (complete)

- Added Supabase migration 004 for courses, modules, lessons, materials, enrollments, progress, certificates, and referral records with RLS and indexes.
- Replaced remaining empty dashboard states with real database-backed metrics for students, mentors, and admins.
- Added student course browse pages, mentor management pages, and a mentor course-creation form backed by server actions.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

### Stage 3 — Learning workflows and referral tracking (complete)

- Applied migration 005 for progress and referral update policies.
- Implemented student learning workflows: course enrollment action (`enrollCourseAction`), interactive course overview, lesson player with YouTube embeds, lesson materials downloads, progress tracking, and automatic certificate issuance upon 100% course completion.
- Added student certificates gallery and credential verification at `/student/certificates`.
- Expanded mentor features: lesson creation (`createLessonAction`), material attachments (`createMaterialAction`), and student roster/progress tracking at `/mentor/courses/[courseId]`.
- Added mentor analytics reporting at `/mentor/analytics`.
- Implemented influencer referral tracking, custom campaign code generation, copyable referral links, and conversion logging at `/influencer`.
- Added referral attribution during student account registration.
- Verified with `npm run typecheck`, `npm run lint`, `npm run build`, and `git diff --check`.

### Working pattern

- Main agent coordinates architecture, sequencing, and validation.
- Smaller subagents handle isolated investigative or implementation tasks when it improves reliability.
- After each phase, update this file and AGENTS.md to reflect the latest completed state and the next target stage.
