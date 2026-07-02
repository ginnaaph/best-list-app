# Pull Request Verification CI Design

## Goal

Provide one reliable local command for repository verification and run the same checks automatically for pull requests and protected branch pushes.

## Package Scripts

Add three scripts to `package.json`:

- `typecheck`: run TypeScript with `tsc --noEmit`.
- `test`: run every existing Node test in `lib/`, `components/`, and `__tests__/`.
- `verify`: run lint, type checking, and tests sequentially, stopping on the first failure.

The existing `lint` script remains unchanged. No dependencies are added.

## GitHub Actions Workflow

Add `.github/workflows/verify.yml` with one `verify` job that:

1. Runs for every pull request and pushes to `dev` or `master`.
2. Uses the current Ubuntu runner and Node.js 20.
3. Checks out the repository.
4. Installs the locked dependency tree with `npm ci`.
5. Runs `npm run verify`.

The workflow does not require application secrets because these checks compile and inspect the code without contacting Supabase or Google Places.

## Failure Behavior

Any lint error, TypeScript error, failing test, dependency installation failure, or lockfile mismatch fails the workflow and blocks the verification check.

## Verification

Run `npm run verify` locally, inspect the workflow YAML, and run `git diff --check`. GitHub will execute the workflow after the changes are pushed.

## Scope

This change does not add runtime or integration tests, build the native application, run an Expo export, change application code, or configure branch-protection rules.
