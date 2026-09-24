create or replace function public.current_user_role(user_id uuid default auth.uid())
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = user_id limit 1;
$$;

revoke all on function public.current_user_role(uuid) from public;
grant execute on function public.current_user_role(uuid) to authenticated;

create or replace function public.current_user_email(user_id uuid default auth.uid())
returns text
language sql
stable
security definer
set search_path = public
as $$
  select email from public.profiles where id = user_id limit 1;
$$;

revoke all on function public.current_user_email(uuid) from public;
grant execute on function public.current_user_email(uuid) to authenticated;

drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;
drop policy if exists "Admins can view all profiles" on public.profiles;

create policy "Users can update their own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (
  auth.uid() = id
  and email = public.current_user_email(auth.uid())
  and role = public.current_user_role(auth.uid())
);

create policy "Users and admins can view profiles"
on public.profiles
for select
to authenticated
using (auth.uid() = id or public.current_user_role() = 'ADMIN');

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    'CHILD'
  )
  on conflict (id) do nothing;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

insert into public.profiles (id, email, full_name, role)
select
  users.id,
  users.email,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.email),
  'CHILD'
from auth.users as users
left join public.profiles as profiles on profiles.id = users.id
where profiles.id is null;
