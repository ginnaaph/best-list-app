import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migrationSource = readFileSync(
  new URL(
    "../supabase/migrations/20260702174425_create_waitlist_signups.sql",
    import.meta.url,
  ),
  "utf8",
).toLowerCase();

test("creates a normalized UUID-backed waitlist table", () => {
  assert.match(migrationSource, /create table public\.waitlist_signups/);
  assert.match(
    migrationSource,
    /id uuid primary key default gen_random_uuid\(\)/,
  );
  assert.match(migrationSource, /email text not null unique/);
  assert.match(migrationSource, /email = lower\(btrim\(email\)\)/);
  assert.match(migrationSource, /source = 'public_share'/);
});

test("allows anon inserts without exposing waitlist emails", () => {
  assert.match(
    migrationSource,
    /alter table public\.waitlist_signups enable row level security/,
  );
  assert.match(
    migrationSource,
    /revoke all on table public\.waitlist_signups from public, anon, authenticated/,
  );
  assert.match(
    migrationSource,
    /grant insert \(email, source\) on table public\.waitlist_signups to anon/,
  );
  assert.match(
    migrationSource,
    /create policy "anon can join waitlist"[\s\S]*for insert[\s\S]*to anon[\s\S]*with check/,
  );
  assert.doesNotMatch(migrationSource, /grant select/);
  assert.doesNotMatch(migrationSource, /for select/);
});
