-- Migration 005: Add update policies for progress and referrals
-- Allows students to update their own lesson_progress and course_progress
-- Allows influencers and admins to manage referral records

create policy "Students can update their own lesson progress record"
on public.lesson_progress
for update
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
)
with check (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "Students can update their own course progress record"
on public.course_progress
for update
to authenticated
using (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
)
with check (
  student_id = auth.uid()
  or exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "Admins can manage all referrals"
on public.referrals
for all
to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'ADMIN'
  )
);

create policy "Influencers can update their own referrals"
on public.referrals
for update
to authenticated
using (
  influencer_id = auth.uid()
);
