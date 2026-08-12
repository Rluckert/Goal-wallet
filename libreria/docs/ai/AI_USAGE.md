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

- **Scaffold** (`android/`, `ios/`, base `package.json`, `tsconfig*.json`, `babel.config.js`, `eslint.config.mjs`, `RnSavingsNotifier.podspec`): produced by the official `create-react-native-library` CLI (a code generator, not the AI assistant) — Claude ran the CLI with flags decided from reading its own `--help` output, then merged the output into `libreria/` by hand (excluding the nested `.git/` and `.github/`).
- **`example/` app**: scaffolded separately with `@react-native-community/cli init` (not the library CLI's own example generator, which was already discarded — see below), at the human's explicit request for a real, versioned verification harness instead of a throwaway. `App.tsx`, `metro.config.js`'s `watchFolders`/`blockList`/`extraNodeModules`, and `android/local.properties` handling were written/diagnosed by Claude while getting the app to actually build and run on this machine's emulator.
- **TurboModule spec** (`src/NativeRnSavingsNotifier.ts`), **Kotlin implementation** (`RnSavingsNotifierModule.kt`), **`index.tsx`**, and all tests: authored by Claude Code, directed by the human's explicit choice — initially to combine PDF Option A (`DepositInput`, native-bridged validation) with Option C (`notifyGoalCompleted`), later swapped to Option B (`showConfirmDialog`) + Option C once the redundancy below was spotted.
- **TurboModule vs NativeModule justification** (`README.md`, "TurboModule vs NativeModule" section): drafted by the `justify-turbomodule-vs-nativemodule` skill, once per method (`notifyGoalCompleted`, `showConfirmDialog` — previously `parseDepositAmount`, before the Option A→B swap) — each paragraph traces back to the actual signature and a real, named cost, not generic New-Architecture marketing copy, per the skill's own constraint.
- **`package.json` dependency fixes** (`react-native-builder-bob` pinned to `0.38.4`, `overrides` attempt, then removed once unnecessary) and **`babel.config.js`'s cross-platform regex fix**: diagnosed and written by Claude Code directly, inline in the same conversation, while getting `npm install`/`npm test` to pass in this environment.

## What was rejected or corrected from AI output (critical judgment)

- **Scope of the library's native surface.** Claude's first plan proposed only PDF Option C (`notifyGoalCompleted`, a native Toast). The human explicitly rejected settling for that and required Option A (`DepositInput`) to be the primary showcased capability, combined with — not replacing — Option C. The library ended up with two justified native methods instead of one because of this correction.
- **`--languages kotlin-swift` scaffold flag.** Based on `create-react-native-library --help`'s general option list, the first scaffold attempt used `--languages kotlin-swift`. The CLI itself rejected it for `--type turbo-module` (only `kotlin-objc`/`cpp` are valid for that combination) — corrected against the tool's actual error output, not assumed from the docs a second time.
- **`--tools eslint,jest` flag syntax.** Assumed comma-separated per `--help`'s phrasing; the CLI rejected it and required the flag repeated once per value (`--tools eslint --tools jest`). Corrected from the tool's error message.
- **`--example test-app`.** Chosen first as the lighter-weight example option; it crashed under this machine's Node 20.18 (`react-native-test-app`'s ESM template loader requires Node ≥20.19). Switched to `--example vanilla` during the initial scaffold — that copy was later deleted, and a separate, permanent `example/` app was built afterward at the human's request (see above); it is not the same artifact.
- **Not "fixing" the iOS stub.** The scaffolded `ios/RnSavingsNotifier.h`/`.mm` still reference the tool's placeholder `multiply` method, not the real API. Claude considered hand-updating the Objective-C++ to match the new spec, then rejected that idea for itself: without Xcode/macOS to compile it, a hand-written "fix" would be unverifiable and could introduce a plausible-looking but wrong change. Left untouched and documented as a known gap in `README.md` instead.
- **Option A → Option B swap, a working feature removed on product grounds, not a bug.** `<DepositInput/>` (Option A) was fully implemented, tested, and verified on-device before this correction — the issue wasn't that it was broken, it was that `mobile/`'s goal list rendered it right next to a `WebView` detail screen that already handles deposits via `postMessage`, so the app offered two redundant ways to do the same thing. The human caught this after seeing the running app, not from a code read, and directed the swap to Option B (`showConfirmDialog`) explicitly rather than leaving it to be inferred. `parseDepositAmount` (and its `triggerHapticFeedback` helper) were removed along with `DepositInput.tsx` rather than left as unused native surface — nothing in the codebase would have called it again.
- **Overly broad Metro `blockList`.** First attempt blocked all of `libreria/node_modules` to stop Metro from seeing its conflicting react-native devDependency — this also hid `@babel/runtime`, which the compiled `lib/` output genuinely needs, breaking the bundle with a different error. Corrected by narrowing the block to just `react`, `react-native`, and `@react-native` inside `libreria/node_modules`, verified by rebuilding and confirming the app actually renders and both native methods work on-device.
