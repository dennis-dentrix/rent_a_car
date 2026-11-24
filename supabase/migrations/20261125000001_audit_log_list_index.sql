-- The admin's audit page lists the log newest first, and every list is created_at desc, id desc.
create index audit_log_created_idx on audit_log (created_at desc, id desc);
