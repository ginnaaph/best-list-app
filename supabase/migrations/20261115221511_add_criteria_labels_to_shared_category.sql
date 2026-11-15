drop function if exists public.get_shared_category(uuid);

create function public.get_shared_category(
  category_share_id uuid
)
returns table (
  id uuid,
  name text,
  cover_photo text,
  tone text,
  is_shared boolean,
  share_id uuid,
  created_at timestamptz, 
  criterion_1_label text,
  criterion_2_label text, 
  criterion_3_label text,
  criterion_4_label text
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
    categories.created_at,
    categories.criterion_1_label,
    categories.criterion_2_label,
    categories.criterion_3_label,
    categories.criterion_4_label
  from public.categories
  where categories.share_id = category_share_id
    and categories.is_shared = true;
$$;

revoke execute on function public.get_shared_category(uuid) from public;
revoke execute on function public.get_shared_category(uuid) from authenticated;
grant execute on function public.get_shared_category(uuid) to anon;

