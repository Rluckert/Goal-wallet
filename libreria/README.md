# libreria/ — rn-savings-notifier

Custom React Native library with real native code (Android/Kotlin), built with [`react-native-builder-bob`](https://github.com/callstack/react-native-builder-bob) as a **TurboModule**. Consumed by `mobile/` as a dependency (not copied code).

## What it exposes

- **`<DepositInput onConfirm={(amount) => void} />`** — a `TextInput` + "Deposit" button. Pressing the button calls the native `parseDepositAmount` method to validate/parse the raw text (locale-aware) and trigger haptic feedback; `onConfirm` only fires once the native side has confirmed a valid amount.
- **`notifyGoalCompleted(goalName: string): void`** — shows a native Toast confirmation. Intended to be called once, from `mobile/`, when a goal's saved amount reaches its target.

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

`example/` is a real, versioned RN 0.81.4 app (not a throwaway) used to manually verify the native module actually builds, links, and works end to end — a TurboModule can't be verified in isolation, it needs a consuming app. It links this library via `"rn-savings-notifier": "file:.."` and renders both `notifyGoalCompleted` and `<DepositInput />` on screen (`example/App.tsx`).

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

This should build, install, and launch the app, with Metro started automatically. If it works, you're done — skip the fallback below.

### If `run-android` fails on Windows

On this machine, `npx react-native run-android` fails with `"gradlew.bat" no se reconoce como un comando interno o externo` — `@react-native-community/cli`'s subprocess spawn of `gradlew.bat` doesn't work on Windows (Node's `child_process.spawn` can't execute `.bat` files without an explicit shell), even though `gradlew.bat` itself runs fine when invoked directly. If you hit the same error, run what `run-android` does internally by hand, in two terminals:

```bash
# terminal 1, from libreria/example:
npx react-native start

# terminal 2, from libreria/example/android:
./gradlew.bat app:installDebug     # Windows
./gradlew app:installDebug         # macOS/Linux

# then, with the emulator/device running:
adb reverse tcp:8081 tcp:8081
adb shell am start -n com.example/.MainActivity
```

### What this confirmed

Built and run on a real Android emulator (Medium_Phone_API_36): the TurboModule Codegen (C++/JNI) compiles for all 4 ABIs, autolinking discovers the library with no manual native edits, and both methods work on-device — Toast on `notifyGoalCompleted`, haptic feedback + the resolved amount on a valid deposit, Toast + inline error on an invalid one.

### If Metro can't resolve the library or crashes with a version mismatch

`example/metro.config.js` sets `watchFolders` (so Metro can see the library's source through the `file:` symlink) and a narrow `resolver.blockList` for `libreria/node_modules/{react,react-native,@react-native}` specifically. This is necessary because `libreria/node_modules` has its own react-native copy (used only for the library's own unit tests, a different version than the example app's) — without the block, Metro sees both copies at once and its codegen for React Native's own internal components breaks. If you add new dependencies to `libreria/` that the example needs, you may need to extend `extraNodeModules`/`blockList` in `example/metro.config.js` similarly.

## Public API

```ts
import { DepositInput, notifyGoalCompleted } from 'rn-savings-notifier';

// In a goal detail screen:
<DepositInput onConfirm={(amount) => dispatch(depositConfirmed({ goalId, amount }))} />;

// After a deposit brings a goal to 100%:
notifyGoalCompleted(goal.name);
```

`notifyGoalCompleted` validates its argument in JS before crossing the bridge — an empty/blank `goalName` throws immediately rather than silently no-op-ing natively. `DepositInput` does not duplicate validation in JS: the raw text is only ever interpreted by the native `parseDepositAmount`, so there is exactly one place that decides what counts as a valid amount.

## TurboModule vs NativeModule

### `notifyGoalCompleted(goalName: string): void`

This method is implemented as a **TurboModule**, not a classic `NativeModule`. Since it's fire-and-forget `void`, the sync-vs-async question that usually drives this decision is moot here — a classic bridge handles a void call just as well, so that's not the reason. The real reasons: Codegen generates `NativeRnSavingsNotifierSpec`, a compile-time-checked Kotlin abstract class from the TS spec in `src/NativeRnSavingsNotifier.ts`, so a signature drift between JS and Kotlin (wrong param type, renamed method) fails the build instead of surfacing as a silent runtime crash from manual `ReadableMap` access, which is what a classic `NativeModules.RnSavingsNotifier.notifyGoalCompleted(...)` call would risk. `mobile/` targets RN 0.81+, which defaults to the New Architecture, so staying on TurboModule also avoids routing this call through the legacy interop layer New-Architecture apps use to keep old-style NativeModules working. The cost accepted: even for a method this trivial, we pay the Codegen setup tax — the `codegenConfig` block in `package.json` and an extra build-time codegen pass that a classic NativeModule wouldn't require.

### `parseDepositAmount(rawAmount: string): Promise<number>`

Here async is the natural fit either way: parsing `rawAmount` with `NumberFormat.getInstance(Locale.getDefault())` and triggering the haptic-feedback/Toast side effect must complete before JS gets a result, and both TurboModules and classic NativeModules support `Promise`-returning methods equally well — so unlike the sync/async framing, this axis doesn't favor either approach. What TurboModule actually buys here is Codegen enforcing that the Kotlin signature (`String, Promise`) matches the TS spec exactly, and that the resolved value is typed as `number` end-to-end — from `promise.resolve(parsed)` in Kotlin through to `DepositInput`'s `await NativeRnSavingsNotifier.parseDepositAmount(rawAmount)`, typed as `Promise<number>` at the call site. With a classic bridge, that same `promise.resolve(parsed)` would still work at runtime, but nothing would catch it at build time if the native side started resolving a string instead of a number. The cost: Codegen has to regenerate whenever this signature changes, and it doesn't remove the manual work of choosing reject codes (`INVALID_AMOUNT`) in the Kotlin `Promise` — TurboModule checks the shape of that boilerplate, it doesn't eliminate it.

## Testing and coverage

```bash
npm install
npm test               # jest
npm run test:coverage  # jest --coverage
npm run typecheck      # tsc
```

Current coverage on `src/DepositInput.tsx` and `src/index.tsx` (the two files with real logic; `NativeRnSavingsNotifier.ts` is a type-only Codegen spec, mocked out in every test): **100%** statements/branches/functions/lines.

## How this would be published

This package is consumed locally (`file:../libreria`) and was never pushed to a registry. To actually publish it:

1. `npm run prepare` (already runs automatically on `npm install` via the `prepare` script) — builds `src/` → `lib/` with `bob build`.
2. `npm pack` to inspect the exact tarball contents before publishing (`files` in `package.json` already excludes `__tests__`, `android/build`, etc.).
3. For a private/internal registry instead of public npm, point `publishConfig.registry` in `package.json` at a local [Verdaccio](https://verdaccio.org/) instance and `npm publish` against it.

## Known limitations

- **iOS is not implemented.** The scaffold generated `ios/RnSavingsNotifier.h`/`.mm` with the tool's placeholder `multiply` example; it was intentionally left untouched rather than "fixed" without a way to compile or run it — this machine has no macOS/Xcode, so any hand-written Objective-C++ change would be unverifiable and could plausibly be wrong. To add real iOS support: implement `notifyGoalCompleted:` (a local `UNUserNotificationCenter`/banner call) and `parseDepositAmount:resolve:reject:` (using `NSNumberFormatter` for the same locale-aware parsing the Kotlin side does) against the regenerated Objective-C++ Turbo spec protocol, then verify on a Mac.
- **Native Kotlin compilation isn't independently verified in this phase.** `npm test`/`npm run typecheck` cover the JS/TS layer; the Kotlin module compiles for real once `mobile/` (Phase 3) links this library into an actual Gradle build. Documented here rather than claimed as done.
- **Local dev environment note (Windows, Node 20.18):** the scaffolded `babel.config.js` used `/\/node_modules\//` to route node_modules files through `@react-native/babel-preset` — that regex never matches on Windows (backslash paths), which silently broke Flow parsing (via `babel-plugin-syntax-hermes-parser`) for `@react-native/jest-preset`'s own source and made `npm test` fail with a syntax error unrelated to this library's code. Fixed by matching both path separators (`/[\\/]node_modules[\\/]/`). Also pinned `react-native-builder-bob` to `0.38.4` (instead of the scaffold's latest) because newer versions pull an ESM-only dependency (`arktype`) that `require()` cannot load under Node <20.19 — this environment runs Node 20.18.
