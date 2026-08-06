-- Run this once in Supabase Dashboard -> SQL Editor
create table if not exists admin_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  device_name text,
  browser text,
  os text,
  ip text,
  city text,
  region text,
  country text,
  created_at timestamptz default now(),
  last_seen_at timestamptz default now(),
  revoked boolean default false
);

alter table admin_sessions enable row level security;

drop policy if exists "authenticated users can manage own sessions" on admin_sessions;
create policy "authenticated users can manage own sessions"
on admin_sessions for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
