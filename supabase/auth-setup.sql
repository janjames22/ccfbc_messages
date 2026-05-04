-- CCFBC Sunday Message Archive - Security Hardening
-- This script tightens security by requiring authentication for any modifications.

-- 1. Ensure RLS is enabled
alter table messages enable row level security;

-- 2. Public Read Access (Everyone can view)
drop policy if exists "Allow public read messages" on messages;
create policy "Allow public read messages"
on messages for select
using (true);

-- 3. Authenticated-only Write Access (Admins only)
drop policy if exists "Allow public insert messages for development" on messages;
drop policy if exists "Allow public update messages for development" on messages;
drop policy if exists "Allow public delete messages for development" on messages;

-- Policy: Allow authenticated users to insert messages
create policy "Allow authenticated insert messages"
on messages for insert
to authenticated
with check (true);

-- Policy: Allow authenticated users to update messages
create policy "Allow authenticated update messages"
on messages for update
to authenticated
using (true)
with check (true);

-- Policy: Allow authenticated users to delete messages
create policy "Allow authenticated delete messages"
on messages for delete
to authenticated
using (true);
