-- The admin now lists drivers, newest first.
create index drivers_created_idx on drivers (created_at desc, id desc);
