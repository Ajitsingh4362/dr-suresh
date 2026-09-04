-- Run this once in Supabase Dashboard -> SQL Editor
--
-- Adds tracking so each patient_consultations row remembers whether its
-- automatic post-visit feedback request (5 hours after entry) and
-- resolution follow-up (7 days after entry) have already been sent —
-- without this, the periodic check below would send them again on every run.
--
-- Assumes patient_consultations already has a `created_at timestamptz`
-- column (Supabase's default on every new table). If your table's entry
-- timestamp has a different name, tell Claude and the check queries below
-- need that column name swapped in.
alter table patient_consultations add column if not exists feedback_sent_at timestamptz;
alter table patient_consultations add column if not exists resolution_followup_sent_at timestamptz;
