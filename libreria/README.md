# libreria/ — rn-savings-notifier

Custom React Native library with real native code (Android/Kotlin), built with [`react-native-builder-bob`](https://github.com/callstack/react-native-builder-bob) as a **TurboModule**. Consumed by `mobile/` as a dependency (not copied code).

## What it exposes

- **`showConfirmDialog({ title, message }): Promise<boolean>`** — opens a native `AlertDialog` (Android) with Yes/No buttons and resolves with the user's choice (`false` on "No" or on dismissal). Used by `mobile/` to confirm the user wants to modify a goal before navigating to its detail.
- **`notifyGoalCompleted(goalName: string): void`** — shows a native Toast confirmation. Intended to be called once, from `mobile/`, when a goal's saved amount reaches its target.

An earlier version of this library exposed `<DepositInput/>` (Option A from the exam spec: a native amount input + button). It was removed once `mobile/`'s goal list started duplicating the deposit flow the `WebView` detail screen already provides via `postMessage` — two ways to do the same thing. `showConfirmDialog` (Option B) replaced it.

## Installation (local, monorepo-only — this package is not published)

In `mobile/package.json`:

```json
{
  "dependencies": {
    "rn-savings-notifier": "file:../libreria"
  }
}
```

Then `npm install` from `mobile/`. Autolinking (React Native's CLI-based autolinking, not Expo's) picks up the `android/` folder automatically via this package's `react-native-builder-bob`/codegen config in `package.json` — no manual `MainApplication` edits needed. The library must be **built** first (`npm run prepare` inside `libreria/`, which runs `bob build` and produces `lib/module` + `lib/typescript`) since `package.json`'s `main`/`types` fields point there, not at `src/`.

## Example app (manual verification)

`example/` is a real, versioned RN 0.81.4 app (not a throwaway) used to manually verify the native module actually builds, links, and works end to end — a TurboModule can't be verified in isolation, it needs a consuming app. It links this library via `"rn-savings-notifier": "file:.."` and renders both `notifyGoalCompleted` and `showConfirmDialog` on screen (`example/App.tsx`).

### Prerequisites

- Node 20+ (see `example/package.json`'s `engines`).
- Android SDK + an emulator (via Android Studio) or a physical device with USB debugging on. `ANDROID_HOME` must point at the SDK.
- JDK 17+ (JDK 21 was used here).
- iOS: not tested/supported in this repo (see "Known limitations" below) — Xcode/CocoaPods steps aren't documented.

### Run it (standard path)

```bash
cd libreria
npm install
npm run prepare        # builds lib/ — required before linking, and after any src/ change

cd example
npm install             # symlinks rn-savings-notifier -> ../ via the file: dependency

# have an emulator running (or a device connected via adb), then:
npx react-native run-android
```

This should build, install, and launch the app, with Metro started automatically.

### What this confirmed

Built and run on a real Android emulator (Medium_Phone_API_36) prior to the `showConfirmDialog` swap: the TurboModule Codegen (C++/JNI) compiles for all 4 ABIs, autolinking discovers the library with no manual native edits, and `notifyGoalCompleted` fires a Toast on-device. `showConfirmDialog` is new Kotlin (see "Known limitations") — pending the same real-device confirmation the rest of this library already has.

### If Metro can't resolve the library or crashes with a version mismatch

`example/metro.config.js` sets `watchFolders` (so Metro can see the library's source through the `file:` symlink) and a narrow `resolver.blockList` for `libreria/node_modules/{react,react-native,@react-native}` specifically. This is necessary because `libreria/node_modules` has its own react-native copy (used only for the library's own unit tests, a different version than the example app's) — without the block, Metro sees both copies at once and its codegen for React Native's own internal components breaks. If you add new dependencies to `libreria/` that the example needs, you may need to extend `extraNodeModules`/`blockList` in `example/metro.config.js` similarly.

## Public API

```ts
import { notifyGoalCompleted, showConfirmDialog } from 'rn-savings-notifier';

// In the goal list, before navigating to a goal's detail:
const confirmed = await showConfirmDialog({
  title: goal.name,
  message: 'Would you like to make a deposit to this goal?',
});
if (confirmed) {
  openGoalDetail(goal.id);
}

// After a deposit brings a goal to 100%:
notifyGoalCompleted(goal.name);
```

`notifyGoalCompleted` validates its argument in JS before crossing the bridge — an empty/blank `goalName` throws immediately rather than silently no-op-ing natively. `showConfirmDialog`'s public call takes a `{title, message}` object; the native bridge itself takes two plain strings (see "TurboModule vs NativeModule" below for why).

## TurboModule vs NativeModule

### `notifyGoalCompleted(goalName: string): void`

This method is implemented as a **TurboModule**, not a classic `NativeModule`. Since it's fire-and-forget `void`, the sync-vs-async question that usually drives this decision is moot here — a classic bridge handles a void call just as well, so that's not the reason. The real reasons: Codegen generates `NativeRnSavingsNotifierSpec`, a compile-time-checked Kotlin abstract class from the TS spec in `src/NativeRnSavingsNotifier.ts`, so a signature drift between JS and Kotlin (wrong param type, renamed method) fails the build instead of surfacing as a silent runtime crash from manual `ReadableMap` access, which is what a classic `NativeModules.RnSavingsNotifier.notifyGoalCompleted(...)` call would risk. `mobile/` targets RN 0.81+, which defaults to the New Architecture, so staying on TurboModule also avoids routing this call through the legacy interop layer New-Architecture apps use to keep old-style NativeModules working. The cost accepted: even for a method this trivial, we pay the Codegen setup tax — the `codegenConfig` block in `package.json` and an extra build-time codegen pass that a classic NativeModule wouldn't require.

### `showConfirmDialog(title: string, message: string): Promise<boolean>`

This one is genuinely async by necessity, not by convention: the call waits on real user interaction with an `AlertDialog` that can stay open indefinitely, so a synchronous return isn't an option — but both TurboModules and classic NativeModules support `Promise`-returning methods equally well, so that alone still doesn't pick a winner (same honest conclusion as the old `parseDepositAmount` entry this one replaces). What TurboModule actually buys here is Codegen enforcing that the Kotlin signature (`String, String, Promise`) matches the TS spec's `(title: string, message: string): Promise<boolean>` exactly, and that the resolved value is typed `boolean` end-to-end — from `promise.resolve(true)`/`promise.resolve(false)` in `RnSavingsNotifierModule.kt` through to `showConfirmDialog(...)`'s `Promise<boolean>` in `index.tsx` and `mobile/`'s `ConfirmDialog` wrapper. A classic bridge would let a Kotlin-side mistake (swapped argument order, resolving a string instead of a boolean) pass silently until a runtime crash. The cost: same Codegen regeneration tax as always, plus this method touches `currentActivity` and the UI thread directly (`UiThreadUtil.runOnUiThread` + `AlertDialog.Builder`) — the null-activity edge case (app backgrounded when this fires) is handled by hand with `promise.reject("NO_ACTIVITY", ...)`, since Codegen's type safety covers the call's shape, not runtime preconditions like activity availability.

## Testing and coverage

```bash
npm install
npm test               # jest
npm run test:coverage  # jest --coverage
npm run typecheck      # tsc
```

Current coverage on `src/index.tsx` (the only file with real logic; `NativeRnSavingsNotifier.ts` is a type-only Codegen spec, mocked out in every test): **100%** statements/branches/functions/lines.

## How this would be published

This package is consumed locally (`file:../libreria`) and was never pushed to a registry. To actually publish it:

1. `npm run prepare` (already runs automatically on `npm install` via the `prepare` script) — builds `src/` → `lib/` with `bob build`.
2. `npm pack` to inspect the exact tarball contents before publishing (`files` in `package.json` already excludes `__tests__`, `android/build`, etc.).
3. For a private/internal registry instead of public npm, point `publishConfig.registry` in `package.json` at a local [Verdaccio](https://verdaccio.org/) instance and `npm publish` against it.

## Known limitations

- **iOS is not implemented.** The scaffold generated `ios/RnSavingsNotifier.h`/`.mm` with the tool's placeholder `multiply` example; it was intentionally left untouched rather than "fixed" without a way to compile or run it — this machine has no macOS/Xcode, so any hand-written Objective-C++ change would be unverifiable and could plausibly be wrong. To add real iOS support: implement `notifyGoalCompleted:` (a local `UNUserNotificationCenter`/banner call) and `showConfirmDialog:message:resolve:reject:` (a `UIAlertController` with two actions, resolving/rejecting the promise from each) against the regenerated Objective-C++ Turbo spec protocol, then verify on a Mac.
- **`showConfirmDialog`'s Kotlin implementation is new** (replaced `parseDepositAmount`) — see `mobile/README.md` for its real-device verification status once `mobile/` links this build.
- **Local dev environment note (Windows, Node 20.18):** the scaffolded `babel.config.js` used `/\/node_modules\//` to route node_modules files through `@react-native/babel-preset` — that regex never matches on Windows (backslash paths), which silently broke Flow parsing (via `babel-plugin-syntax-hermes-parser`) for `@react-native/jest-preset`'s own source and made `npm test` fail with a syntax error unrelated to this library's code. Fixed by matching both path separators (`/[\\/]node_modules[\\/]/`). Also pinned `react-native-builder-bob` to `0.38.4` (instead of the scaffold's latest) because newer versions pull an ESM-only dependency (`arktype`) that `require()` cannot load under Node <20.19 — this environment runs Node 20.18.
