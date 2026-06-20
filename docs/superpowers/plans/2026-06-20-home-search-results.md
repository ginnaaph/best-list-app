# Home Search Results Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a full-screen, store-backed entry search modal launched by the existing home search pill.

**Architecture:** Keep `HomeScreen` unchanged. Make `SearchPill` control modal visibility, put store access and rendering in `SearchResultsModal`, and isolate joining/filtering/sorting in a pure helper.

**Tech Stack:** Expo, React Native, TypeScript, NativeWind, Zustand, Expo Router, Node test runner

---

### Task 1: Search behavior

**Files:**
- Create: `lib/search-entries.ts`
- Test: `lib/search-entries.test.js`

- [ ] Write failing tests for blank queries, category/place/city matching, case-insensitivity, missing categories, and descending overall score.
- [ ] Run `node --experimental-strip-types --test lib/search-entries.test.js` and confirm the helper is missing.
- [ ] Implement `searchEntries(entries, categories, query)` returning joined result records.
- [ ] Run the focused test and confirm all cases pass.

### Task 2: Full-screen search modal

**Files:**
- Create: `components/search-results-modal.tsx`
- Modify: `components/search-pill.tsx`

- [ ] Make the static pill a visually equivalent accessible `Pressable`.
- [ ] Add a full-screen React Native `Modal` with an auto-focused input and close control.
- [ ] Read categories and entries directly from `useStore` and pass them to `searchEntries`.
- [ ] Render category, place, city, and formatted overall score for each match.
- [ ] Close before navigating to `/entry/${entry.id}`.
- [ ] Render prompt and no-results states for empty and unmatched queries.

### Task 3: Verification

**Files:**
- Review only

- [ ] Run `node --experimental-strip-types --test lib/search-entries.test.js`.
- [ ] Run `npm run lint`.
- [ ] Run `npx tsc --noEmit`.
- [ ] Run `git diff --check` and inspect `git diff --stat`.
- [ ] Confirm `components/home-screen.tsx`, routes, store, and API files are unchanged.
