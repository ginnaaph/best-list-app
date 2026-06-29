create or replace function public.is_username_taken(handle text)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where lower(username) = lower(handle)
  );
$$;

revoke execute on function public.is_username_taken(text) from public;
revoke execute on function public.is_username_taken(text) from anon;
grant execute on function public.is_username_taken(text) to authenticated;
