SET local check_function_bodies = off;

DROP EVENT TRIGGER "ensure_rls";

CREATE EXTENSION "hypopg" SCHEMA "extensions";

CREATE EXTENSION "index_advisor" SCHEMA "extensions";

ALTER TABLE "public"."categories"
  ADD COLUMN "is_public" boolean NOT NULL DEFAULT false;

ALTER TABLE "public"."profiles"
  ADD COLUMN "updated_at" timestamp WITH time zone NOT NULL DEFAULT now();

CREATE OR REPLACE FUNCTION public.set_profile_updated_at()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;

CREATE TRIGGER set_profile_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_profile_updated_at();

CREATE EVENT TRIGGER "ensure_rls"
  ON ddl_command_end
  WHEN TAG IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
  EXECUTE FUNCTION "public"."rls_auto_enable"();

COMMENT ON EXTENSION "hypopg" IS 'Hypothetical indexes for PostgreSQL';

COMMENT ON EXTENSION "index_advisor" IS 'Query index advisor';

REVOKE ALL ON FUNCTION "public"."set_profile_updated_at"() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "public"."set_profile_updated_at"() TO "postgres", "service_role";

REVOKE ALL ON FUNCTION "public"."set_profile_updated_at"() FROM "anon";
REVOKE ALL ON FUNCTION "public"."set_profile_updated_at"() FROM "authenticated";