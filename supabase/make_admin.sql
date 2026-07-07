-- Ruleaza dupa ce ti-ai creat contul in aplicatie.
-- Inlocuieste emailul de mai jos cu emailul contului tau.

update public.profiles
set role = 'admin',
    member_level = 'Elite',
    is_active = true
where id = (
  select id
  from auth.users
  where email = 'emailul-tau@example.com'
);

select id, full_name, city, role, member_level, is_active
from public.profiles
where role = 'admin';
