-- CCFBC Church Events
-- Run this in Supabase SQL editor for the Events / Church Calendar feature.

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date not null,
  start_time time,
  end_time time,
  location text,
  category text,
  created_at timestamptz default now()
);

create index if not exists events_event_date_idx
on events (event_date);

alter table events enable row level security;

drop policy if exists "Allow public read events" on events;
create policy "Allow public read events"
on events for select
using (true);

-- Public users must not insert, update, or delete events.
-- Add admin-only management policies later when the app has a clear admin role policy.
-- Example direction:
-- create policy "Allow admins to insert events"
-- on events for insert
-- with check ((auth.jwt() ->> 'role') = 'admin');
--
-- create policy "Allow admins to update events"
-- on events for update
-- using ((auth.jwt() ->> 'role') = 'admin')
-- with check ((auth.jwt() ->> 'role') = 'admin');
--
-- create policy "Allow admins to delete events"
-- on events for delete
-- using ((auth.jwt() ->> 'role') = 'admin');
