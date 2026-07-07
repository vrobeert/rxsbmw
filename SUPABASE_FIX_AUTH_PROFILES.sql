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

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.profiles (id, full_name, city)
select
  users.id,
  coalesce(
    nullif(trim(users.raw_user_meta_data ->> 'full_name'), ''),
    nullif(trim(users.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(split_part(users.email, '@', 1)), ''),
    'Membru BMW'
  ),
  'Romania'
from auth.users
left join public.profiles on profiles.id = users.id
where profiles.id is null
on conflict (id) do nothing;

insert into public.memberships (profile_id, year, paid, expires_at)
select
  profiles.id,
  extract(year from now())::integer,
  false,
  now() + interval '1 year'
from public.profiles
left join public.memberships
  on memberships.profile_id = profiles.id
  and memberships.year = extract(year from now())::integer
where memberships.id is null
on conflict (profile_id, year) do nothing;
