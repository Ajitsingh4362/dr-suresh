-- Run this once in Supabase Dashboard -> SQL Editor
--
-- A single editable row holding the twice-a-month promotional message sent
-- to every active patient (1st and 15th). Kept separate from `festivals`
-- since this isn't tied to a specific date each year — it's meant to be
-- updated periodically (e.g. change the offer each month) directly from
-- Supabase, no code change or redeploy needed.
create table if not exists monthly_promo (
  id int primary key default 1,
  message_template text not null,  -- use the literal text {name} where the patient's name goes
  active boolean not null default true,
  updated_at timestamptz default now(),
  constraint monthly_promo_singleton check (id = 1)  -- only one row, ever
);

insert into monthly_promo (id, message_template) values (
  1,
  'Hi {name}, a quick reminder from Usha Multi Speciality Dental Clinic (Dr. Suresh Kumar) — Sitamarhi''s trusted dental care destination. We''re offering a FREE dental checkup this month! Book your slot on WhatsApp anytime.'
)
on conflict (id) do nothing;

-- To change the offer/tip later, just update this row in Supabase's Table
-- Editor (or run: update monthly_promo set message_template = '...' where id = 1;)
-- To pause it temporarily without deleting anything: update monthly_promo set active = false where id = 1;
