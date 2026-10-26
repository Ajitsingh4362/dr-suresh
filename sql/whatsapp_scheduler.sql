-- ============================================================================
-- WhatsApp: reliable scheduling + locking down the WhatsApp tables
-- Run in Supabase Dashboard -> SQL Editor. Read each step first.
-- ============================================================================
--
-- WHY: the WhatsApp service runs on Render's free tier, which goes to sleep
-- when nobody visits it. A sleeping server can't send 9 AM reminders. The
-- Supabase database never sleeps, so we let IT be the clock: every 10
-- minutes it pings the service (which keeps it awake / wakes it up), and
-- every 15 minutes during the day it asks the service to send whatever is
-- due. The service never sends anything twice, so extra calls are harmless.
--
-- BEFORE RUNNING STEP 2:
--   1. Render -> your WhatsApp service -> Environment:
--        CRON_SECRET = any long random text, e.g. usha-7f3k9q2x8m1p5v6
--      (save; Render redeploys)
--   2. Replace BOTH  PUT_YOUR_CRON_SECRET_HERE  below with that same text.
-- ============================================================================


-- ---------------------------------------------------------------------------
-- STEP 1: turn on the two built-in extensions (safe to run more than once)
-- ---------------------------------------------------------------------------
create extension if not exists pg_cron;
create extension if not exists pg_net;


-- ---------------------------------------------------------------------------
-- STEP 2: the schedule  (times below are UTC; India = UTC + 5:30)
-- ---------------------------------------------------------------------------

-- Remove older copies of these jobs if this file is run again
select cron.unschedule(jobname) from cron.job
 where jobname in ('whatsapp-keep-awake', 'whatsapp-run-due');

-- Every 10 minutes, all day: keeps the Render service awake.
select cron.schedule(
  'whatsapp-keep-awake',
  '*/10 * * * *',
  $$ select net.http_get(url := 'https://dr-suresh-whatsapp.onrender.com/status', timeout_milliseconds := 10000); $$
);

-- Every 15 minutes from 08:30 to 20:15 India time (03:00-14:59 UTC):
-- send whatever is due (reminders, birthdays, festivals, promo, feedback...).
-- The service itself only sends between 9 AM and 8 PM India time.
select cron.schedule(
  'whatsapp-run-due',
  '*/15 3-14 * * *',
  $$ select net.http_post(
       url := 'https://dr-suresh-whatsapp.onrender.com/run-due',
       headers := jsonb_build_object('Content-Type', 'application/json', 'X-Cron-Secret', 'PUT_YOUR_CRON_SECRET_HERE'),
       body := '{}'::jsonb,
       timeout_milliseconds := 10000
     ); $$
);

-- Check it worked (should list both jobs):
--   select jobname, schedule, active from cron.job;
-- See the last runs:
--   select * from cron.job_run_details order by start_time desc limit 20;


-- ---------------------------------------------------------------------------
-- STEP 3 (IMPORTANT - security): lock the WhatsApp tables
-- ---------------------------------------------------------------------------
-- whatsapp_auth holds the clinic's live WhatsApp login. The website's public
-- (anon) key is visible to anyone in the browser and in the GitHub repo. If
-- these tables have no row-level security, anyone could copy the session
-- and send messages as the clinic, or read patients' phone numbers from
-- the logs. The website never reads these tables; only the WhatsApp service
-- does, and it uses the service_role key, which is not affected by this.
--
-- ONLY RUN THIS AFTER: Render -> WhatsApp service -> Environment has
--   SUPABASE_SERVICE_ROLE_KEY = (Supabase -> Settings -> API -> service_role)
-- Without that key the WhatsApp service falls back to the public key and
-- would stop working after this step.

alter table whatsapp_auth enable row level security;
alter table whatsapp_message_log enable row level security;
alter table whatsapp_notification_log enable row level security;
-- No policies on purpose: public/anon access gets nothing; service_role still works.
