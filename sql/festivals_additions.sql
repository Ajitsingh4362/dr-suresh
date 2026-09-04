-- Run this once in Supabase Dashboard -> SQL Editor
-- (safe to run even after sql/festivals.sql — same unique index prevents duplicates)
--
-- Adds more occasions on top of the original 13, so patients feel
-- remembered around more of the year. Two groups:
--
-- 1) Fixed national/professional days (year left NULL — repeat every year)
-- 2) 2026-specific Navratri/Diwali-season dates (tithi-based, so they only
--    apply to 2026 — add next year's dates when 2027 comes)
--
-- NOTE on accuracy: tithi-based dates (Saptami/Ashtami/Navami below) showed
-- a 1-day disagreement between panchang sources for 2026 (some say Ashtami
-- Oct 18, others Oct 19). The dates below use the sequential day-count
-- backward from the widely-confirmed Dussehra date (20 Oct 2026), which
-- matches several sources — but if your local panchang/pandit says
-- otherwise, edit these rows directly in Supabase (Table Editor ->
-- festivals) rather than trusting this blindly.

insert into festivals (name, month, day, year, message_template) values
  -- Fixed every year
  ('Gandhi Jayanti', 10, 2,  null, 'Hi {name}, on Gandhi Jayanti, Usha Multi Speciality Dental Clinic remembers Mahatma Gandhi''s message of health, discipline, and simple living. Wishing you well. 🙏'),
  ('Teachers'' Day',  9,  5,  null, 'Hi {name}, Happy Teachers'' Day! From all of us at Usha Multi Speciality Dental Clinic — grateful for everyone who taught us something along the way. 🍎'),
  ('Doctors'' Day',   7,  1,  null, 'Hi {name}, Happy Doctors'' Day! Dr. Suresh Kumar and the whole team at Usha Multi Speciality Dental Clinic thank you for trusting us with your care. 🦷'),
  ('Children''s Day', 11, 14, null, 'Hi {name}, Happy Children''s Day! Wishing all the little smiles (and the grown-ups who look after them) a wonderful day, from Usha Multi Speciality Dental Clinic. 🧒'),

  -- 2026 Navratri / Diwali season (update the year — or add fresh rows — for 2027)
  ('Maha Saptami',   10, 17, 2026, 'Hi {name}, wishing you and your family a blessed Maha Saptami! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Durga Ashtami',  10, 18, 2026, 'Hi {name}, wishing you and your family a blessed Durga Ashtami! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Maha Navami',    10, 19, 2026, 'Hi {name}, wishing you and your family a blessed Maha Navami! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Karva Chauth',   10, 29, 2026, 'Hi {name}, wishing you a very Happy Karva Chauth! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Dhanteras',      11, 6,  2026, 'Hi {name}, wishing you and your family a prosperous Dhanteras! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Choti Diwali',   11, 7,  2026, 'Hi {name}, wishing you a very Happy Choti Diwali (Narak Chaturdashi)! From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Bhai Dooj',      11, 11, 2026, 'Hi {name}, wishing you and your family a very Happy Bhai Dooj! From all of us at Usha Multi Speciality Dental Clinic.')
on conflict (name, month, day, coalesce(year, 0)) do nothing;
