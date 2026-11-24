-- Airports and airstrips: what an airport transfer starts from. They are places the business serves, so they
-- live with the other locations and take a type of their own. Names only: the renter picks one from a list.
-- Owner to review the list.

alter table locations drop constraint locations_type_check;
alter table locations add constraint locations_type_check
  check (type in ('office', 'airport', 'airstrip', 'city', 'custom'));

insert into locations (name, type, address, slug) values
  ('Jomo Kenyatta International Airport (JKIA)', 'airport', 'Nairobi', 'jkia-airport'),
  ('Wilson Airport', 'airport', 'Nairobi', 'wilson-airport'),
  ('Moi International Airport', 'airport', 'Mombasa', 'moi-airport-mombasa'),
  ('Kisumu International Airport', 'airport', 'Kisumu', 'kisumu-airport'),
  ('Eldoret International Airport', 'airport', 'Eldoret', 'eldoret-airport'),
  ('Malindi Airport', 'airport', 'Malindi', 'malindi-airport'),
  ('Manda Airport', 'airport', 'Lamu', 'manda-airport-lamu'),
  ('Ukunda Airstrip', 'airstrip', 'Diani', 'ukunda-airstrip'),
  ('Nanyuki Airstrip', 'airstrip', 'Nanyuki', 'nanyuki-airstrip'),
  ('Naivasha Airstrip', 'airstrip', 'Naivasha', 'naivasha-airstrip'),
  ('Lewa Downs Airstrip', 'airstrip', 'Laikipia', 'lewa-airstrip'),
  ('Samburu Airstrip', 'airstrip', 'Samburu', 'samburu-airstrip'),
  ('Amboseli Airstrip', 'airstrip', 'Amboseli', 'amboseli-airstrip'),
  ('Keekorok Airstrip', 'airstrip', 'Maasai Mara', 'keekorok-airstrip'),
  ('Musiara Airstrip', 'airstrip', 'Maasai Mara', 'musiara-airstrip'),
  ('Ol Kiombo Airstrip', 'airstrip', 'Maasai Mara', 'ol-kiombo-airstrip')
on conflict (slug) do nothing;
