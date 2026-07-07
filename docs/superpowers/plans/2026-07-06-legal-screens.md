# Legal Screens Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add permanent in-app Privacy Policy and Terms of Service routes and point the Settings and sign-up legal links to them.

**Architecture:** Create two explicit Expo Router screen files that directly render the approved legal copy with the established Credits screen shell. Keep navigation changes local to the existing `onPress` handlers in Settings and AuthScreen, with no shared abstraction or auth-flow changes.

**Tech Stack:** Expo Router 6, React Native, TypeScript, NativeWind 5, Ionicons, Node test runner

---

### Task 1: Add failing legal-route contract tests

**Files:**
- Create: `__tests__/legal-screens.test.js`

- [ ] **Step 1: Write the failing source-contract test**

Create a Node test that reads `app/privacy.tsx`, `app/terms.tsx`, `app/settings.tsx`, and `components/auth-screen.tsx`. Assert that both route files use the Credits screen shell, include representative exact content, and that all four existing legal links use internal routes. Assert that the Terms source contains `href="/privacy"` around the linked `Privacy Policy` text.

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const privacySource = await readFile(new URL("../app/privacy.tsx", import.meta.url), "utf8");
const termsSource = await readFile(new URL("../app/terms.tsx", import.meta.url), "utf8");
const settingsSource = await readFile(new URL("../app/settings.tsx", import.meta.url), "utf8");
const authSource = await readFile(new URL("../components/auth-screen.tsx", import.meta.url), "utf8");

test("legal screens use the established scrollable screen shell", () => {
  for (const source of [privacySource, termsSource]) {
    assert.match(source, /SafeAreaView/);
    assert.match(source, /contentContainerClassName="grow px-5 pb-8 pt-2"/);
    assert.match(source, /name="chevron-back"/);
    assert.match(source, /router\.back\(\)/);
    assert.match(source, /font-display text-\[34px\]/);
  }
});

test("legal screens contain the approved copy", () => {
  assert.match(privacySource, /Overview/);
  assert.match(privacySource, /Apple ID token/);
  assert.match(privacySource, /bestlist\.app@gmail\.com/);
  assert.match(termsSource, /1\. Acceptance of Terms/);
  assert.match(termsSource, /Our total liability to you for any claim is limited to \$0/);
});

test("Settings and AuthScreen route legal links internally", () => {
  assert.match(settingsSource, /label: "Privacy policy"[\s\S]*router\.push\("\/privacy"\)/);
  assert.match(settingsSource, /label: "Terms of service"[\s\S]*router\.push\("\/terms"\)/);
  assert.match(authSource, /onPress=\{\(\) => router\.push\("\/terms"\)\}/);
  assert.match(authSource, /onPress=\{\(\) => router\.push\("\/privacy"\)\}/);
});

test("Terms links its Privacy Policy reference to the privacy route", () => {
  assert.match(termsSource, /href="\/privacy"[\s\S]*Privacy Policy/);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test __tests__/legal-screens.test.js`

Expected: FAIL because `app/privacy.tsx` and `app/terms.tsx` do not exist.

### Task 2: Implement the Privacy Policy screen

**Files:**
- Create: `app/privacy.tsx`
- Test: `__tests__/legal-screens.test.js`

- [ ] **Step 1: Create the route with the approved copy**

Implement `PrivacyScreen` with the exact `SafeAreaView`, `ScrollView`, header, back button, and title pattern from `app/credits.tsx`. Below the title, render “Last updated: July 6, 2026,” every supplied section heading and paragraph, and each supplied list item as a `View` containing a bullet `Text` and body `Text`. Use only NativeWind classes outside the permitted root SafeAreaView style.

- [ ] **Step 2: Run the focused test**

Run: `node --test __tests__/legal-screens.test.js`

Expected: FAIL only for the missing Terms route and navigation assertions; Privacy source assertions pass.

### Task 3: Implement the Terms of Service screen

**Files:**
- Create: `app/terms.tsx`
- Test: `__tests__/legal-screens.test.js`

- [ ] **Step 1: Create the route with the approved copy**

Implement `TermsScreen` using the same screen shell and legal text typography as Privacy. Render all twelve numbered headings, paragraphs, and bullet items exactly as supplied. In section 7, compose the paragraph with an Expo Router `<Link href="/privacy">` around only `Privacy Policy`, retaining all surrounding wording.

- [ ] **Step 2: Run the focused test**

Run: `node --test __tests__/legal-screens.test.js`

Expected: FAIL only for Settings and AuthScreen still using external URLs; both route screen assertions pass.

### Task 4: Wire Settings and AuthScreen to internal routes

**Files:**
- Modify: `app/settings.tsx:14-27`
- Modify: `components/auth-screen.tsx:164-188`
- Test: `__tests__/legal-screens.test.js`

- [ ] **Step 1: Update Settings legal rows**

Replace only the two `url` fields with existing row handlers:

```tsx
onPress: () => router.push("/privacy"),
```

and:

```tsx
onPress: () => router.push("/terms"),
```

- [ ] **Step 2: Update AuthScreen legal handlers**

Replace only the existing external-link callbacks:

```tsx
onPress={() => router.push("/terms")}
```

and:

```tsx
onPress={() => router.push("/privacy")}
```

Remove the now-unused React Native `Linking` import only if no other code in `components/auth-screen.tsx` uses it.

- [ ] **Step 3: Run the focused test and verify GREEN**

Run: `node --test __tests__/legal-screens.test.js`

Expected: all legal-screen tests PASS.

### Task 5: Verify the complete change

**Files:**
- Verify: `app/privacy.tsx`
- Verify: `app/terms.tsx`
- Verify: `app/settings.tsx`
- Verify: `components/auth-screen.tsx`
- Verify: `__tests__/legal-screens.test.js`

- [ ] **Step 1: Run repository verification**

Run: `npm run verify`

Expected: lint, TypeScript, and all Node tests PASS.

- [ ] **Step 2: Verify formatting and scope**

Run: `git diff --check`

Expected: no whitespace errors.

Run: `git status --short`

Expected: only the two new routes, focused test, approved Settings/AuthScreen edits, and the design/plan documents are changed. The pre-existing AuthScreen URL diff is incorporated without changing adjacent auth logic.

- [ ] **Step 3: Verify Expo web export**

Run: `npx expo export --platform web --output-dir /tmp/bestlist-legal-web-export`

Expected: export completes successfully and generated route data includes `/privacy` and `/terms`.

- [ ] **Step 4: Prepare commit text**

Commit message: `feat: add in-app legal screens`

Description: `Add permanent Privacy Policy and Terms of Service routes, and point Settings and sign-up legal links to the new in-app pages.`
