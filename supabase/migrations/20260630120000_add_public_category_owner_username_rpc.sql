create or replace function public.get_shared_category_owner_username(
  category_share_id uuid
)
returns text
language sql
security definer
stable
set search_path = ''
as $$
  select profiles.username
  from public.categories
  join public.profiles
    on profiles.id = categories.user_id
  where categories.share_id = category_share_id
    and categories.is_shared = true
  limit 1;
$$;

revoke execute on function public.get_shared_category_owner_username(uuid) from public;
revoke execute on function public.get_shared_category_owner_username(uuid) from authenticated;
grant execute on function public.get_shared_category_owner_username(uuid) to anon;
