create or replace function public.get_shared_category(
  category_share_id uuid
)
returns table (
  id uuid,
  name text,
  cover_photo text,
  tone text,
  is_shared boolean,
  share_id uuid,
  created_at timestamptz
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    categories.id,
    categories.name,
    categories.cover_photo,
    categories.tone,
    categories.is_shared,
    categories.share_id,
    categories.created_at
  from public.categories
  where categories.share_id = category_share_id
    and categories.is_shared = true;
$$;

revoke execute on function public.get_shared_category(uuid) from public;
revoke execute on function public.get_shared_category(uuid) from authenticated;
grant execute on function public.get_shared_category(uuid) to anon;

create or replace function public.get_shared_entries(
  category_share_id uuid
)
returns table (
  id uuid,
  category_id uuid,
  place_name text,
  city text,
  notes text,
  photo_url text,
  created_at timestamptz,
  taste numeric,
  value numeric,
  portion numeric,
  vibe numeric,
  overall_score numeric
)
language sql
security definer
stable
set search_path = ''
as $$
  select
    entries.id,
    entries.category_id,
    entries.place_name,
    entries.city,
    entries.notes,
    entries.photo_url,
    entries.created_at,
    entries.taste,
    entries.value,
    entries.portion,
    entries.vibe,
    entries.overall_score
  from public.entries
  join public.categories
    on entries.category_id = categories.id
  where categories.share_id = category_share_id
    and categories.is_shared = true
  order by entries.created_at asc;
$$;

revoke execute on function public.get_shared_entries(uuid) from public;
revoke execute on function public.get_shared_entries(uuid) from authenticated;
grant execute on function public.get_shared_entries(uuid) to anon;
