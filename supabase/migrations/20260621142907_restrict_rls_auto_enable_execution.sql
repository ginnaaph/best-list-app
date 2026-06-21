revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;

comment on function public.rls_auto_enable() is
  'SECURITY DEFINER function intentionally restricted from public, anon, and authenticated roles to prevent execution with owner-level privileges.';
