-- Intentionally empty: no seed data yet.
-- Fake user for local testing only
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

insert into public.categories (user_id, name, tone)
values ('11111111-1111-1111-1111-111111111111', 'tacos', 'gold');