-- CCFBC Prayer Requests, archives, and role support.
-- Run this in the Supabase SQL editor.

create table if not exists profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'admin',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint profiles_role_check check (role in ('admin', 'pastor'))
);

create index if not exists profiles_role_idx on profiles (role);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on profiles;
create trigger profiles_set_updated_at
before update on profiles
for each row
execute function public.set_updated_at();

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where user_id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() in ('admin', 'pastor')
$$;

create or replace function public.is_pastor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select public.current_user_role() = 'pastor'
$$;

alter table profiles enable row level security;

drop policy if exists "Profiles can read own profile" on profiles;
create policy "Profiles can read own profile"
on profiles for select
to authenticated
using (user_id = auth.uid() or public.is_pastor());

drop policy if exists "Pastors can manage profiles" on profiles;
create policy "Pastors can manage profiles"
on profiles for all
to authenticated
using (public.is_pastor())
with check (public.is_pastor());

create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  request_text text,
  category text default 'General',
  privacy text not null default 'private',
  status text not null default 'pending',
  admin_notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  archived_at timestamptz null,
  archived_by uuid null references auth.users(id),
  constraint prayer_requests_privacy_check check (privacy in ('public', 'private')),
  constraint prayer_requests_status_check check (status in ('pending', 'praying', 'answered', 'archived'))
);

alter table prayer_requests add column if not exists request_text text;
alter table prayer_requests add column if not exists category text default 'General';
alter table prayer_requests add column if not exists privacy text not null default 'private';
alter table prayer_requests add column if not exists status text not null default 'pending';
alter table prayer_requests add column if not exists admin_notes text;
alter table prayer_requests add column if not exists updated_at timestamptz default now();
alter table prayer_requests add column if not exists archived_at timestamptz null;
alter table prayer_requests add column if not exists archived_by uuid null references auth.users(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_privacy_check'
  ) then
    alter table prayer_requests
    add constraint prayer_requests_privacy_check
    check (privacy in ('public', 'private'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'prayer_requests_status_check'
  ) then
    alter table prayer_requests
    add constraint prayer_requests_status_check
    check (status in ('pending', 'praying', 'answered', 'archived'));
  end if;
end $$;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'prayer_requests'
      and column_name = 'request'
  ) then
    execute 'update prayer_requests set request_text = coalesce(request_text, request) where request_text is null';
  end if;
end $$;

update prayer_requests set request_text = coalesce(request_text, '') where request_text is null;
alter table prayer_requests alter column request_text set not null;

create index if not exists prayer_requests_privacy_idx on prayer_requests (privacy);
create index if not exists prayer_requests_status_idx on prayer_requests (status);
create index if not exists prayer_requests_created_at_idx on prayer_requests (created_at);

drop trigger if exists prayer_requests_set_updated_at on prayer_requests;
create trigger prayer_requests_set_updated_at
before update on prayer_requests
for each row
execute function public.set_updated_at();

alter table prayer_requests enable row level security;

drop policy if exists "Allow public prayer request insert" on prayer_requests;
drop policy if exists "Allow public read public prayer requests" on prayer_requests;
drop policy if exists "Anyone can submit prayer requests" on prayer_requests;
drop policy if exists "Public can read public prayer requests" on prayer_requests;
drop policy if exists "Admins can manage public prayer requests" on prayer_requests;
drop policy if exists "Pastors can manage all prayer requests" on prayer_requests;

create policy "Anyone can submit prayer requests"
on prayer_requests for insert
to anon, authenticated
with check (
  status = 'pending'
  and privacy in ('public', 'private')
  and archived_at is null
  and archived_by is null
  and admin_notes is null
);

create policy "Public can read public prayer requests"
on prayer_requests for select
to anon, authenticated
using (privacy = 'public');

create policy "Admins can manage public prayer requests"
on prayer_requests for all
to authenticated
using (public.is_admin() and privacy = 'public')
with check (public.is_admin() and privacy = 'public');

create policy "Pastors can manage all prayer requests"
on prayer_requests for all
to authenticated
using (public.is_pastor())
with check (public.is_pastor());

-- Keep public users from selecting sensitive columns even for public rows.
revoke select on prayer_requests from anon;
revoke insert on prayer_requests from anon;
grant select (id, name, request_text, category, privacy, status, created_at, updated_at, archived_at)
on prayer_requests to anon;
grant insert (name, contact, request_text, category, privacy)
on prayer_requests to anon;

grant select, insert on prayer_requests to authenticated;
grant update, delete on prayer_requests to authenticated;

-- Create or update role rows manually after creating Supabase Auth users:
-- insert into profiles (user_id, email, role)
-- values ('AUTH_USER_UUID_HERE', 'pastor@example.com', 'pastor')
-- on conflict (user_id) do update set role = excluded.role, email = excluded.email;
