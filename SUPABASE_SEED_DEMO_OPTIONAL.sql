insert into public.profiles (id, full_name, city, role, member_level, bio, member_code)
values
  ('00000000-0000-0000-0000-000000000001', 'Robert Ionescu', 'Galati', 'admin', 'Elite', 'Organizator meet-uri si pasionat de seria 3.', 'BH-0001'),
  ('00000000-0000-0000-0000-000000000002', 'Andrei Popa', 'Braila', 'staff', 'Gold', 'Staff check-in si fotograf.', 'BH-0042'),
  ('00000000-0000-0000-0000-000000000003', 'Mihai Stan', 'Bucuresti', 'member', 'Silver', 'Daily diesel, weekend detailing.', 'BH-0108')
on conflict (id) do update set
  full_name = excluded.full_name,
  city = excluded.city,
  role = excluded.role,
  member_level = excluded.member_level,
  bio = excluded.bio;

insert into public.memberships (profile_id, year, paid, paid_at, expires_at)
values
  ('00000000-0000-0000-0000-000000000001', 2026, true, now(), '2026-12-31'),
  ('00000000-0000-0000-0000-000000000002', 2026, true, now(), '2026-12-31'),
  ('00000000-0000-0000-0000-000000000003', 2026, false, null, '2026-04-20')
on conflict (profile_id, year) do nothing;

insert into public.sponsors (name, logo_url, website)
values
  ('RXS Studio Detailing', null, 'https://example.com/rxs'),
  ('Nord Wheels', null, 'https://example.com/nord'),
  ('TurboLab Galati', null, 'https://example.com/turbolab');

insert into public.events (title, slug, status, description, city, location_name, location_address, starts_at, price_ron)
values
  ('BMW Fest Galati 2026', 'bmw-fest-galati-2026', 'published', 'Meet premium cu check-in QR si zona de garaj.', 'Galati', 'Faleza Dunarii', 'Faleza Dunarii, Galati', '2026-08-22 16:00:00+03', 60),
  ('Night Meet Braila', 'night-meet-braila-2025', 'published', 'Eveniment de seara cu galerie foto.', 'Braila', 'Promenada Mall', 'Promenada Mall Braila', '2025-09-13 19:00:00+03', 30)
on conflict (slug) do nothing;

