-- Admin-entered business data: every change to extras, locations, delivery zones, settings and the USD rate is kept
-- in the audit log with who made it. Rates, discounts, vehicles and classes already had audit triggers.
do $$
declare
  t text;
begin
  foreach t in array array['extras', 'locations', 'delivery_zones', 'settings', 'exchange_rates'] loop
    execute format(
      'create trigger %I after insert or update or delete on %I for each row execute function write_audit()',
      t || '_audit', t
    );
  end loop;
end;
$$;

-- Where alerts about new enquiries are sent. Empty means no alert.
insert into settings (key, value) values ('staff_alert_email', '""')
on conflict (key) do nothing;
