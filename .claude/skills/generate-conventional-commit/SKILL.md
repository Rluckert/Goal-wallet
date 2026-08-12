---
name: generate-conventional-commit
description: Generates a commit following Conventional Commits and, when appropriate, creates the working branch — but only if the relevant test suite passes. Use when closing any unit of work in web/, libreria/, or mobile/ inside goal-wallet.
user-invocable: true
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash(git *)
  - Bash(npm test*)
  - Bash(npm run test*)
  - Bash(yarn test*)
---

# generate-conventional-commit

Closes a unit of work in the `goal-wallet` exam with a **Conventional Commits** commit, gated on tests passing. Never commits with broken or unrun tests.

## When to invoke

At the end of a concrete plan step (e.g. "mobile domain layer done", "libreria native module implemented"). Not for half-finished WIP.

## Procedure

1. **Detect the change scope**
   - `git status --porcelain` and `git diff --stat` to see which folders the change touches: `web/`, `libreria/`, `mobile/`, `.claude/`, `docs/`, or root.
   - The commit "scope" comes from this: `web`, `libreria`, `mobile`, `ia` (for `.claude/` and `docs/ia/`), or omitted if the change is cross-cutting (e.g. root-level `docs:`).

2. **Run the relevant tests — mandatory before committing**
   - If the change touches `libreria/`: `cd libreria && npm test -- --watchAll=false`.
   - If the change touches `mobile/`: `cd mobile && npm test -- --watchAll=false`.
   - If the change only touches `web/`, `.claude/`, `docs/`, or `README.md`: no tests to run (web/ is explicitly out of test scope for this exam); commit directly.
   - If it touches both `libreria/` and `mobile/`, run both suites.
   - **If any test fails: stop. Do not commit.** Report the failure to the user and suggest invoking the `build-test-diagnostician` agent for triage. Never use `--no-verify` or any flag that skips hooks/tests to force the commit through.

3. **Create a branch when appropriate**
   - Branching model for this repo: `main` = final delivery only, `integration` = base branch all phase work merges into, `laboratory` = unused for now. Every phase (0/1/2/3) gets its own feature branch cut from `integration`, e.g. `feat/ai-governance` (Phase 0), `feat/web-microapp` (Phase 1), `feat/libreria-turbomodule` (Phase 2), `feat/mobile-*` (Phase 3, one per DDD layer if useful).
   - If the work being closed starts a new phase and the repo is still on `integration` (or `main`), create the branch first: `git checkout integration && git pull && git checkout -b <type>/<short-slug>`.
   - If already on an active feature branch for that phase, keep committing there — do not create a new one.
   - Never commit directly on `main` or `integration`, and never branch from `main` — always from `integration`, unless the user explicitly asks otherwise for a specific case.

4. **Write the message (Conventional Commits)**
   - Format: `<type>(<scope>): <imperative summary, lowercase, no trailing period>`.
   - Valid types here: `feat` (new product functionality), `fix`, `test` (test-only additions/changes), `docs` (README, AI_USAGE.md, architecture write-ups), `chore` (scaffolding, config, dependencies), `refactor`.
   - The summary describes the business/engineering *what*, not the process ("feat(mobile): add goalsSlice reducer and selectors", not "feat(mobile): misc changes").
   - Optional body (blank line after the summary) only when the *why* isn't obvious from the summary — matching this repo's existing commit style.

5. **Stage and commit**
   - `git add <specific paths>` — never blind `git add -A`/`git add .`; check `git status` to avoid staging build artifacts (`node_modules/`, `android/build/`, `*.keystore`, etc.) or `requirements.pdf` unless intentional.
   - Confirm there are no secrets/tokens/PII in the diff before committing (explicit exam rule).
   - `git commit -m "<message>"` using the message built in step 4. No `Co-Authored-By` unless the user asks — this skill follows this exam repo's own commit convention, not Claude Code's default attribution.

6. **Push and open the PR when a phase closes**
   - When the commit(s) just made finish a whole phase (not every intermediate commit — only the last one closing out Phase 0/1/2/3, or a meaningful sub-step the user calls out), push the feature branch: `git push -u origin <branch>`.
   - Open the PR against `integration` (never `main`) with `gh pr create --base integration --title "<type>(<scope>): <summary>" --body "..."`. Body should briefly list what the phase delivered and how it was verified (tests passing, coverage, manual run).
   - Report the PR URL back to the user. Do not merge it — merging is the user's call.

7. **Confirm**
   - Show `git log --oneline -3` and `git status` so it's clear what got committed and what's still pending.

## What this skill does NOT do

- Never pushes or opens a PR for intermediate, mid-phase commits — only when a phase (or an explicitly-called-out chunk) is actually done.
- Never merges a PR — that's the user's call in GitHub.
- Never squashes or `--amend`s previous commits.
- Never commits with red tests, or tests that weren't run.
- Never commits or branches directly on `main`/`integration`.
- Doesn't decide feature scope — it only packages already-done work into a well-formed commit.
