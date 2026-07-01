# Pull Request Verification CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one local verification command and run it automatically on GitHub pull requests and protected branch pushes.

**Architecture:** `package.json` owns the canonical lint, type-check, and test commands. A single GitHub Actions job installs the locked dependencies and calls the same combined command developers run locally, keeping local and CI behavior aligned.

**Tech Stack:** npm scripts, TypeScript, Node.js test runner, GitHub Actions, Node.js 20

---

## File Structure

- Modify `package.json`: define the `typecheck`, `test`, and combined `verify` commands.
- Create `.github/workflows/verify.yml`: run the combined verification command for pull requests and pushes to `dev` and `master`.

### Task 1: Add Canonical Verification Scripts

**Files:**
- Modify: `package.json:5-12`

- [ ] **Step 1: Verify the combined command does not exist**

Run:

```bash
npm run verify
```

Expected: FAIL with `Missing script: "verify"`.

- [ ] **Step 2: Add the verification scripts**

Update the `scripts` object in `package.json` to include:

```json
"lint": "expo lint",
"typecheck": "tsc --noEmit",
"test": "node --test lib/*.test.js components/*.test.js __tests__/*.test.js",
"verify": "npm run lint && npm run typecheck && npm test"
```

Keep all existing scripts unchanged.

- [ ] **Step 3: Run the combined command**

Run:

```bash
npm run verify
```

Expected: lint exits successfully, TypeScript exits successfully, and all existing Node tests pass.

- [ ] **Step 4: Inspect the package diff**

Run:

```bash
git diff -- package.json
```

Expected: only the three new scripts and the comma required after `lint` appear.

### Task 2: Add Pull Request CI

**Files:**
- Create: `.github/workflows/verify.yml`

- [ ] **Step 1: Create the workflow**

Add `.github/workflows/verify.yml` with this exact content:

```yaml
name: Verify

on:
  pull_request:
  push:
    branches:
      - dev
      - master

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    timeout-minutes: 10

    steps:
      - name: Check out repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Verify
        run: npm run verify
```

- [ ] **Step 2: Check the workflow syntax and scope**

Run:

```bash
sed -n '1,240p' .github/workflows/verify.yml
```

Expected: the workflow matches the approved design, has read-only repository permissions, and contains no secrets or EAS build steps.

- [ ] **Step 3: Run final local verification**

Run:

```bash
npm run verify
git diff --check
git status --short
```

Expected: verification passes, `git diff --check` prints nothing, and status lists only `package.json`, `.github/workflows/verify.yml`, and this plan document beyond the already committed design document.

- [ ] **Step 4: Commit the implementation when requested**

```bash
git add package.json .github/workflows/verify.yml docs/superpowers/plans/2026-07-01-pull-request-verification-ci.md
git commit -m "ci: verify pull requests"
```
