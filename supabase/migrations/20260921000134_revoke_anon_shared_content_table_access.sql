-- Apply only after the part 1 RPC app update has had time to reach users via OTA.
revoke select on public.categories from anon;
revoke select on public.entries from anon;

drop policy if exists "Shared categories are viewable by anyone" on public.categories;
drop policy if exists "Entries in shared categories are viewable by anyone" on public.entries;
