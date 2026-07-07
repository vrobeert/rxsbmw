create extension if not exists pgcrypto;

create type public.app_role as enum ('member', 'staff', 'admin', 'sponsor');
create type public.member_level as enum ('Bronze', 'Silver', 'Gold', 'Elite');
create type public.payment_status as enum ('pending', 'cash', 'transfer', 'paid', 'refunded');
create type public.event_status as enum ('draft', 'published', 'archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  city text,
  avatar_url text,
  bio text,
  role public.app_role not null default 'member',
  member_level public.member_level not null default 'Bronze',
  member_code text unique not null default ('BH-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  joined_at timestamptz not null default now(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.memberships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  year integer not null,
  paid boolean not null default false,
  paid_at timestamptz,
  expires_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  unique (profile_id, year)
);

create table public.cars (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  model text not null,
  generation text not null,
  engine text,
  power_hp integer check (power_hp is null or power_hp > 0),
  year integer check (year is null or year between 1950 and 2100),
  color text,
  cover_photo_id uuid,
  approved boolean not null default true,
  hidden_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.car_photos (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  storage_path text not null,
  alt text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cars
  add constraint cars_cover_photo_fk foreign key (cover_photo_id) references public.car_photos(id) on delete set null;

create table public.car_mods (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  category text not null,
  description text not null,
  sort_order integer not null default 0
);

create table public.car_likes (
  car_id uuid not null references public.cars(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (car_id, profile_id)
);

create table public.car_comments (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  hidden_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  website text,
  contact_email text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  status public.event_status not null default 'draft',
  description text,
  cover_url text,
  city text,
  location_name text,
  location_address text,
  maps_url text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  price_ron numeric(10, 2) not null default 0,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.event_schedule_items (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  starts_at time not null,
  title text not null,
  sort_order integer not null default 0
);

create table public.event_categories (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0,
  unique (event_id, name)
);

create table public.event_registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid references public.cars(id) on delete set null,
  category_id uuid references public.event_categories(id) on delete set null,
  qr_token uuid not null default gen_random_uuid(),
  payment_status public.payment_status not null default 'pending',
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (event_id, profile_id),
  unique (qr_token)
);

create table public.event_sponsors (
  event_id uuid not null references public.events(id) on delete cascade,
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  placement text,
  sort_order integer not null default 0,
  primary key (event_id, sponsor_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  published_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);

create table public.marketplace_listings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  category text not null,
  price_ron numeric(10, 2),
  city text,
  description text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.contests (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  voting_open boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  contest_id uuid not null references public.contests(id) on delete cascade,
  voter_id uuid not null references public.profiles(id) on delete cascade,
  car_id uuid not null references public.cars(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (contest_id, voter_id)
);

create table public.convoys (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  city text not null,
  meeting_point text not null,
  departure_at timestamptz not null,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.service_entries (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  title text not null,
  mileage_km integer,
  service_date date not null,
  notes text,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create table public.sponsor_metrics (
  id uuid primary key default gen_random_uuid(),
  sponsor_id uuid not null references public.sponsors(id) on delete cascade,
  event_id uuid references public.events(id) on delete cascade,
  metric_key text not null,
  metric_value integer not null default 0,
  measured_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

create trigger cars_updated_at before update on public.cars
for each row execute function public.set_updated_at();

create trigger events_updated_at before update on public.events
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  profile_name text;
begin
  profile_name := nullif(
    trim(
      coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1),
        'Membru BMW'
      )
    ),
    ''
  );

  insert into public.profiles (id, full_name, city)
  values (new.id, coalesce(profile_name, 'Membru BMW'), 'Romania')
  on conflict (id) do nothing;

  insert into public.memberships (profile_id, year, paid, expires_at)
  values (new.id, extract(year from now())::integer, false, now() + interval '1 year')
  on conflict (profile_id, year) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role = 'admin' from public.profiles where id = auth.uid()), false);
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce((select role in ('admin', 'staff') from public.profiles where id = auth.uid()), false);
$$;

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.cars enable row level security;
alter table public.car_photos enable row level security;
alter table public.car_mods enable row level security;
alter table public.car_likes enable row level security;
alter table public.car_comments enable row level security;
alter table public.sponsors enable row level security;
alter table public.events enable row level security;
alter table public.event_schedule_items enable row level security;
alter table public.event_categories enable row level security;
alter table public.event_registrations enable row level security;
alter table public.event_sponsors enable row level security;
alter table public.announcements enable row level security;
alter table public.marketplace_listings enable row level security;
alter table public.contests enable row level security;
alter table public.votes enable row level security;
alter table public.convoys enable row level security;
alter table public.service_entries enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.sponsor_metrics enable row level security;

create policy "profiles read own or staff" on public.profiles
for select using (id = auth.uid() or public.is_staff());

create policy "profiles insert own" on public.profiles
for insert with check (id = auth.uid());

create policy "profiles update own limited or admin" on public.profiles
for update using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "memberships read own or staff" on public.memberships
for select using (profile_id = auth.uid() or public.is_staff());

create policy "memberships staff manage" on public.memberships
for all using (public.is_staff()) with check (public.is_staff());

create policy "cars public approved read" on public.cars
for select using (approved = true and hidden_at is null);

create policy "cars owner and staff read" on public.cars
for select using (profile_id = auth.uid() or public.is_staff());

create policy "cars owner insert" on public.cars
for insert with check (profile_id = auth.uid());

create policy "cars owner update or staff" on public.cars
for update using (profile_id = auth.uid() or public.is_staff())
with check (profile_id = auth.uid() or public.is_staff());

create policy "car photos read through visible car" on public.car_photos
for select using (
  exists (
    select 1 from public.cars c
    where c.id = car_id and (c.approved = true or c.profile_id = auth.uid() or public.is_staff())
  )
);

create policy "car photos owner manage" on public.car_photos
for all using (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
) with check (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
);

create policy "car mods read through visible car" on public.car_mods
for select using (
  exists (
    select 1 from public.cars c
    where c.id = car_id and (c.approved = true or c.profile_id = auth.uid() or public.is_staff())
  )
);

create policy "car mods owner manage" on public.car_mods
for all using (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
) with check (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
);

create policy "likes read" on public.car_likes for select using (true);
create policy "likes own insert" on public.car_likes for insert with check (profile_id = auth.uid());
create policy "likes own delete" on public.car_likes for delete using (profile_id = auth.uid());

create policy "comments visible read" on public.car_comments
for select using (hidden_at is null or public.is_staff() or profile_id = auth.uid());

create policy "comments own insert" on public.car_comments
for insert with check (profile_id = auth.uid());

create policy "comments owner or staff update" on public.car_comments
for update using (profile_id = auth.uid() or public.is_staff())
with check (profile_id = auth.uid() or public.is_staff());

create policy "public sponsors read" on public.sponsors for select using (active = true or public.is_staff());
create policy "staff sponsors manage" on public.sponsors for all using (public.is_staff()) with check (public.is_staff());

create policy "published events read" on public.events for select using (status = 'published' or public.is_staff());
create policy "staff events manage" on public.events for all using (public.is_staff()) with check (public.is_staff());

create policy "event children public read" on public.event_schedule_items for select using (true);
create policy "event categories public read" on public.event_categories for select using (true);
create policy "event sponsors public read" on public.event_sponsors for select using (true);

create policy "event children staff manage" on public.event_schedule_items for all using (public.is_staff()) with check (public.is_staff());
create policy "event categories staff manage" on public.event_categories for all using (public.is_staff()) with check (public.is_staff());
create policy "event sponsors staff manage" on public.event_sponsors for all using (public.is_staff()) with check (public.is_staff());

create policy "registrations own or staff read" on public.event_registrations
for select using (profile_id = auth.uid() or public.is_staff());

create policy "registrations own insert" on public.event_registrations
for insert with check (profile_id = auth.uid());

create policy "registrations staff update" on public.event_registrations
for update using (public.is_staff()) with check (public.is_staff());

create policy "announcements read" on public.announcements for select using (published_at <= now() or public.is_staff());
create policy "announcements staff manage" on public.announcements for all using (public.is_staff()) with check (public.is_staff());

create policy "phase2 owner read marketplace" on public.marketplace_listings
for select using (active = true or profile_id = auth.uid() or public.is_staff());

create policy "phase2 owner manage marketplace" on public.marketplace_listings
for all using (profile_id = auth.uid() or public.is_staff())
with check (profile_id = auth.uid() or public.is_staff());

create policy "phase2 contests read" on public.contests for select using (true);
create policy "phase2 contests staff manage" on public.contests for all using (public.is_staff()) with check (public.is_staff());

create policy "phase2 votes read" on public.votes for select using (true);
create policy "phase2 votes insert own" on public.votes for insert with check (voter_id = auth.uid());

create policy "phase2 convoys read" on public.convoys for select using (true);
create policy "phase2 convoys manage own" on public.convoys
for all using (created_by = auth.uid() or public.is_staff())
with check (created_by = auth.uid() or public.is_staff());

create policy "phase2 service own" on public.service_entries
for all using (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
) with check (
  exists (select 1 from public.cars c where c.id = car_id and (c.profile_id = auth.uid() or public.is_staff()))
);

create policy "phase2 push own" on public.push_subscriptions
for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "phase2 sponsor metrics staff" on public.sponsor_metrics
for all using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('car-photos', 'car-photos', true),
  ('event-covers', 'event-covers', true),
  ('event-gallery', 'event-gallery', true),
  ('sponsor-logos', 'sponsor-logos', true)
on conflict (id) do nothing;

create policy "avatars public read" on storage.objects
for select using (bucket_id = 'avatars');

create policy "avatars owner upload" on storage.objects
for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "car photos public read" on storage.objects
for select using (bucket_id = 'car-photos');

create policy "car photos owner upload" on storage.objects
for insert with check (
  bucket_id = 'car-photos' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "event media public read" on storage.objects
for select using (bucket_id in ('event-covers', 'event-gallery', 'sponsor-logos'));

create policy "staff media upload" on storage.objects
for insert with check (
  bucket_id in ('event-covers', 'event-gallery', 'sponsor-logos') and public.is_staff()
);
