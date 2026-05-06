-- CCFBC Prayer Requests
-- Run this in Supabase SQL editor for the Prayer Request feature.

create table if not exists prayer_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  request text not null,
  category text,
  privacy text default 'private',
  is_answered boolean default false,
  created_at timestamptz default now(),
  constraint prayer_requests_privacy_check check (privacy in ('public', 'private'))
);

create index if not exists prayer_requests_created_at_idx
on prayer_requests (created_at);

create index if not exists prayer_requests_privacy_idx
on prayer_requests (privacy);

alter table prayer_requests enable row level security;

drop policy if exists "Allow public prayer request insert" on prayer_requests;
create policy "Allow public prayer request insert"
on prayer_requests for insert
with check (true);

drop policy if exists "Allow public read public prayer requests" on prayer_requests;
create policy "Allow public read public prayer requests"
on prayer_requests for select
using (privacy = 'public');

-- Public users must not update or delete prayer requests.
-- Add admin-only policies here later when role claims or an admin profile table are available.
-- Example direction:
-- create policy "Allow admins to manage prayer requests"
-- on prayer_requests for all
-- using ((auth.jwt() ->> 'role') = 'admin')
-- with check ((auth.jwt() ->> 'role') = 'admin');
