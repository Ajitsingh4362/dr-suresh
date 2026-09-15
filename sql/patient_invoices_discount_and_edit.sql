-- Run this once in Supabase Dashboard -> SQL Editor
--
-- Adds discount tracking to patient_invoices so the admin panel's new
-- "Edit Invoice" flow can apply/adjust a discount and keep an audit trail
-- of when an invoice was last edited (separate from its original creation
-- time, which Supabase already tracks via created_at).
--
-- total_amount continues to mean "final billed amount after discount" —
-- existing Analytics/Billing calculations (due = total_amount - paid_amount)
-- keep working unchanged.
alter table patient_invoices add column if not exists discount_amount numeric not null default 0;
alter table patient_invoices add column if not exists discount_reason text;
alter table patient_invoices add column if not exists last_edited_at timestamptz;
