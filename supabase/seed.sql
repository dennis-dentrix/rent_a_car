-- Local development seed. No real personal data. Rates and fees are illustrative only.
insert into vehicle_classes (id, name, slug, seats, luggage_capacity, description, best_for, sort_order) values
  ('11111111-1111-4111-8111-000000000001', 'Executive Sedan', 'executive-sedan', 4, 3, 'Comfortable sedan for business travel.', '{airport transfers,executive travel}', 1),
  ('11111111-1111-4111-8111-000000000002', 'Executive SUV', 'executive-suv', 6, 5, 'Spacious SUV for families and long trips.', '{long-distance,executive travel}', 2),
  ('11111111-1111-4111-8111-000000000003', 'Minibus', 'minibus', 14, 10, 'Group transport and events.', '{events,groups}', 3);

insert into vehicle_owners (id, owner_type, full_name, phone, email, kra_pin) values
  ('66666666-6666-4666-8666-000000000001', 'individual', 'Test Owner', '+254711000001', 'owner@example.test', 'A000000000Z');
insert into vehicle_owner_private (owner_id, national_id_number, payout_method, payout_account, payout_account_name) values
  ('66666666-6666-4666-8666-000000000001', '00000000', 'mpesa', '+254711000001', 'Test Owner');

insert into vehicles (id, registration, chassis_number, make, model, year, class_id, owner_id) values
  ('77777777-7777-4777-8777-000000000001', 'KAA 001A', 'TESTCHASSIS0000001', 'Toyota', 'Camry', 2024, '11111111-1111-4111-8111-000000000001', null),
  ('77777777-7777-4777-8777-000000000002', 'KAA 002A', 'TESTCHASSIS0000002', 'Toyota', 'Camry', 2024, '11111111-1111-4111-8111-000000000001', null),
  ('77777777-7777-4777-8777-000000000003', 'KAA 003A', 'TESTCHASSIS0000003', 'Toyota', 'Prado', 2024, '11111111-1111-4111-8111-000000000002', null),
  ('77777777-7777-4777-8777-000000000004', 'KAA 004A', 'TESTCHASSIS0000004', 'Toyota', 'Hiace', 2023, '11111111-1111-4111-8111-000000000003', null);

-- The Hiace is a partner vehicle: rented out on behalf of the private owner above.
insert into ownership_agreements (owner_id, vehicle_id, commission_percent, starts_on) values
  ('66666666-6666-4666-8666-000000000001', '77777777-7777-4777-8777-000000000004', 20, '2026-01-01');

insert into vehicle_trackers (vehicle_id, provider, model, device_id, sim_number, installed_on, subscription_expires_on) values
  ('77777777-7777-4777-8777-000000000001', 'Test Telematics', 'TT-100', 'TESTIMEI000000001', '+254722000001', '2026-01-10', '2027-01-10'),
  ('77777777-7777-4777-8777-000000000004', 'Test Telematics', 'TT-100', 'TESTIMEI000000004', '+254722000004', '2026-01-10', '2027-01-10');

insert into rates (class_id, price_kes, effective_from) values
  ('11111111-1111-4111-8111-000000000001', 12500, '2026-01-01'),
  ('11111111-1111-4111-8111-000000000002', 18000, '2026-01-01'),
  ('11111111-1111-4111-8111-000000000003', 25000, '2026-01-01');

insert into locations (id, name, type, address, latitude, longitude, entrance_note, slug) values
  ('22222222-2222-4222-8222-000000000001', 'Nairobi Office', 'office', 'Westlands, Nairobi', -1.264100, 36.802900, 'Ground floor reception.', 'nairobi-office'),
  ('22222222-2222-4222-8222-000000000002', 'JKIA Airport Desk', 'airport', 'Jomo Kenyatta International Airport, Nairobi', -1.319200, 36.927400, 'Arrivals hall, meet-and-greet desk.', 'jkia-airport'),
  ('22222222-2222-4222-8222-000000000003', 'Nairobi', 'city', 'Nairobi, Kenya', -1.286389, 36.817223, null, 'nairobi');

insert into delivery_zones (id, name, fee_kes) values
  ('33333333-3333-4333-8333-000000000001', 'Nairobi CBD', 1000),
  ('33333333-3333-4333-8333-000000000002', 'Nairobi suburbs', 1500),
  ('33333333-3333-4333-8333-000000000003', 'Airport', 2000);

insert into extras (id, name, price_kes, pricing_type) values
  ('44444444-4444-4444-8444-000000000001', 'Chauffeur', 2000, 'per_day'),
  ('44444444-4444-4444-8444-000000000002', 'Child seat', 500, 'per_day'),
  ('44444444-4444-4444-8444-000000000003', 'Airport meet and greet', 1500, 'per_booking');

insert into discounts (id, label, min_days, kind, value, effective_from) values
  ('55555555-5555-4555-8555-000000000001', 'Weekly 10%', 7, 'percent', 10, '2026-01-01'),
  ('55555555-5555-4555-8555-000000000002', 'Monthly 15%', 30, 'percent', 15, '2026-01-01'),
  ('55555555-5555-4555-8555-000000000003', 'KES 5,000 off long hire', 14, 'fixed', 5000, '2026-01-01');

insert into exchange_rates (currency, rate_to_kes, rate_date) values ('USD', 129.000000, '2026-11-15');

-- Local test accounts. Fake credentials for local development only; never used outside the local stack.
-- All four use the password 'Passw0rd!local'.
insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer@example.test', crypt('Passw0rd!local', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'customer2@example.test', crypt('Passw0rd!local', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'staff@example.test', crypt('Passw0rd!local', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', ''),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@example.test', crypt('Passw0rd!local', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now(), '', '', '', '');

insert into auth.identities (id, user_id, provider_id, provider, identity_data, last_sign_in_at, created_at, updated_at)
select gen_random_uuid(), u.id, u.id::text, 'email',
  jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true), now(), now(), now()
from auth.users u where u.email like '%@example.test';

-- The sign-up trigger created a customer profile for each account; set the names, phones, and roles.
update profiles p set full_name = v.full_name, phone = v.phone, role = v.role::user_role
from (values
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000001', 'Test Customer', '+254700000001', 'customer'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000002', 'Test Customer Two', '+254700000002', 'customer'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000003', 'Test Staff', '+254700000003', 'staff'),
  ('aaaaaaaa-aaaa-4aaa-8aaa-000000000004', 'Test Admin', '+254700000004', 'admin')
) as v(id, full_name, phone, role)
where p.id = v.id::uuid;

insert into drivers (id, name, phone, licence_number) values
  ('88888888-8888-4888-8888-000000000001', 'Test Driver', '+254733000001', 'DL-TEST-001');
