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

- **Scaffold** (`android/`, `ios/`, base `package.json`, `tsconfig*.json`, `babel.config.js`, `eslint.config.mjs`, `RnSavingsNotifier.podspec`): produced by the official `create-react-native-library` CLI (a code generator, not the AI assistant) — Claude ran the CLI with flags decided from reading its own `--help` output, then merged the output into `libreria/` by hand (excluding the nested `.git/`, the `example/` app, and `.github/`).
- **TurboModule spec** (`src/NativeRnSavingsNotifier.ts`), **Kotlin implementation** (`RnSavingsNotifierModule.kt`), **`DepositInput.tsx`**, **`index.tsx`**, and all tests: authored by Claude Code, directed by the human's explicit choice to combine PDF Option A (`DepositInput`, native-bridged validation) with Option C (`notifyGoalCompleted`) rather than either alone.
- **TurboModule vs NativeModule justification** (`README.md`, "TurboModule vs NativeModule" section): drafted by the `justify-turbomodule-vs-nativemodule` skill, once per method (`notifyGoalCompleted`, `parseDepositAmount`) — each paragraph traces back to the actual signature and a real, named cost, not generic New-Architecture marketing copy, per the skill's own constraint.
- **`package.json` dependency fixes** (`react-native-builder-bob` pinned to `0.38.4`, `overrides` attempt, then removed once unnecessary) and **`babel.config.js`'s cross-platform regex fix**: diagnosed and written by Claude Code directly, inline in the same conversation, while getting `npm install`/`npm test` to pass in this environment.

## What was rejected or corrected from AI output (critical judgment)

- **Scope of the library's native surface.** Claude's first plan proposed only PDF Option C (`notifyGoalCompleted`, a native Toast). The human explicitly rejected settling for that and required Option A (`DepositInput`) to be the primary showcased capability, combined with — not replacing — Option C. The library ended up with two justified native methods instead of one because of this correction.
- **`--languages kotlin-swift` scaffold flag.** Based on `create-react-native-library --help`'s general option list, the first scaffold attempt used `--languages kotlin-swift`. The CLI itself rejected it for `--type turbo-module` (only `kotlin-objc`/`cpp` are valid for that combination) — corrected against the tool's actual error output, not assumed from the docs a second time.
- **`--tools eslint,jest` flag syntax.** Assumed comma-separated per `--help`'s phrasing; the CLI rejected it and required the flag repeated once per value (`--tools eslint --tools jest`). Corrected from the tool's error message.
- **`--example test-app`.** Chosen first as the lighter-weight example option; it crashed under this machine's Node 20.18 (`react-native-test-app`'s ESM template loader requires Node ≥20.19). Switched to `--example vanilla`, and the whole `example/` directory was deleted afterward anyway since `mobile/` (Phase 3) is the library's real consumer — no example app ships in the final `libreria/`.
- **Not "fixing" the iOS stub.** The scaffolded `ios/RnSavingsNotifier.h`/`.mm` still reference the tool's placeholder `multiply` method, not the real API. Claude considered hand-updating the Objective-C++ to match the new spec, then rejected that idea for itself: without Xcode/macOS to compile it, a hand-written "fix" would be unverifiable and could introduce a plausible-looking but wrong change. Left untouched and documented as a known gap in `README.md` instead.
