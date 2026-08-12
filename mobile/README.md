# mobile/ — Savings Goal Wallet (native shell)

React Native app (community CLI, RN 0.81.4 + React 19, **not Expo**) that is the final entry point of the exam: native goal list + Redux state, a `WebView`-hosted goal detail/deposit micro-app (`web/`), and a real native module (`rn-savings-notifier` from `libreria/`) consumed as a dependency.

## What it does

- **Native goal list** (`GoalListScreen`): every goal's name, target, saved amount and progress %, sourced from Redux — read-only. Tapping a goal calls `rn-savings-notifier`'s `showConfirmDialog` (a native `AlertDialog`, Yes/No) asking whether to modify it; only on "Yes" does it navigate to the detail screen. Depositing only ever happens one way — through the WebView below — instead of duplicating that flow with a second native input.
- **WebView goal detail** (`GoalDetailScreen`): loads `web/`'s built micro-app as a packaged local asset and exchanges `postMessage`s with it.
- **Native completion notification**: when a deposit brings a goal to exactly 100%, `rn-savings-notifier`'s `notifyGoalCompleted` fires a native Toast.

## Architecture — DDD layers

```
src/
  domain/          Money, Progress, SavingsGoal — pure business rules, zero RN/Redux imports
  application/      GetGoals, MakeDeposit — use cases over a GoalsRepository interface
  infrastructure/    InMemoryGoalsRepository, Redux store/slice, WebView adapter/contracts,
                     the rn-savings-notifier wrappers (SavingsNotifier, ConfirmDialog) — the only
                     layer allowed to import RN/Redux/the library
  presentation/       screens, hooks — reads Redux via typed hooks, never reaches into infrastructure/ internals directly
```

Enforced by (and checkable with) `.claude/agents/ddd-boundary-reviewer.md`.

### Named design patterns

- **Adapter** — `infrastructure/webview/WebViewMessageAdapter.ts` is the only place that parses a raw `postMessage` JSON string into a typed domain event, or serializes the outgoing `INIT_SESSION` handshake. Presentation screens use the exported singleton (`webViewMessageAdapter`); they don't construct their own.
- **Repository** — `application/GoalsRepository.ts` is the interface `GetGoals`/`MakeDeposit` depend on; `infrastructure/repositories/InMemoryGoalsRepository.ts` is the concrete (in-memory, no backend) implementation. Swapping to a real backend later only touches this one file.

See the root `README.md`'s architecture section for the trade-off write-up (alternatives considered, what's given up).

## postMessage contract

Mirrors `web/`'s contract (`web/src/contract.ts` ↔ `mobile/src/infrastructure/webview/contracts.ts`), independently typed on both sides per `web/README.md`'s stated design — `web/` is not evaluated and must only emit/receive `postMessage`.

| Direction | Type | Payload | When |
|---|---|---|---|
| Native → Web | `INIT_SESSION` | `{ sessionId, goalId, userInfo: { id, name }, goal: { id, name, targetAmount, savedAmount } }` | Sent once `GoalDetailScreen`'s `WebView` finishes loading. |
| Web → Native | `DEPOSIT_CONFIRMED` | `{ goalId, amount }` | Sent when the web form's deposit is confirmed; routed through `WebViewMessageAdapter` into the `makeDeposit` thunk. |

## Installation and running

### Prerequisites

- Node 20+ (`>= 20.19.4` is what RN 0.81.4's own toolchain asks for; this repo has been run on 20.18 with `EBADENGINE` warnings only, no functional issue).
- Android SDK + an emulator (or a physical device with USB debugging). `ANDROID_HOME` must point at the SDK, or create `android/local.properties` with `sdk.dir=<path>` (gitignored, machine-specific).
- JDK 17+.
- iOS: **not built/verified** — see "Known limitations" below.

### Steps

```bash
# 1. Build the library this app depends on
cd libreria
npm install
npm run prepare

# 2. Build the web micro-app this app's WebView loads
cd ../web
npm install
npm run build

# 3. Install mobile/'s own dependencies (symlinks rn-savings-notifier -> ../libreria via file:)
cd ../mobile
npm install

# 4. Package web/'s build output into Android assets
npm run copy-webapp

# 5. With an emulator running (or a device connected via adb):
npx react-native run-android
```

If `run-android` can't resolve `rn-savings-notifier`, make sure `libreria/` was built first (step 1) — `metro.config.js` here watches `../libreria` specifically so Metro can see the `file:` symlink's target, the same fix `libreria/example/metro.config.js` needed.

## Testing and coverage

```bash
npm test               # jest
npm run test:coverage  # jest --coverage
npm run typecheck      # tsc --noEmit
```

Current coverage: **100%** statements/branches/functions/lines on `domain/` and `application/` (the declared ≥70% target, exceeded), ~95%+ on `infrastructure/` and `presentation/`. `rn-savings-notifier` and `react-native-webview` are mocked in tests that touch them — both hit `TurboModuleRegistry`/native view managers at module load, which don't resolve outside a real native runtime.

## Known limitations / intentional simplifications

- **No `react-navigation`.** Two screens (list/detail) are switched with a local `useState` in `App.tsx` instead. Avoids the extra native linking (`react-native-screens`, `react-native-gesture-handler`, `react-native-safe-area-context` wiring) a navigation library would add for a case this small — documented here rather than added speculatively.
- **iOS is not built or verified.** No macOS/Xcode on this machine, same constraint `libreria/README.md` documents for the library itself. `GoalDetailScreen`'s WebView `source` uses the Android asset path (`file:///android_asset/...`) only; iOS would need a different bundle-resource loading strategy.
- **No auth/session system.** `GoalDetailScreen` sends a fixed demo user (`DEMO_USER` in the screen itself) as the `INIT_SESSION` payload's `userInfo` — there's no login flow in scope for this exam.
- **In-memory data only, no persistence.** `InMemoryGoalsRepository` resets on every app restart, per the exam's "no backend required" scope. HU4's "deseable" persistence was not implemented.

## AI usage

See [`docs/ai/AI_USAGE.md`](./docs/ai/AI_USAGE.md) for which skills/agents were used in this layer and what was generated vs. hand-adjusted.
