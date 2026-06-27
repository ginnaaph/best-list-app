# Delete Account Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the screenshot-matched, frontend-only three-step delete-account flow to Settings.

**Architecture:** `SettingsScreen` owns one visibility boolean and sign-in navigation. A focused `DeleteAccountSheet` component owns the typed step state and confirmation input while extending the repo's existing transparent native `Modal` pattern.

**Tech Stack:** Expo Router, React Native, TypeScript, NativeWind, Ionicons, Node test runner

---

### Task 1: Failing flow contract test

**Files:**
- Create: `components/delete-account-sheet.test.js`

- [ ] Add source-contract assertions requiring a slide-up transparent modal, inert `onRequestClose`, all three step values and copy, exact `confirmation === "DELETE"` validation, disabled button state, and the sign-in callback.
- [ ] Run `node --test components/delete-account-sheet.test.js`.
- [ ] Confirm it fails because `components/delete-account-sheet.tsx` does not exist.

### Task 2: Delete account sheet

**Files:**
- Create: `components/delete-account-sheet.tsx`

- [ ] Define `DeleteAccountStep = "warning" | "confirmation" | "success"` and props for `visible`, `onClose`, and `onBackToSignIn`.
- [ ] Render one `Modal` with `animationType="slide"`, `transparent`, `statusBarTranslucent`, and a no-op `onRequestClose`.
- [ ] Extend `VerificationModal`'s keyboard-aware dim-overlay/sheet structure, but use a non-pressable overlay and NativeWind-only styling.
- [ ] Implement warning actions: Continue sets `confirmation`; Cancel resets state and calls `onClose`.
- [ ] Implement confirmation actions: exact case-sensitive validation, disabled destructive action until valid, valid green input border, and Back clearing input and returning to `warning`.
- [ ] Implement success actions: render the success state and reset before calling `onBackToSignIn`.
- [ ] Run the focused Node test and confirm it passes.

### Task 3: Settings integration

**Files:**
- Modify: `app/settings.tsx`
- Modify: `components/delete-account-sheet.test.js`

- [ ] Extend the failing contract test to require Settings import/render wiring, an accessible `Pressable` trigger, and `router.replace("/sign-in")`.
- [ ] Run the focused test and confirm the Settings integration assertions fail.
- [ ] Add local modal visibility state to `SettingsScreen`.
- [ ] Change only the existing static delete control from `View` to `Pressable`, preserving its classes and content.
- [ ] Render `DeleteAccountSheet`; close it with local state and navigate from success using `router.replace("/sign-in")`.
- [ ] Run the focused test and confirm it passes.

### Task 4: Verification

**Files:**
- Review only

- [ ] Run `node --test components/delete-account-sheet.test.js`.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `git diff --check`, inspect `git diff --stat`, and confirm unrelated Settings layout/content is unchanged.
- [ ] Provide a ready-to-paste commit subject and description without committing user changes.
