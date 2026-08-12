# AI Usage — libreria/

This document tracks how AI (Claude Code) was governed while building the `libreria/` layer (`rn-savings-notifier`) of the `goal-wallet` exam, per the exam's requirement to explain *how* AI use was governed, not just that it was used.

## Skills used in this layer

| Skill | Purpose | Location |
|---|---|---|
| `justify-turbomodule-vs-nativemodule` | Draft the trade-off analysis that justifies the TurboModule vs classic NativeModule bridge choice for a given native method. | `libreria/.claude/skills/justify-turbomodule-vs-nativemodule/` |
| `generate-conventional-commit` (shared) | Gate commits on green tests, write Conventional Commits messages, create branches when a new phase starts. | `/.claude/skills/generate-conventional-commit/` |

## Agents used in this layer

| Agent | Purpose | Location |
|---|---|---|
| `build-test-diagnostician` (shared) | Triages build/test failures — including native Kotlin build errors and TS↔Kotlin signature mismatches — and proposes a root cause before any fix is attempted. | `/.claude/agents/build-test-diagnostician.md` |

## What was generated with AI vs. written/adjusted by hand

_Filled in incrementally as Phase 2 (`libreria/`) progresses — each entry names the file(s), what the AI produced, and what was changed by hand before it was accepted._

- (pending — Phase 2 not started yet)

## What was rejected or corrected from AI output (critical judgment)

_Filled in incrementally — this section exists specifically to demonstrate critical review, not blind acceptance of AI output._

- (pending — Phase 2 not started yet)
