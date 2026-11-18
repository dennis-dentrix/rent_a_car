-- Enumerated types and shared helpers. See docs/database-design.md section 1.
create extension if not exists btree_gist;

create type user_role as enum ('customer', 'corporate_approver', 'staff', 'admin');
create type booking_status as enum (
  'quoted', 'pending_payment', 'confirmed', 'ready', 'active', 'returned', 'closed', 'cancelled', 'expired'
);
create type handover_type as enum ('office', 'delivery');
create type vehicle_status as enum ('active', 'maintenance', 'retired');
create type payment_method as enum ('mpesa', 'card', 'bank');
create type payment_status as enum ('pending', 'succeeded', 'failed', 'cancelled');
create type payment_kind as enum ('deposit', 'balance', 'security_deposit');
create type refund_status as enum ('requested', 'approved', 'rejected', 'paid');
create type document_type as enum ('national_id', 'driving_licence', 'agreement', 'receipt');
create type document_status as enum ('uploaded', 'verified', 'rejected', 'replaced');
create type delivery_status as enum ('scheduled', 'out_for_delivery', 'completed', 'failed');
create type tax_receipt_status as enum ('none', 'pending', 'submitted', 'failed');
create type enquiry_source as enum ('whatsapp', 'phone', 'form');

create function set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Blocks updates and deletes on append-only tables.
create function block_changes() returns trigger
language plpgsql as $$
begin
  raise exception '% is append-only', tg_table_name;
end;
$$;
