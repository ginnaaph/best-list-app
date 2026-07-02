# Public Share Waitlist Design

## Goal

Replace both public share-screen links labeled "Start your own list" with an inline App Store waitlist email capture. Preserve the rest of the public share screen, including its share button, data loading, navigation, and visual styling.

## Scope

The implementation changes only:

- `app/share/[id].tsx`
- `lib/api.ts`
- focused test files for the new behavior
- one Supabase migration for `waitlist_signups`

Auth, sign-in, sign-up, navigation, category state, entry state, and Zustand remain unchanged.

## User Experience

Both existing CTA locations render the same local `WaitlistCapture` component. Its initial trigger keeps the exact existing pill classes at that location and changes only the label to "Join the App Store waitlist."

Tapping the pill replaces it inline with:

- an email-address input
- a submit pill
- a compact validation or submission message when needed

The component trims and lowercases the email before submission. Empty or structurally invalid email input is rejected locally. While submitting, repeated submissions are disabled.

Successful inserts show:

> You're on the list — we'll email you when BestList is live.

Duplicate submissions show:

> You're already on the list — we'll email you when BestList is live.

Other failures keep the input available and show a concise retry message. Each CTA instance owns its own temporary UI state; neither uses Zustand.

## Application API

Add this public helper to `lib/api.ts`:

```ts
export async function joinWaitlist(
  email: string,
): Promise<"joined" | "already_joined">
```

The helper normalizes the email with `trim().toLowerCase()`, then inserts only `email` and `source` through `getPublicSupabaseClient()`.

`source` is the fixed value `"public_share"`. PostgreSQL error code `23505` maps to `"already_joined"`; all other errors are thrown for the UI to present as retryable failures. The insert does not request returned row data because anonymous callers have no SELECT access.

## Database Design

Create `public.waitlist_signups` with:

- `id uuid primary key default gen_random_uuid()` to match existing application tables
- `email text not null unique`
- `created_at timestamptz not null default now()`
- `source text not null`

Constraints require:

- `email = lower(btrim(email))`
- a minimally plausible email shape
- `source = 'public_share'`

Enable RLS. Revoke all table privileges from `anon` and `authenticated`, then grant `anon` INSERT on only `(email, source)`. Add one INSERT policy for `anon` with a `WITH CHECK` expression enforcing the normalized email and fixed source. Add no SELECT, UPDATE, or DELETE policy or grant.

The explicit column grant prevents public clients from supplying `id` or `created_at`. The unique email constraint provides race-safe duplicate handling.

## Component Structure

`WaitlistCapture` remains a local component in `app/share/[id].tsx`, matching the existing local `SharedEntryCard` pattern. It accepts the trigger and label class strings needed to preserve the two current CTA variants without changing their appearance.

The parent share screen changes only by replacing each existing `<Link>` CTA block with `WaitlistCapture`. Existing loading, not-found content, list rendering, and share behavior stay intact.

## Testing

Implementation follows test-first development:

1. Add a failing API behavior test covering normalization, fixed source, successful return, duplicate mapping, and propagation of unrelated errors.
2. Add a failing share-screen source test confirming both links are removed, both waitlist captures render, and the required success copy exists.
3. Add a failing migration test confirming UUID convention, uniqueness, normalized email/source constraints, RLS, column-scoped anon INSERT, and absence of anon SELECT access.
4. Implement the smallest code and SQL changes that pass these tests.

Final verification runs focused tests, file-scoped ESLint, TypeScript, the complete test suite, and `git diff --check`. Live database policy verification is reported separately if the migration is not applied to a connected Supabase project during this task.
