-- ─────────────────────────────────────────────────────────────
-- Adds a unique, human-readable Patient ID (e.g. UMDC-P-000001)
-- to the `patients` table. Run this once in the Supabase SQL
-- Editor. Safe to re-run (uses IF NOT EXISTS / idempotent checks).
-- ─────────────────────────────────────────────────────────────

-- 1) Add the column (nullable for now, filled in below, then locked)
alter table patients add column if not exists patient_code text;

-- 2) Sequence that drives the running number
create sequence if not exists patient_code_seq;

-- 3) Helper to format the code
create or replace function generate_patient_code() returns text
language plpgsql as $$
declare
  next_val bigint;
begin
  next_val := nextval('patient_code_seq');
  return 'UMDC-P-' || lpad(next_val::text, 6, '0');
end;
$$;

-- 4) Trigger: auto-assign a code to every NEW patient row
create or replace function set_patient_code() returns trigger
language plpgsql as $$
begin
  if new.patient_code is null then
    new.patient_code := generate_patient_code();
  end if;
  return new;
end;
$$;

drop trigger if exists trg_set_patient_code on patients;
create trigger trg_set_patient_code
before insert on patients
for each row execute function set_patient_code();

-- 5) Backfill EXISTING patients (oldest first, so patient #1 is your
--    longest-standing patient). Only touches rows that don't have a
--    code yet, so it's safe to re-run.
do $$
declare
  r record;
begin
  for r in select id from patients where patient_code is null order by created_at asc
  loop
    update patients set patient_code = generate_patient_code() where id = r.id;
  end loop;
end;
$$;

-- 6) Now that every row has a code, enforce uniqueness + not-null
--    and index it for fast lookup/search.
alter table patients alter column patient_code set not null;
create unique index if not exists idx_patients_patient_code on patients(patient_code);
