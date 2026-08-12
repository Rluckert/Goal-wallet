# AI Usage — mobile/

This document tracks how AI (Claude Code) was governed while building the `mobile/` layer of the `goal-wallet` exam, per the exam's requirement to explain *how* AI use was governed, not just that it was used.

## Skills used in this layer

| Skill | Purpose | Location |
|---|---|---|
| `generate-domain-fixtures` | Generate test fixtures/factories with real edge cases for domain types (`SavingsGoal`, `Money`, `Progress`). | `mobile/.claude/skills/generate-domain-fixtures/` |
| `write-architecture-justification` | Draft the trade-offs/alternatives/scalability justification for architecture and pattern decisions, for the root README. | `mobile/.claude/skills/write-architecture-justification/` |
| `generate-conventional-commit` (shared) | Gate commits on green tests, write Conventional Commits messages, create branches when a new phase starts. | `/.claude/skills/generate-conventional-commit/` |

## Agents used in this layer

| Agent | Purpose | Location |
|---|---|---|
| `ddd-boundary-reviewer` | Reviews `mobile/src` for DDD layering violations, domain purity, named-pattern placement, and coverage against the declared target. | `mobile/.claude/agents/ddd-boundary-reviewer.md` |
| `build-test-diagnostician` (shared) | Triages build/test failures and proposes a root cause before any fix is attempted. | `/.claude/agents/build-test-diagnostician.md` |

## What was generated with AI vs. written/adjusted by hand

_Filled in incrementally as Phase 3 (`mobile/`) progresses — each entry names the file(s), what the AI produced, and what was changed by hand before it was accepted._

- (pending — Phase 3 not started yet)

## What was rejected or corrected from AI output (critical judgment)

_Filled in incrementally — this section exists specifically to demonstrate critical review, not blind acceptance of AI output._

- (pending — Phase 3 not started yet)
