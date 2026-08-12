# Goal-wallet

"Bolsillo de Ahorro Programado" (Savings Goal Wallet) — a React Native shell + WebView micro-app + custom native library exam project. Three components, one monorepo:

```
goal-wallet/
├── web/        micro-app (WebView) — HTML/TS, emits/receives postMessage only. Not evaluated, no tests.
├── libreria/   rn-savings-notifier — custom library with a real native module (Android/Kotlin TurboModule)
└── mobile/     the native shell — DDD layers, Redux, WebView host, consumes libreria/
```

## Versions

| | Version |
|---|---|
| Node | 20.18+ (repo built/run on 20.18; toolchain asks for `20.19.4+` — `EBADENGINE` warnings only, no functional issue on this machine) |
| React Native (`mobile/`) | 0.81.4 |
| React (`mobile/`) | 19.1.0 |
| React Native (`libreria/`'s own dev/test/example environment) | 0.85.0 |
| React (`libreria/`'s own dev/test/example environment) | 19.2.3 |

`libreria/`'s `peerDependencies` for `react`/`react-native` are `"*"` — the library builds and tests against a newer RN/React than `mobile/` consumes it with, and that's fine; nothing in its public API is version-coupled.

## Install and run

### 1. Build the library

```bash
cd libreria
npm install
npm run prepare        # bob build: src/ -> lib/, required before anything links against it
```

### 2. Build the web micro-app

```bash
cd web
npm install
npm run build           # tsc --noEmit + esbuild -> dist/bundle.js
```

### 3. Install and run the mobile app (Android)

```bash
cd mobile
npm install              # symlinks rn-savings-notifier -> ../libreria via file:
npm run copy-webapp      # packages web/'s build output into android/app/src/main/assets/webapp/

# with an Android emulator running (or a device connected via adb):
npx react-native run-android
```

**iOS is not built or verified anywhere in this repo** — no macOS/Xcode available on the machine this was built on. See `libreria/README.md` and `mobile/README.md`'s "Known limitations" sections for what iOS support would require.

If Metro can't resolve `rn-savings-notifier`, make sure step 1 ran first — `mobile/metro.config.js` watches `../libreria` specifically to see through the `file:` symlink.

## Testing and coverage

```bash
# libreria/
cd libreria
npm test               # jest
npm run test:coverage  # jest --coverage

# mobile/
cd mobile
npm test               # jest
npm run test:coverage  # jest --coverage
```

- **`libreria/`**: 100% statements/branches/functions/lines on `src/DepositInput.tsx` and `src/index.tsx` (the two files with real logic; the Codegen spec is type-only and mocked in every test).
- **`mobile/`**: 100% on `domain/` and `application/` (the exam's declared ≥70% core target, exceeded), ~95%+ on `infrastructure/` and `presentation/`. `rn-savings-notifier` and `react-native-webview` are mocked wherever imported in tests — both hit native module/view-manager lookups at module load that only resolve inside a real native runtime.
- **`web/`**: no test suite, per the exam spec — it's not evaluated, only required to emit/receive `postMessage` correctly.

## Architecture

`mobile/` separates explicitly into DDD layers:

```
mobile/src/
  domain/           SavingsGoal, Money, Progress — pure business rules, zero RN/Redux imports
  application/       GetGoals, MakeDeposit — use cases over a GoalsRepository interface
  infrastructure/     InMemoryGoalsRepository, Redux store/slice, WebView adapter/contracts,
                      the rn-savings-notifier wrapper — the only layer allowed to import RN/Redux/the library
  presentation/        screens (GoalListScreen, GoalDetailScreen), hooks — reads Redux via typed
                        hooks, never reaches into infrastructure/ internals directly
```

`domain/` → `application/` → `infrastructure/`/`presentation/` is a one-way dependency direction: `application/` depends on a repository *interface*, never a concrete `infrastructure/` class, so the direction can't silently invert. Checkable with `mobile/.claude/agents/ddd-boundary-reviewer.md`.

### Architecture decisions

**Adapter — `mobile/src/infrastructure/webview/WebViewMessageAdapter.ts`.** This is the only place in the app that touches a raw `postMessage` string: `parseIncoming()` turns it into a typed `DepositConfirmedEvent` (or `null` for anything malformed or outside the contract), and `buildInitSessionPayload()` serializes the outgoing handshake. An Observer/Pub-Sub channel was considered instead — but this project has exactly one message type per direction and exactly one consumer (`GoalDetailScreen`), so a subscribe/unsubscribe layer would add lifecycle management for a multi-consumer problem this app doesn't have, while still needing something to do the actual JSON-parsing-and-type-guarding job, which is the real risk here (the WebView can send anything). The cost accepted: every new message type has to be added to this one file, a single growing surface rather than logic spread across screens — deliberate, since it keeps the wire contract auditable in one place, mirroring how `web/src/contract.ts` is itself the single source of truth on the other side. If the app grew more message types (`GOAL_EDITED`, `GOAL_DELETED`, …), `parseIncoming` would grow into a discriminated-union dispatch rather than needing a rewrite.

**Repository — `mobile/src/application/GoalsRepository.ts` (interface) + `mobile/src/infrastructure/repositories/InMemoryGoalsRepository.ts` (implementation).** `GetGoals`/`MakeDeposit` depend only on the interface; `infrastructure/redux/goalsSlice.ts` is what wires the concrete in-memory class in. The alternative of calling `InMemoryGoalsRepository` directly from `application/` was rejected because it would invert the DDD dependency direction (`application/` importing a concrete `infrastructure/` class) and couple the use cases to "in-memory" by name — swapping to a real backend later would mean editing `GetGoals`/`MakeDeposit` themselves instead of adding one new class. A single shared repository across future aggregates was also considered and rejected: `GoalsRepository`'s three methods (`getAll`/`getById`/`save`) are scoped exactly to what `SavingsGoal` needs, and a shared repository would either grow an ever-wider method surface or leak unrelated aggregate access into code that only touches goals. The cost accepted: an interface plus one implementation is more ceremony than a single class, for a project with exactly one aggregate and no real backend — worth it here specifically because this boundary is what the exam asks to demonstrate, and it costs one extra file at this scale. Swapping in a real backend later is a new class implementing the same interface, plus one line in `goalsSlice.ts`'s composition; `GetGoals`, `MakeDeposit`, and every test written against the interface don't change.

## postMessage contract

The web ↔ native bridge, defined independently on both sides (`web/src/contract.ts`, `mobile/src/infrastructure/webview/contracts.ts`) per `web/README.md`'s stated design — `web/` isn't evaluated and must only emit/receive `postMessage`, so nothing is imported across the boundary.

| Direction | Type | Payload | When |
|---|---|---|---|
| Native → Web | `INIT_SESSION` | `{ sessionId, goalId, userInfo: { id, name }, goal: { id, name, targetAmount, savedAmount } }` | Sent once, right after `GoalDetailScreen`'s `WebView` finishes loading, with the goal snapshot to render. |
| Web → Native | `DEPOSIT_CONFIRMED` | `{ goalId, amount }` | Sent when the web form's deposit is confirmed; parsed by `WebViewMessageAdapter` and dispatched into the `makeDeposit` Redux thunk. |

## Uso de IA

AI (Claude Code) was used throughout `libreria/` and `mobile/`, governed with project-specific skills and agents (not used in `web/`, which is out of the exam's IA-governance requirement). Each evaluated layer documents its own usage in detail:

- [`libreria/docs/ai/AI_USAGE.md`](./libreria/docs/ai/AI_USAGE.md)
- [`mobile/docs/ai/AI_USAGE.md`](./mobile/docs/ai/AI_USAGE.md)

Shared across both layers: `.claude/skills/generate-conventional-commit/` (gates every commit on green tests, writes Conventional Commits messages, branches per phase) and `.claude/agents/build-test-diagnostician.md` (root-causes build/test failures before a fix is attempted).
