create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  created_at timestamptz not null default now(),
  source text not null,
  constraint waitlist_signups_email_normalized_check
    check (email = lower(btrim(email))),
  constraint waitlist_signups_email_format_check
    check (email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'),
  constraint waitlist_signups_source_check
    check (source = 'public_share')
);

alter table public.waitlist_signups enable row level security;

revoke all on table public.waitlist_signups from public, anon, authenticated;
grant insert (email, source) on table public.waitlist_signups to anon;

create policy "Anon can join waitlist"
on public.waitlist_signups
for insert
to anon
with check (
  email = lower(btrim(email))
  and email ~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$'
  and source = 'public_share'
);
