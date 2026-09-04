-- Run this once in Supabase Dashboard -> SQL Editor
--
-- Why: Render's free tier spins the notifier service down after 15 minutes
-- of no traffic, so the daily 9 AM checks (appointment reminders, follow-ups,
-- birthdays, festivals) can miss their scheduled time if the service was
-- asleep. The fix is to also let an external scheduler call the /check-*
-- endpoints directly as a backup (see whatsapp-notifier/README.md).
--
-- That means a check could now run more than once on the same day (once
-- from the internal 9 AM cron, once from the external backup call). This
-- table stops that from turning into a duplicate WhatsApp message: before
-- sending, the code tries to insert a row here; if a row already exists for
-- that entity + notification type + day, it skips sending instead.
create table if not exists whatsapp_notification_log (
  id bigserial primary key,
  entity_type text not null,        -- 'appointment' | 'patient'
  entity_id text not null,          -- appointments.id or patients.id
  notification_type text not null,  -- 'appointment_reminder' | 'birthday' | 'festival:<name>'
  sent_date date not null,
  created_at timestamptz default now(),
  unique (entity_type, entity_id, notification_type, sent_date)
);
