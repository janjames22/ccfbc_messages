-- CCFBC Church Events and admin management.
-- Run prayer_requests.sql first if you have not created profiles/is_admin/is_pastor yet.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time text,
  end_time text,
  location text,
  category text,
  image_url text,
  is_published boolean default true,
  status text default 'upcoming',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  created_by uuid null references auth.users(id),
  constraint events_status_check check (status in ('upcoming', 'completed', 'archived', 'cancelled'))
);

alter table events add column if not exists image_url text;
alter table events add column if not exists is_published boolean default true;
alter table events add column if not exists status text default 'upcoming';
alter table events add column if not exists updated_at timestamptz default now();
alter table events add column if not exists created_by uuid null references auth.users(id);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'events_status_check'
  ) then
    alter table events
    add constraint events_status_check
    check (status in ('upcoming', 'completed', 'archived', 'cancelled'));
  end if;
end $$;

create index if not exists events_event_date_idx on events (event_date);
create index if not exists events_status_idx on events (status);
create index if not exists events_is_published_idx on events (is_published);

drop trigger if exists events_set_updated_at on events;
create trigger events_set_updated_at
before update on events
for each row
execute function public.set_updated_at();

alter table events enable row level security;

drop policy if exists "Allow public read events" on events;
drop policy if exists "Public can read published events" on events;
drop policy if exists "Admins and pastors can manage events" on events;

create policy "Public can read published events"
on events for select
to anon, authenticated
using (is_published = true);

create policy "Admins and pastors can manage events"
on events for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

grant select on events to anon;
grant select, insert, update, delete on events to authenticated;

-- Optional starter event:
-- insert into events (title, description, event_date, start_time, end_time, location, category)
-- values ('Sunday Worship Service', 'Join us for worship and the preaching of God''s Word.', current_date + 7, '09:30', '11:30', 'CCFBC Sanctuary', 'Worship Service');
