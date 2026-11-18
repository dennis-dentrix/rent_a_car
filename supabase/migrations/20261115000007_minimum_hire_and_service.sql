-- Minimum hire is 2 days for rentals; an airport transfer can be one day (owner decision, 15 November 2026).
insert into settings (key, value) values ('minimum_hire_days', '2')
on conflict (key) do update set value = excluded.value;

alter table quotes
  add column service text not null default 'rental' check (service in ('rental', 'airport_transfer'));
