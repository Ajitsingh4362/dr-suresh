-- ─────────────────────────────────────────────────────────────
-- Lets a patient pay one invoice in multiple installments, each
-- with its own date. `patient_invoices.paid_amount` and `.status`
-- are then kept in sync AUTOMATICALLY by a database trigger —
-- the app never has to compute the total itself.
--
-- Run this once in the Supabase Dashboard -> SQL Editor.
-- Safe to re-run.
-- ─────────────────────────────────────────────────────────────

-- 1) One row per installment payment
create table if not exists patient_invoice_payments (
  id uuid primary key default gen_random_uuid(),
  invoice_id uuid not null references patient_invoices(id) on delete cascade,
  amount numeric not null check (amount > 0),
  paid_on date not null default current_date,
  note text,
  created_at timestamptz not null default now()
);

create index if not exists idx_invoice_payments_invoice_id on patient_invoice_payments(invoice_id);

-- 2) Trigger function: whenever a payment is added / edited / removed,
--    recompute the parent invoice's paid_amount (sum of all its
--    installments, capped at the total) and its status.
create or replace function recalc_invoice_paid_amount() returns trigger
language plpgsql as $$
declare
  v_invoice_id uuid;
  v_total numeric;
  v_paid numeric;
begin
  v_invoice_id := coalesce(new.invoice_id, old.invoice_id);

  select coalesce(sum(amount), 0) into v_paid
    from patient_invoice_payments where invoice_id = v_invoice_id;

  select total_amount into v_total
    from patient_invoices where id = v_invoice_id;

  update patient_invoices
    set paid_amount = least(v_paid, v_total),
        status = case
          when v_paid >= v_total then 'paid'
          when v_paid > 0 then 'partial'
          else 'unpaid'
        end
    where id = v_invoice_id;

  return null;
end;
$$;

drop trigger if exists trg_recalc_invoice_paid_amount on patient_invoice_payments;
create trigger trg_recalc_invoice_paid_amount
after insert or update or delete on patient_invoice_payments
for each row execute function recalc_invoice_paid_amount();

-- 3) Backfill: turn each invoice's existing paid_amount (recorded
--    before installments existed) into its first payment entry,
--    dated the invoice's own date — so nothing is lost and the
--    running total stays exactly the same as it is today.
insert into patient_invoice_payments (invoice_id, amount, paid_on, note)
select id, paid_amount, date, 'Earlier payment (migrated)'
from patient_invoices
where paid_amount > 0
  and not exists (
    select 1 from patient_invoice_payments where invoice_id = patient_invoices.id
  );
