create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  description text,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  created_by uuid not null references public.profiles(id) on delete restrict,
  mentor_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.course_modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  module_id uuid references public.course_modules(id) on delete set null,
  title text not null,
  description text,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  youtube_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (course_id, sort_order)
);

create table if not exists public.lesson_materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  title text not null,
  kind text not null default 'article' check (kind in ('article', 'pdf', 'video', 'link')),
  file_url text not null,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.student_enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status text not null default 'active' check (status in ('active', 'completed', 'dropped')),
  enrolled_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (student_id, lesson_id)
);

create table if not exists public.course_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  completed_lessons integer not null default 0 check (completed_lessons >= 0),
  total_lessons integer not null default 0 check (total_lessons >= 0),
  percent_complete integer not null default 0 check (percent_complete between 0 and 100),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'completed')),
  updated_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_code text not null unique,
  issued_at timestamptz not null default now(),
  unique (student_id, course_id)
);

create table if not exists public.referrals (
  id uuid primary key default gen_random_uuid(),
  influencer_id uuid not null references public.profiles(id) on delete cascade,
  student_id uuid references public.profiles(id) on delete set null,
  referral_code text not null,
  status text not null default 'pending' check (status in ('pending', 'converted', 'paid')),
  amount_cents integer not null default 0 check (amount_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_courses_status on public.courses(status);
create index if not exists idx_courses_mentor_id on public.courses(mentor_id);
create index if not exists idx_courses_created_by on public.courses(created_by);
create index if not exists idx_modules_course_id on public.course_modules(course_id);
create index if not exists idx_lessons_course_id on public.lessons(course_id);
create index if not exists idx_lessons_module_id on public.lessons(module_id);
create index if not exists idx_lesson_materials_lesson_id on public.lesson_materials(lesson_id);
create index if not exists idx_enrollments_student_id on public.student_enrollments(student_id);
create index if not exists idx_enrollments_course_id on public.student_enrollments(course_id);
create index if not exists idx_lesson_progress_student_id on public.lesson_progress(student_id);
create index if not exists idx_course_progress_student_id on public.course_progress(student_id);
create index if not exists idx_certificates_student_id on public.certificates(student_id);
create index if not exists idx_referrals_influencer_id on public.referrals(influencer_id);

alter table public.courses enable row level security;
alter table public.course_modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_materials enable row level security;
alter table public.student_enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.course_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.referrals enable row level security;

create policy "Authenticated users can view published courses"
on public.courses
for select
to authenticated
using (
  status = 'published'
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
  )
  or exists (
    select 1 from public.student_enrollments e
    where e.course_id = public.courses.id and e.student_id = auth.uid()
  )
);

create policy "Admins and mentors can manage courses"
on public.courses
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
  )
  and (
    mentor_id = auth.uid() or exists (
      select 1 from public.profiles p
      where p.id = auth.uid() and p.role = 'ADMIN'
    )
  )
);

create policy "Course content is readable for course viewers"
on public.course_modules
for select
to authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = public.course_modules.course_id
      and (
        c.status = 'published'
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
        )
        or exists (
          select 1 from public.student_enrollments e
          where e.course_id = c.id and e.student_id = auth.uid()
        )
      )
  )
);

create policy "Mentors and admins can manage course modules"
on public.course_modules
for all
to authenticated
using (
  exists (
    select 1 from public.courses c
    join public.profiles p on p.id = auth.uid()
    where c.id = public.course_modules.course_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
)
with check (
  exists (
    select 1 from public.courses c
    join public.profiles p on p.id = auth.uid()
    where c.id = public.course_modules.course_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
);

create policy "Course lesson content is readable for authorized users"
on public.lessons
for select
to authenticated
using (
  exists (
    select 1 from public.courses c
    where c.id = public.lessons.course_id
      and (
        c.status = 'published'
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
        )
        or exists (
          select 1 from public.student_enrollments e
          where e.course_id = c.id and e.student_id = auth.uid()
        )
      )
  )
);

create policy "Mentors and admins can manage lessons"
on public.lessons
for all
to authenticated
using (
  exists (
    select 1 from public.courses c
    join public.profiles p on p.id = auth.uid()
    where c.id = public.lessons.course_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
)
with check (
  exists (
    select 1 from public.courses c
    join public.profiles p on p.id = auth.uid()
    where c.id = public.lessons.course_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
);

create policy "Lesson materials are readable for authorized users"
on public.lesson_materials
for select
to authenticated
using (
  exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = public.lesson_materials.lesson_id
      and (
        c.status = 'published'
        or exists (
          select 1 from public.profiles p
          where p.id = auth.uid() and p.role in ('ADMIN', 'MENTOR')
        )
        or exists (
          select 1 from public.student_enrollments e
          where e.course_id = c.id and e.student_id = auth.uid()
        )
      )
  )
);

create policy "Mentors and admins can manage lesson materials"
on public.lesson_materials
for all
to authenticated
using (
  exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    join public.profiles p on p.id = auth.uid()
    where l.id = public.lesson_materials.lesson_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
)
with check (
  exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    join public.profiles p on p.id = auth.uid()
    where l.id = public.lesson_materials.lesson_id
      and (c.mentor_id = auth.uid() or p.role = 'ADMIN')
  )
);

create policy "Students can view their own enrollments"
on public.student_enrollments
for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.courses c
    where c.id = public.student_enrollments.course_id
      and c.mentor_id = auth.uid()
  )
);

create policy "Students may enroll in published courses"
on public.student_enrollments
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.courses c
    where c.id = public.student_enrollments.course_id and c.status = 'published'
  )
);

create policy "Admins and mentors may manage enrollments"
on public.student_enrollments
for update
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.courses c
    where c.id = public.student_enrollments.course_id and c.mentor_id = auth.uid()
  )
);

create policy "Students can view their own lesson progress"
on public.lesson_progress
for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = public.lesson_progress.lesson_id and c.mentor_id = auth.uid()
  )
);

create policy "Students can update their own lesson progress"
on public.lesson_progress
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = public.lesson_progress.lesson_id and c.status = 'published'
  )
);

create policy "Students can update their own course progress"
on public.course_progress
for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.courses c
    where c.id = public.course_progress.course_id and c.mentor_id = auth.uid()
  )
);

create policy "Students can create course progress for enrolled courses"
on public.course_progress
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.student_enrollments e
    where e.student_id = auth.uid() and e.course_id = public.course_progress.course_id
  )
);

create policy "Students can see their own certificates"
on public.certificates
for select
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
  or exists (
    select 1 from public.courses c
    where c.id = public.certificates.course_id and c.mentor_id = auth.uid()
  )
);

create policy "Students can create their own certificates"
on public.certificates
for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.course_progress cp
    where cp.student_id = auth.uid() and cp.course_id = public.certificates.course_id and cp.percent_complete >= 100
  )
);

create policy "Influencers can view their own referrals"
on public.referrals
for select
to authenticated
using (
  influencer_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "Influencers can create referral records"
on public.referrals
for insert
to authenticated
with check (
  influencer_id = auth.uid()
  and referral_code is not null
);

drop trigger if exists courses_updated_at on public.courses;
create trigger courses_updated_at
before update on public.courses
for each row execute procedure public.update_updated_at();

drop trigger if exists lesson_progress_updated_at on public.lesson_progress;
create trigger lesson_progress_updated_at
before update on public.lesson_progress
for each row execute procedure public.update_updated_at();

drop trigger if exists course_progress_updated_at on public.course_progress;
create trigger course_progress_updated_at
before update on public.course_progress
for each row execute procedure public.update_updated_at();

drop trigger if exists referrals_updated_at on public.referrals;
create trigger referrals_updated_at
before update on public.referrals
for each row execute procedure public.update_updated_at();
