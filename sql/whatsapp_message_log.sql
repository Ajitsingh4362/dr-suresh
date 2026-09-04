-- Run this once in Supabase Dashboard -> SQL Editor
--
-- Records every WhatsApp send attempt — from the admin panel's manual
-- actions (booking confirmation, appointment confirmation, welcome message,
-- prescriptions, invoices) AND from the automatic daily/periodic checks
-- (reminders, birthdays, festivals, feedback requests, follow-ups) — so the
-- admin panel's WhatsApp tab can show a "View Log" of what went out, what
-- failed, and what was skipped (and why).
create table if not exists whatsapp_message_log (
  id bigserial primary key,
  created_at timestamptz default now(),
  recipient_number text,
  recipient_name text,
  message_type text,     -- e.g. 'booking_confirmation', 'appointment_confirmation', 'welcome',
                          -- 'prescription', 'invoice', 'appointment_reminder', 'follow_up',
                          -- 'birthday', 'festival:<name>', 'feedback_request', 'resolution_followup'
  status text not null,  -- 'sent' | 'failed' | 'skipped'
  reason text            -- error message, or skip reason (e.g. 'already sent today', 'not connected')
);

-- Lets the admin panel fetch the most recent entries quickly.
create index if not exists whatsapp_message_log_created_at_idx
  on whatsapp_message_log (created_at desc);
