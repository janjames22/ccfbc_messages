-- CCFBC Sunday Message Archive Schema
-- WARNING: Public insert/update/delete policies are for development only.
-- Replace these with admin authentication (e.g., Supabase Auth) before production use.

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  speaker text,
  service_date date not null,
  main_verse_reference text,
  main_verse_text text,
  bible_version text default 'ESV',
  summary text,
  key_points jsonb default '[]'::jsonb,
  full_notes text,
  reflection_questions jsonb default '[]'::jsonb,
  related_verses jsonb default '[]'::jsonb,
  category text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table messages enable row level security;

-- Policy: Allow public read messages
drop policy if exists "Allow public read messages" on messages;
create policy "Allow public read messages"
on messages for select
using (true);

-- Policy: Allow public insert messages (Development Only)
drop policy if exists "Allow public insert messages for development" on messages;
create policy "Allow public insert messages for development"
on messages for insert
with check (true);

-- Policy: Allow public update messages (Development Only)
drop policy if exists "Allow public update messages for development" on messages;
create policy "Allow public update messages for development"
on messages for update
using (true)
with check (true);

-- Policy: Allow public delete messages (Development Only)
drop policy if exists "Allow public delete messages for development" on messages;
create policy "Allow public delete messages for development"
on messages for delete
using (true);
