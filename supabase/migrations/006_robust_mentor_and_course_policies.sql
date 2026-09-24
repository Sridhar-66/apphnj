-- Migration 006: Robust RLS policies for courses, modules, lessons, materials, and enrollments
-- Uses public.current_user_role() (security definer) to avoid RLS recursion and ensure mentors and admins can create and manage courses cleanly.

-- Courses policies
drop policy if exists "Authenticated users can view published courses" on public.courses;
drop policy if exists "Admins and mentors can manage courses" on public.courses;
drop policy if exists "Admins and mentors can insert courses" on public.courses;
drop policy if exists "Admins and mentors can update courses" on public.courses;
drop policy if exists "Admins and mentors can delete courses" on public.courses;

create policy "Authenticated users can view published courses"
on public.courses
for select
to authenticated
using (
  status = 'published'
  or public.current_user_role() in ('ADMIN', 'MENTOR')
  or mentor_id = auth.uid()
  or created_by = auth.uid()
  or exists (
    select 1 from public.student_enrollments e
    where e.course_id = public.courses.id and e.student_id = auth.uid()
  )
);

create policy "Admins and mentors can insert courses"
on public.courses
for insert
to authenticated
with check (
  public.current_user_role() in ('ADMIN', 'MENTOR')
  and (
    mentor_id = auth.uid()
    or public.current_user_role() = 'ADMIN'
  )
  and created_by = auth.uid()
);

create policy "Admins and mentors can update courses"
on public.courses
for update
to authenticated
using (
  public.current_user_role() = 'ADMIN'
  or (public.current_user_role() = 'MENTOR' and mentor_id = auth.uid())
)
with check (
  public.current_user_role() = 'ADMIN'
  or (public.current_user_role() = 'MENTOR' and mentor_id = auth.uid())
);

create policy "Admins and mentors can delete courses"
on public.courses
for delete
to authenticated
using (
  public.current_user_role() = 'ADMIN'
  or (public.current_user_role() = 'MENTOR' and mentor_id = auth.uid())
);

-- Course modules policies
drop policy if exists "Course content is readable for course viewers" on public.course_modules;
drop policy if exists "Mentors and admins can manage course modules" on public.course_modules;

create policy "Course content is readable for course viewers"
on public.course_modules
for select
to authenticated
using (
  public.current_user_role() in ('ADMIN', 'MENTOR')
  or exists (
    select 1 from public.courses c
    where c.id = public.course_modules.course_id
      and (
        c.status = 'published'
        or c.mentor_id = auth.uid()
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
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.courses c
      where c.id = public.course_modules.course_id and c.mentor_id = auth.uid()
    )
  )
)
with check (
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.courses c
      where c.id = public.course_modules.course_id and c.mentor_id = auth.uid()
    )
  )
);

-- Lessons policies
drop policy if exists "Course lesson content is readable for authorized users" on public.lessons;
drop policy if exists "Mentors and admins can manage lessons" on public.lessons;

create policy "Course lesson content is readable for authorized users"
on public.lessons
for select
to authenticated
using (
  public.current_user_role() in ('ADMIN', 'MENTOR')
  or exists (
    select 1 from public.courses c
    where c.id = public.lessons.course_id
      and (
        c.status = 'published'
        or c.mentor_id = auth.uid()
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
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.courses c
      where c.id = public.lessons.course_id and c.mentor_id = auth.uid()
    )
  )
)
with check (
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.courses c
      where c.id = public.lessons.course_id and c.mentor_id = auth.uid()
    )
  )
);

-- Lesson materials policies
drop policy if exists "Lesson materials are readable for authorized users" on public.lesson_materials;
drop policy if exists "Mentors and admins can manage lesson materials" on public.lesson_materials;

create policy "Lesson materials are readable for authorized users"
on public.lesson_materials
for select
to authenticated
using (
  public.current_user_role() in ('ADMIN', 'MENTOR')
  or exists (
    select 1 from public.lessons l
    join public.courses c on c.id = l.course_id
    where l.id = public.lesson_materials.lesson_id
      and (
        c.status = 'published'
        or c.mentor_id = auth.uid()
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
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = public.lesson_materials.lesson_id and c.mentor_id = auth.uid()
    )
  )
)
with check (
  public.current_user_role() = 'ADMIN'
  or (
    public.current_user_role() = 'MENTOR'
    and exists (
      select 1 from public.lessons l
      join public.courses c on c.id = l.course_id
      where l.id = public.lesson_materials.lesson_id and c.mentor_id = auth.uid()
    )
  )
);
