# Public Share Waitlist Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace both invalid public web sign-up CTAs with a secure inline App Store waitlist capture.

**Architecture:** A local `WaitlistCapture` component owns temporary form state and calls one new `lib/api.ts` helper directly. A new RLS-protected table accepts normalized email and fixed-source inserts from `anon`, exposes no reads, and maps unique violations into a friendly result.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, Supabase JavaScript v2, PostgreSQL/RLS, Node test runner

---

## File Map

- Modify `app/share/[id].tsx`: replace both CTA links and define the local inline form.
- Modify `lib/api.ts`: add the normalized insert helper and duplicate mapping.
- Create `lib/waitlist.test.js`: exercise the helper through a controlled public-client seam.
- Create `__tests__/share-waitlist.test.js`: assert the route contains two captures and required UI states without navigation links.
- Create `supabase/migrations/20260702174425_create_waitlist_signups.sql`: create the UUID table, constraints, grants, and INSERT-only RLS policy.
- Create `__tests__/waitlist-migration.test.js`: assert the migration's security contract.

### Task 1: Public waitlist API

**Files:**
- Test: `lib/waitlist.test.js`
- Modify: `lib/api.ts`

- [ ] Write a failing test that stubs the public client, calls `joinWaitlist("  PERSON@Example.COM ")`, and asserts an insert of `{ email: "person@example.com", source: "public_share" }` plus a `"joined"` result.
- [ ] Add failing cases asserting Postgres code `23505` returns `"already_joined"` and another error is rethrown.
- [ ] Run `node --import tsx --test lib/waitlist.test.js`; expect failure because `joinWaitlist` is not exported.
- [ ] Add `WaitlistJoinResult`, normalize with `trim().toLowerCase()`, perform an insert through `getPublicSupabaseClient()`, map only `23505`, and avoid `.select()`.
- [ ] Run `node --import tsx --test lib/waitlist.test.js`; expect all cases to pass.

### Task 2: Secure waitlist migration

**Files:**
- Test: `__tests__/waitlist-migration.test.js`
- Create: `supabase/migrations/20260702174425_create_waitlist_signups.sql`

- [ ] Run `npx supabase migration new create_waitlist_signups` and use the generated filename.
- [ ] Write a failing source-contract test locating that migration and asserting UUID `gen_random_uuid()`, unique normalized email, fixed `public_share` source, RLS enablement, revoked public roles, anon `insert (email, source)`, one anon INSERT policy, and no SELECT policy/grant.
- [ ] Run `node --test __tests__/waitlist-migration.test.js`; expect failure because the migration is empty.
- [ ] Add the table and named CHECK constraints, enable RLS, revoke privileges from `public`, `anon`, and `authenticated`, grant only `insert (email, source)` to `anon`, and create an anon INSERT policy whose `WITH CHECK` repeats normalization, basic email shape, and fixed source rules.
- [ ] Run `node --test __tests__/waitlist-migration.test.js`; expect pass.

### Task 3: Inline capture UI

**Files:**
- Test: `__tests__/share-waitlist.test.js`
- Modify: `app/share/[id].tsx`

- [ ] Write a failing source-contract test asserting two `<WaitlistCapture` usages, no `Link` import or `href="/"`, the label `Join the App Store waitlist`, both friendly terminal messages, email input semantics, and `joinWaitlist` usage.
- [ ] Run `node --test __tests__/share-waitlist.test.js`; expect failure against the two existing links.
- [ ] Replace `Link` with `TextInput` imports and import `joinWaitlist`.
- [ ] Add a local `WaitlistCapture` with `idle | form | joined | already_joined` state, trimmed email validation, disabled submission while pending, retryable error copy, and NativeWind-only layout.
- [ ] Pass each CTA's original Pressable and Text classes into the two component usages so their trigger pills remain visually unchanged apart from the label.
- [ ] Run `node --test __tests__/share-waitlist.test.js`; expect pass.

### Task 4: Verification

**Files:** all files above

- [ ] Run focused tests: `node --import tsx --test lib/waitlist.test.js __tests__/share-waitlist.test.js __tests__/waitlist-migration.test.js`.
- [ ] Run focused lint: `npx eslint 'app/share/[id].tsx' lib/api.ts lib/waitlist.test.js __tests__/share-waitlist.test.js __tests__/waitlist-migration.test.js --no-cache`.
- [ ] Run `npm run typecheck`.
- [ ] Run `npm test`.
- [ ] Run `git diff --check` and inspect `git diff --` for only intended files plus the pre-existing unrelated worktree changes.
- [ ] Do not apply the migration remotely without explicit authorization; report the exact local migration and the remaining live Supabase verification step.
- [ ] Provide a ready-to-paste commit subject and description without creating a commit.
