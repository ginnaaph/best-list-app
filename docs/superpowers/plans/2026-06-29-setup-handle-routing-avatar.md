# Setup Handle Routing and Avatar Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require authenticated users without a username to finish setup, including an optional avatar and bio, before reaching home.

**Architecture:** Keep the route decision and setup payload shaping in pure helpers under `lib/profile-data.ts` so their required states can be tested without rendering Expo routes. Query the profile only after the existing splash timer finishes. Upload a selected avatar to the authenticated user's private Storage folder, retain its storage URL locally, and include that URL plus the bio in the existing profile upsert.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, expo-image-picker, Supabase Auth/Database/Storage, Node test runner.

---

### Task 1: Profile setup decision and payload tests

**Files:**
- Modify: `lib/profile-data.test.js`
- Modify: `lib/profile-data.ts`

- [ ] **Step 1: Write failing tests**

Add tests proving `needsProfileSetup(null)` and `needsProfileSetup({ username: null })` return `true`, while a populated username returns `false`. Extend the setup payload test to call `prepareSetupHandleProfileUpdate(handle, city, bio, avatarUrl)` and verify trimmed `bio` plus the supplied avatar URL; add a skipped-avatar case that returns `avatar_url: null`.

- [ ] **Step 2: Verify the tests fail**

Run: `node --experimental-strip-types --test lib/profile-data.test.js`

Expected: FAIL because `needsProfileSetup` is not exported and the current payload helper does not return `bio` or `avatar_url`.

- [ ] **Step 3: Implement the helpers**

Add `needsProfileSetup(profile)` using the nullable username shape. Extend `prepareSetupHandleProfileUpdate` with optional `bio = ""` and `avatarUrl: string | null = null`, preserving existing handle/city normalization and adding `bio: bio.trim()` plus `avatar_url: avatarUrl`.

- [ ] **Step 4: Verify the tests pass**

Run: `node --experimental-strip-types --test lib/profile-data.test.js`

Expected: PASS with zero failures.

### Task 2: Post-splash profile routing

**Files:**
- Modify: `app/index.tsx`

- [ ] **Step 1: Add profile setup query state**

After `hasSplashFinished` and `session` are both true, query `profiles.username` for `session.user.id` with `maybeSingle()`. Keep the splash rendered while this query is unresolved and reset the result when the session changes.

- [ ] **Step 2: Route incomplete profiles**

Use `needsProfileSetup` on the returned row. Render `<Redirect href="/setup-handle" />` when the profile is missing or its username is null; render `<HomeScreen />` only after a populated username is confirmed. Log query errors and avoid treating them as a missing profile.

### Task 3: Setup avatar and bio UI/save flow

**Files:**
- Modify: `app/setup-handle.tsx`

- [ ] **Step 1: Add avatar selection and upload**

Add a tappable circular avatar above the handle field. Lazily request media-library permission, launch the picker with square editing, fetch the local URI as an ArrayBuffer, and upload it with upsert to `avatars/{userId}/avatar.jpg` using the existing `avatarsBucket` constant. Store the returned bucket URL in local state and resolve a signed preview URL with `resolveAvatarDisplayUrl`.

- [ ] **Step 2: Add the requested form fields and styling**

Change the counter to `Step 3 of 3`. Render initials when no image is selected. Add a single-line `Bio` input after Home City with `maxLength={100}`, placeholder `Taco enthusiast. SF local.`, and the same rounded input styling.

- [ ] **Step 3: Extend the existing profile upsert**

Call the extended payload helper and preserve the existing `upsert(..., { onConflict: "id" })` structure. Add `bio` and `avatar_url` alongside `username` and `city`; skipped avatar must write `null`. Disable duplicate upload/save actions while their operation is active and surface existing alert-style failures.

### Task 4: Verification

**Files:**
- Inspect: all modified files

- [ ] **Step 1: Run focused tests**

Run: `node --experimental-strip-types --test lib/profile-data.test.js`

Expected: PASS with zero failures.

- [ ] **Step 2: Run TypeScript and lint**

Run: `npx tsc --noEmit`

Expected: exit code 0.

Run: `npm run lint`

Expected: exit code 0 with no new errors.

- [ ] **Step 3: Inspect the patch**

Run: `git diff --check` and `git diff -- app/index.tsx app/setup-handle.tsx lib/profile-data.ts lib/profile-data.test.js package.json`.

Expected: no whitespace errors; no changes to `package.json`, `lib/auth.ts`, `app/sign-in.tsx`, `app/sign-up.tsx`, or schema files.
