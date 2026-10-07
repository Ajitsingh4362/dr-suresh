-- Removes leftovers of the reverted 7-Oct patient portal attempt:
-- any trigger/function that writes to patient_visit_history, then the table.
do $$
declare r record;
begin
  for r in
    select t.tgname, c.relname as tbl
      from pg_trigger t
      join pg_class c on c.oid = t.tgrelid
      join pg_namespace n on n.oid = c.relnamespace
      join pg_proc p on p.oid = t.tgfoid
     where not t.tgisinternal and n.nspname = 'public' and p.prokind = 'f'
       and pg_get_functiondef(p.oid) ilike '%patient_visit_history%'
  loop
    execute format('drop trigger if exists %I on public.%I', r.tgname, r.tbl);
    raise notice 'Removed trigger % on %', r.tgname, r.tbl;
  end loop;

  for r in
    select p.oid::regprocedure::text as sig
      from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prokind = 'f'
       and pg_get_functiondef(p.oid) ilike '%patient_visit_history%'
  loop
    execute 'drop function if exists ' || r.sig || ' cascade';
    raise notice 'Removed function %', r.sig;
  end loop;
end $$;

drop table if exists public.patient_visit_history cascade;
