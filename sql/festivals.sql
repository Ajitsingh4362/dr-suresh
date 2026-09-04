-- Run this once in Supabase Dashboard -> SQL Editor
--
-- Moves festival dates out of the code and into the database, so festival
-- dates/messages can be added or corrected every year from Supabase
-- directly — no code change or redeploy needed.
create table if not exists festivals (
  id bigserial primary key,
  name text not null,
  month int not null check (month between 1 and 12),
  day int not null check (day between 1 and 31),
  year int,                        -- NULL = repeats every year (e.g. New Year, Christmas).
                                    -- A specific number = only valid that year (most Indian
                                    -- festivals are lunar/lunisolar, so their Gregorian date
                                    -- changes every year — add next year's row when it comes).
  message_template text not null,  -- English wish. Use literal {name} where the patient's
                                    -- name should be inserted — the code replaces it.
  active boolean not null default true,
  created_at timestamptz default now()
);

-- Prevents this script from creating duplicate rows if it's ever run more
-- than once (treats a NULL year the same as any other value for this check).
create unique index if not exists festivals_unique_date
  on festivals (name, month, day, coalesce(year, 0));

-- Seed with the festivals that were previously hardcoded in index.js.
insert into festivals (name, month, day, year, message_template) values
  ('New Year',         1,  1,  null, 'Hi {name}, Usha Multi Speciality Dental Clinic wishes you a very Happy New Year! 🎉 May this year bring you good health and happy smiles.'),
  ('Makar Sankranti',  1,  14, null, 'Hi {name}, wishing you and your family a very Happy Makar Sankranti! 🪁 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Republic Day',     1,  26, null, 'Hi {name}, wishing you a very Happy Republic Day! 🇮🇳 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Independence Day', 8,  15, null, 'Hi {name}, wishing you a very Happy Independence Day! 🇮🇳 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Christmas',        12, 25, null, 'Hi {name}, wishing you and your family a very Merry Christmas! 🎄 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Eid-e-Milad',      8,  26, 2026, 'Hi {name}, wishing you and your family a blessed Eid-e-Milad! 🌙 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Raksha Bandhan',   8,  28, 2026, 'Hi {name}, wishing you and your family a very Happy Raksha Bandhan! 🎀 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Janmashtami',      9,  4,  2026, 'Hi {name}, wishing you and your family a very Happy Janmashtami! 🦚 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Ganesh Chaturthi', 9,  14, 2026, 'Hi {name}, wishing you and your family a very Happy Ganesh Chaturthi! 🐘 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Dussehra',         10, 20, 2026, 'Hi {name}, wishing you and your family a very Happy Dussehra! 🏹 From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Diwali',           11, 8,  2026, 'Hi {name}, wishing you and your family a very Happy Diwali! ✨🪔 May this festival of lights bring joy, prosperity, and good health to your home. From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Chhath Puja',      11, 15, 2026, 'Hi {name}, wishing you and your family a blessed Chhath Puja! 🙏 May Chhathi Maiya bless your family with health and happiness. From all of us at Usha Multi Speciality Dental Clinic.'),
  ('Holi',             3,  22, 2027, 'Hi {name}, wishing you and your family a very Happy Holi! 🌈 From all of us at Usha Multi Speciality Dental Clinic.')
on conflict (name, month, day, coalesce(year, 0)) do nothing;
