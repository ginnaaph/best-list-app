-- Run this in the Supabase SQL editor.
-- This creates the BestList foundation tables with per-user Row Level Security.

create extension if not exists pgcrypto;

insert into storage.buckets (id, name, public)
values ('entry-photos', 'entry-photos', true)
on conflict (id) do update
set public = excluded.public;

drop policy if exists "Users can upload their own entry photos"
  on storage.objects;
create policy "Users can upload their own entry photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'entry-photos'
    and (storage.foldername(name))[1] = (select auth.uid()::text)
  );

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  cover_photo text,
  tone text not null,
  is_shared boolean not null default false,
  share_id uuid,
  created_at timestamptz not null default now()
);

alter table public.categories
  add column if not exists is_shared boolean not null default false;

alter table public.categories
  add column if not exists share_id uuid;

create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  category_id uuid not null references public.categories(id) on delete cascade,
  place_name text not null,
  city text not null,
  notes text,
  photo_url text,
  created_at timestamptz not null default now(),
  taste numeric(3, 1) not null check (taste >= 1 and taste <= 10),
  value numeric(3, 1) not null check (value >= 1 and value <= 10),
  portion numeric(3, 1) not null check (portion >= 1 and portion <= 10),
  vibe numeric(3, 1) not null check (vibe >= 1 and vibe <= 10),
  overall_score numeric(3, 1) generated always as (
    round((taste + value + portion + vibe) / 4, 1)
  ) stored
);

create index if not exists categories_user_id_idx
  on public.categories(user_id);

create unique index if not exists categories_share_id_key
  on public.categories(share_id);

create index if not exists entries_user_id_idx
  on public.entries(user_id);

create index if not exists entries_category_id_idx
  on public.entries(category_id);

alter table public.categories enable row level security;
alter table public.entries enable row level security;

grant usage on schema public to authenticated;
grant usage on schema public to anon;
grant select, insert, update, delete on public.categories to authenticated;
grant select, insert, update, delete on public.entries to authenticated;
grant select on public.categories to anon;
grant select on public.entries to anon;

drop policy if exists "Users can select their own categories" on public.categories;
create policy "Users can select their own categories"
  on public.categories
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Public categories are viewable by anyone" on public.categories;
drop policy if exists "Shared categories are viewable by anyone" on public.categories;
create policy "Shared categories are viewable by anyone"
  on public.categories for select
  to anon
  using (is_shared = true);

drop policy if exists "Users can insert their own categories" on public.categories;
create policy "Users can insert their own categories"
  on public.categories
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own categories" on public.categories;
create policy "Users can update their own categories"
  on public.categories
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own categories" on public.categories;
create policy "Users can delete their own categories"
  on public.categories
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can select their own entries" on public.entries;
create policy "Users can select their own entries"
  on public.entries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Entries in public categories are viewable by anyone" on public.entries;
drop policy if exists "Entries in shared categories are viewable by anyone" on public.entries;
create policy "Entries in shared categories are viewable by anyone"
  on public.entries for select
  to anon
  using (
    exists (
      select 1 from public.categories
      where categories.id = entries.category_id
        and categories.is_shared = true
    )
  );

drop policy if exists "Users can insert entries in their own categories" on public.entries;
create policy "Users can insert entries in their own categories"
  on public.entries
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.categories
      where categories.id = entries.category_id
        and categories.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can update their own entries" on public.entries;
create policy "Users can update their own entries"
  on public.entries
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.categories
      where categories.id = entries.category_id
        and categories.user_id = (select auth.uid())
    )
  );

drop policy if exists "Users can delete their own entries" on public.entries;
create policy "Users can delete their own entries"
  on public.entries
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);
