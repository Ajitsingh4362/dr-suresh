-- Run this once in Supabase Dashboard -> SQL Editor
-- Stores the WhatsApp (Baileys) session so it survives Render free-tier restarts.
create table if not exists whatsapp_auth (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
