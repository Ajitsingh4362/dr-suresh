-- ─────────────────────────────────────────────────────────────
-- PATIENT DASHBOARD: "Pay remaining amount" via UPI
--
-- Builds a UPI payment link (opens PhonePe / Google Pay / Paytm with the
-- amount already filled) for a logged-in patient's own unpaid bill.
-- The clinic's UPI ID lives ONLY here in the database — it is never in
-- the website code and never shown on the dashboard.
--
-- Requires sql/patient_portal.sql to have been run first.
-- Run once in Supabase -> SQL Editor. Safe to re-run.
-- To change the UPI ID later, edit v_upi_id below and run again.
-- ─────────────────────────────────────────────────────────────

create or replace function patient_portal_payment_link(p_token uuid, p_invoice_id uuid)
returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  v_upi_id   constant text := '7255049328-3@ybl';
  v_payee    constant text := 'Usha Dental Clinic';
  v_pid uuid := portal_patient_from_token(p_token);
  v_inv patient_invoices%rowtype;
  v_code text;
  v_due numeric;
  v_note text;
begin
  if v_pid is null then
    return jsonb_build_object('ok', false, 'error', 'session_expired');
  end if;

  select * into v_inv from patient_invoices where id = p_invoice_id and patient_id = v_pid;
  if v_inv.id is null then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  v_due := round(greatest(coalesce(v_inv.total_amount, 0) - coalesce(v_inv.paid_amount, 0), 0), 2);
  if v_due <= 0 then
    return jsonb_build_object('ok', false, 'error', 'already_paid');
  end if;

  select patient_code into v_code from patients where id = v_pid;
  -- Short note shown in the UPI app / bank statement (letters, digits, space, dash only)
  v_note := left(regexp_replace(
    'Bill ' || coalesce(v_inv.invoice_number, '') || ' ' || coalesce(v_code, ''),
    '[^A-Za-z0-9 -]', '', 'g'), 50);

  return jsonb_build_object(
    'ok', true,
    'amount', v_due,
    'invoice_number', v_inv.invoice_number,
    'upi_url',
      'upi://pay?pa=' || v_upi_id
      || '&pn=' || replace(v_payee, ' ', '%20')
      || '&am=' || to_char(v_due, 'FM9999999990.00')
      || '&cu=INR'
      || '&tn=' || replace(trim(v_note), ' ', '%20')
  );
end;
$$;

grant execute on function patient_portal_payment_link(uuid, uuid) to anon, authenticated;
