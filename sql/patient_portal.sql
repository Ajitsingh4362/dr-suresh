-- ─────────────────────────────────────────────────────────────
-- PATIENT PORTAL (Patient Dashboard)
--
-- Patient login:  Patient ID (e.g. UMDC-P-000123)
--                 Password = last 4 digits of registered mobile
--
-- Patients NEVER read the tables directly. Everything goes through
-- the SECURITY DEFINER functions below, which only ever return the
-- logged-in patient's own data. So your existing table permissions
-- (RLS) stay exactly as they are.
--
-- Run this once in Supabase Dashboard -> SQL Editor. Safe to re-run.
-- Requires: sql/patient_unique_id.sql already run (patient_code).
-- ─────────────────────────────────────────────────────────────

-- 1) Login sessions (one row per logged-in device)
create table if not exists patient_portal_sessions (
  token uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id) on delete cascade,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 days'
);
create index if not exists idx_portal_sessions_patient on patient_portal_sessions(patient_id);

-- 2) Login attempts (to block password guessing: 5 wrong tries = 15 min lock)
create table if not exists patient_portal_login_attempts (
  id bigserial primary key,
  patient_code text not null,
  success boolean not null,
  attempted_at timestamptz not null default now()
);
create index if not exists idx_portal_attempts_code_time on patient_portal_login_attempts(patient_code, attempted_at desc);

-- Lock both tables: no direct access from the website at all.
alter table patient_portal_sessions enable row level security;
alter table patient_portal_login_attempts enable row level security;
revoke all on patient_portal_sessions from anon, authenticated;
revoke all on patient_portal_login_attempts from anon, authenticated;

-- 3) Helper: normalise what the patient types into a full patient code.
--    "umdc-p-000123", "UMDC-P-000123", "000123" and "123" all work.
create or replace function portal_normalize_code(p_input text) returns text
language sql immutable as $$
  select case
    when regexp_replace(coalesce(p_input, ''), '\s', '', 'g') ~ '^[0-9]+$'
      then 'UMDC-P-' || lpad(regexp_replace(p_input, '\s', '', 'g'), 6, '0')
    else upper(regexp_replace(coalesce(p_input, ''), '\s', '', 'g'))
  end;
$$;

-- 4) Helper: resolve a session token to a patient id (null if invalid/expired)
create or replace function portal_patient_from_token(p_token uuid) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_patient uuid;
begin
  select patient_id into v_patient
    from patient_portal_sessions
   where token = p_token and expires_at > now();
  if v_patient is not null then
    update patient_portal_sessions set last_seen_at = now() where token = p_token;
  end if;
  return v_patient;
end;
$$;
revoke all on function portal_patient_from_token(uuid) from public, anon, authenticated;

-- 5) LOGIN
create or replace function patient_portal_login(p_patient_code text, p_password text)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_code text := portal_normalize_code(p_patient_code);
  v_pass text := regexp_replace(coalesce(p_password, ''), '\D', '', 'g');
  v_patient patients%rowtype;
  v_fails int;
  v_token uuid;
begin
  if v_code = '' or v_pass = '' then
    return jsonb_build_object('ok', false, 'error', 'missing');
  end if;

  select count(*) into v_fails
    from patient_portal_login_attempts
   where patient_code = v_code and success = false
     and attempted_at > now() - interval '15 minutes';
  if v_fails >= 5 then
    return jsonb_build_object('ok', false, 'error', 'locked');
  end if;

  select * into v_patient from patients where upper(patient_code) = v_code limit 1;

  if v_patient.id is null
     or length(regexp_replace(coalesce(v_patient.phone, ''), '\D', '', 'g')) < 4
     or right(regexp_replace(v_patient.phone, '\D', '', 'g'), 4) <> v_pass then
    insert into patient_portal_login_attempts (patient_code, success) values (v_code, false);
    return jsonb_build_object('ok', false, 'error', 'invalid');
  end if;

  insert into patient_portal_login_attempts (patient_code, success) values (v_code, true);
  delete from patient_portal_sessions where expires_at < now();
  insert into patient_portal_sessions (patient_id) values (v_patient.id) returning token into v_token;

  return jsonb_build_object(
    'ok', true,
    'token', v_token,
    'name', v_patient.name,
    'patient_code', v_patient.patient_code
  );
end;
$$;

-- 6) LOGOUT
create or replace function patient_portal_logout(p_token uuid) returns void
language sql security definer set search_path = public as $$
  delete from patient_portal_sessions where token = p_token;
$$;

-- 7) DASHBOARD DATA (profile, medicines/prescriptions, billing, reports, appointments)
create or replace function patient_portal_data(p_token uuid) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_pid uuid := portal_patient_from_token(p_token);
  v_phone10 text;
  v_result jsonb;
begin
  if v_pid is null then
    return jsonb_build_object('ok', false, 'error', 'session_expired');
  end if;

  select right(regexp_replace(coalesce(phone, ''), '\D', '', 'g'), 10) into v_phone10
    from patients where id = v_pid;

  select jsonb_build_object(
    'ok', true,
    'patient', (
      select jsonb_build_object(
        'id', p.id, 'patient_code', p.patient_code, 'name', p.name, 'phone', p.phone,
        'email', p.email, 'age', p.age, 'gender', p.gender, 'blood_group', p.blood_group,
        'address', p.address, 'occupation', p.occupation, 'referred_by', p.referred_by,
        'status', p.status, 'created_at', p.created_at
      ) from patients p where p.id = v_pid
    ),
    'medical', (
      select to_jsonb(m) - 'patient_id'
        from patient_medical_history m where m.patient_id = v_pid limit 1
    ),
    'consultations', coalesce((
      select jsonb_agg(to_jsonb(c) order by c.date desc nulls last)
        from patient_consultations c where c.patient_id = v_pid
    ), '[]'::jsonb),
    'invoices', coalesce((
      select jsonb_agg(
        to_jsonb(i) || jsonb_build_object('payments', coalesce((
          select jsonb_agg(to_jsonb(pp) order by pp.paid_on desc)
            from patient_invoice_payments pp where pp.invoice_id = i.id
        ), '[]'::jsonb))
        order by i.date desc nulls last)
        from patient_invoices i where i.patient_id = v_pid
    ), '[]'::jsonb),
    'documents', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', d.id, 'name', d.name, 'file_url', d.file_url,
        'file_type', d.file_type, 'created_at', d.created_at
      ) order by d.created_at desc)
        from patient_documents d where d.patient_id = v_pid
    ), '[]'::jsonb),
    'appointments', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', a.id, 'service', a.service, 'message', a.message,
        'preferred_date', a.preferred_date, 'preferred_time', a.preferred_time,
        'status', a.status, 'created_at', a.created_at
      ) order by a.created_at desc)
        from appointments a
       where a.patient_id = v_pid
          or (length(v_phone10) = 10
              and right(regexp_replace(coalesce(a.phone, ''), '\D', '', 'g'), 10) = v_phone10)
    ), '[]'::jsonb)
  ) into v_result;

  return v_result;
end;
$$;

-- 8) BOOK A NEW APPOINTMENT from the dashboard
create or replace function patient_portal_book_appointment(
  p_token uuid, p_service text, p_message text, p_preferred_date date, p_preferred_time text
) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_pid uuid := portal_patient_from_token(p_token);
  v_patient patients%rowtype;
  v_today_count int;
  v_id uuid;
begin
  if v_pid is null then
    return jsonb_build_object('ok', false, 'error', 'session_expired');
  end if;
  if p_preferred_date is not null and p_preferred_date < (now() at time zone 'Asia/Kolkata')::date then
    return jsonb_build_object('ok', false, 'error', 'past_date');
  end if;

  -- Spam guard: max 3 requests per patient per day
  select count(*) into v_today_count from appointments
   where patient_id = v_pid and created_at > now() - interval '1 day';
  if v_today_count >= 3 then
    return jsonb_build_object('ok', false, 'error', 'too_many');
  end if;

  select * into v_patient from patients where id = v_pid;

  insert into appointments (patient_id, name, phone, email, service, message, preferred_date, preferred_time, status)
  values (
    v_pid, v_patient.name, v_patient.phone, v_patient.email,
    nullif(left(trim(coalesce(p_service, '')), 200), ''),
    'Booked from Patient Dashboard (' || v_patient.patient_code || ')'
      || case when nullif(trim(coalesce(p_message, '')), '') is not null
              then E'\n' || left(trim(p_message), 1000) else '' end,
    p_preferred_date,
    nullif(left(trim(coalesce(p_preferred_time, '')), 40), ''),
    'pending'
  ) returning id into v_id;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

-- 9) Who can call what: the website (anon) can call ONLY these 4.
grant execute on function patient_portal_login(text, text) to anon, authenticated;
grant execute on function patient_portal_logout(uuid) to anon, authenticated;
grant execute on function patient_portal_data(uuid) to anon, authenticated;
grant execute on function patient_portal_book_appointment(uuid, text, text, date, text) to anon, authenticated;

-- 10) REPORT FILES (X-rays, scans etc. in the private 'patient-documents' bucket)
--     A logged-in patient may open ONLY files inside their own folder
--     (uploads are stored as "<patient_id>/<file>"). The website sends
--     the session token in the 'x-portal-token' header.
create or replace function portal_can_read_object(p_name text) returns boolean
language plpgsql stable security definer set search_path = public as $$
declare
  v_token_text text;
  v_token uuid;
  v_pid uuid;
begin
  begin
    v_token_text := current_setting('request.headers', true)::json ->> 'x-portal-token';
    v_token := v_token_text::uuid;
  exception when others then
    return false;
  end;
  if v_token is null then return false; end if;

  select patient_id into v_pid from patient_portal_sessions
   where token = v_token and expires_at > now();
  if v_pid is null then return false; end if;

  return split_part(p_name, '/', 1) = v_pid::text;
end;
$$;
grant execute on function portal_can_read_object(text) to anon, authenticated;

drop policy if exists "Portal patients can view own documents" on storage.objects;
create policy "Portal patients can view own documents"
on storage.objects for select
to anon
using (bucket_id = 'patient-documents' and portal_can_read_object(name));
