delete from public.event_registrations
where profile_id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
)
or event_id in (
  select id from public.events
  where slug in ('bmw-fest-galati-2026', 'night-meet-braila-2025')
);

delete from public.events
where slug in ('bmw-fest-galati-2026', 'night-meet-braila-2025');

delete from public.sponsors
where name in ('RXS Studio Detailing', 'Nord Wheels', 'TurboLab Galati');

delete from public.cars
where profile_id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

delete from public.memberships
where profile_id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
);

delete from public.profiles
where id in (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000003'
)
or full_name in ('Robert Ionescu', 'Andrei Popa', 'Mihai Stan');
