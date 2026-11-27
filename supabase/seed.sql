-- user A --
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '11111111-1111-1111-1111-111111111111',
  'authenticated', 'authenticated',
  'test-a@bestlist.local',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"tester_a"}',
  now(), now()
);

-- user B --
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at
) values (
  '00000000-0000-0000-0000-000000000000',
  '33333333-3333-3333-3333-333333333333',
  'authenticated', 'authenticated',
  'test-b@bestlist.local',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"username":"tester_b"}',
  now(), now()
);

-- user A: shared tacos, default labels --
insert into public.categories (user_id, name, tone, is_shared, share_id)
values (
  '11111111-1111-1111-1111-111111111111',
  'tacos', 'gold', true,
  '22222222-2222-2222-2222-222222222222'
);

-- user B: private pizza, renamed labels ("Crust crunchies" = exactly 15 chars) --
insert into public.categories (
  user_id, name, tone, is_shared,
  criterion_1_label, criterion_2_label, criterion_3_label, criterion_4_label
)
values (
  '33333333-3333-3333-3333-333333333333',
  'pizza', 'gold', false,
  'Crust crunchies', 'Sauce', 'Price', 'Vibe check'
);

-- user A: tacos entries --
insert into public.entries (
  user_id, category_id, place_name, city, notes,
  taste, value, portion, vibe
)
select
  '11111111-1111-1111-1111-111111111111', id,
  'Tacos El Gordo', 'San Diego',
  'Great tacos, flavorful meat, and generous portions.',
  9.2, 8.5, 8.8, 8.0
from public.categories
where user_id = '11111111-1111-1111-1111-111111111111'
  and name = 'tacos';

insert into public.entries (
  user_id, category_id, place_name, city, notes,
  taste, value, portion, vibe
)
select
  '11111111-1111-1111-1111-111111111111', id,
  'La Taqueria', 'San Francisco',
  'Crispy-style is the move.',
  8.7, 7.5, 9.0, 7.3
from public.categories
where user_id = '11111111-1111-1111-1111-111111111111'
  and name = 'tacos';

-- user B: pizza entry --
insert into public.entries (
  user_id, category_id, place_name, city, notes,
  taste, value, portion, vibe
)
select
  '33333333-3333-3333-3333-333333333333', id,
  'Tony''s Pizza Napoletana', 'San Francisco',
  'Margherita was perfect.',
  9.5, 6.5, 7.0, 8.5
from public.categories
where user_id = '33333333-3333-3333-3333-333333333333'
  and name = 'pizza';
-- auth fix for local email-code sign-in (BES-24) --
-- token columns must be '' not NULL, or auth fails with "Database error finding user"
update auth.users set
  confirmation_token = coalesce(confirmation_token, ''),
  recovery_token = coalesce(recovery_token, ''),
  email_change_token_new = coalesce(email_change_token_new, ''),
  email_change_token_current = coalesce(email_change_token_current, ''),
  email_change = coalesce(email_change, ''),
  phone_change = coalesce(phone_change, ''),
  phone_change_token = coalesce(phone_change_token, ''),
  reauthentication_token = coalesce(reauthentication_token, '')
where email like '%@bestlist.local';

-- email identity row so seed users can sign in by email --
insert into auth.identities (provider_id, user_id, identity_data, provider, created_at, updated_at, last_sign_in_at)
select id::text, id,
  jsonb_build_object('sub', id::text, 'email', email, 'email_verified', true),
  'email', now(), now(), now()
from auth.users
where email like '%@bestlist.local'
on conflict do nothing;
