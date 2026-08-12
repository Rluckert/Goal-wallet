---
name: generate-domain-fixtures
description: Generates test fixtures/factories with edge cases for a domain type in mobile/src/domain, reusable across the mobile/ test suite. Use whenever a new domain entity or value object needs test data, or an existing one gains a new invariant that fixtures should cover.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# generate-domain-fixtures

Generates a factory module for a `mobile/src/domain/` type, covering the edge cases that actually matter for that type's business rules, so every test file that needs a `SavingsGoal`, `Money`, or `Progress` instance builds it the same way instead of re-inventing ad-hoc literals.

## When to invoke

- A new domain entity or value object is added under `mobile/src/domain/`.
- An existing domain type gains a new invariant (e.g. a new validation rule on `Money`) and fixtures need a matching edge case.

## Procedure

1. **Read the target domain type** (e.g. `mobile/src/domain/SavingsGoal.ts`) to find its constructor/factory function, its invariants (thrown errors, clamped ranges), and its public shape. Domain code in this project is framework-free — the fixture must not import anything from `react-native` or `react-redux` either.
2. **Identify the edge cases that matter for THIS type's rules**, not a generic set. For `SavingsGoal`/`Progress` in this project that means at minimum: 0% progress (freshly created, no deposits), partial progress (e.g. 50%), exactly 100% (goal completed — this is the case that triggers the native notification), and an attempted over-deposit (amount that would push saved past target) since that's a real business rule to test, not a generic boundary.
3. **Write the factory** to `mobile/src/domain/__fixtures__/<TypeName>.fixtures.ts` (create the `__fixtures__` folder next to the type if it doesn't exist), exporting:
   - A base builder function, e.g. `buildSavingsGoal(overrides?: Partial<SavingsGoalProps>): SavingsGoal`, with sane defaults.
   - Named presets for the edge cases identified above, e.g. `savingsGoalAtZeroProgress()`, `savingsGoalAtFullProgress()`, `savingsGoalNearOverDeposit()`.
4. **Type everything** — no `any`. If the domain type's constructor is private/validated, build fixtures through its actual public factory method so fixtures can never represent an invalid state the real domain wouldn't allow.
5. **Do not duplicate an existing fixture module** — if `__fixtures__/<TypeName>.fixtures.ts` already exists, extend it instead of creating a second one; grep first.

## Output

One fixtures file per domain type, imported by the relevant `*.test.ts` files in `domain/`, `application/`, and `infrastructure/` (e.g. `InMemoryGoalsRepository` tests can seed themselves from these builders instead of inlining goal literals).

## What NOT to do

- Don't generate fixtures that bypass domain validation (no casting through `as SavingsGoal` on a plain object literal) — that would let invalid states leak into tests and hide real bugs.
- Don't add fixtures for cases the domain type has no rule for yet — fixtures should track real invariants, not invent hypothetical ones.
