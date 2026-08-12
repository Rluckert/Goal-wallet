---
name: justify-turbomodule-vs-nativemodule
description: Drafts the trade-off analysis (sync vs async needs, Codegen fit, New Architecture alignment) that justifies choosing TurboModule or a classic NativeModule bridge for a given native capability of rn-savings-notifier. Use before or right after implementing a new native method, to produce the justification the exam's README and live defense require.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# justify-turbomodule-vs-nativemodule

Produces the written justification the exam explicitly asks for: "the module native como TurboModule suma más que el bridge clásico, siempre que lo justifiques." This skill drafts that justification for a specific native capability, grounded in what the capability actually needs — not a generic essay about the New Architecture.

## When to invoke

- Right after scaffolding `libreria/` and deciding how `notifyGoalCompleted` (or any later native method) will be bridged.
- Whenever a new method is added to the library's native surface and needs its own justification entry.

## Procedure

1. **Read the actual method signature** being justified (the TS spec in `libreria/src/NativeRnSavingsNotifier.ts` or equivalent Codegen spec file, and its Kotlin implementation). The justification must reference the real signature, not a hypothetical one.
2. **Answer these questions concretely for this method**, not in the abstract:
   - Does it need a **synchronous** return to JS, or is `Promise`/callback (async) enough? TurboModules support both; classic NativeModules are async-only unless using the (discouraged) sync-methods escape hatch — if this method is fire-and-forget `void` (like `notifyGoalCompleted`), note that the async-vs-sync question is moot here and say so honestly instead of forcing an argument.
   - Does the method's argument/return shape benefit from **Codegen-generated type safety** (compile-time checked TS↔Kotlin signature) versus the classic bridge's untyped `ReadableMap`/`WritableMap` marshalling?
   - Is the app already on the **New Architecture** (RN 0.81 defaults to it) — if so, staying on TurboModule avoids running an interop/compat layer for the classic bridge.
   - Is there any actual downside being traded away (build complexity: Codegen codegen step, `codegenConfig` in `package.json`, slightly steeper local setup)? Name it.
3. **Write 1 short paragraph** stating the decision and the concrete reasons from step 2, ending with the one real cost accepted. This goes in `libreria/README.md` under a "TurboModule vs NativeModule" heading, and should be short enough to say out loud in the exam defense without notes.
4. **Update** `libreria/README.md` — append/update that section, never overwrite unrelated content.

## What NOT to do

- Don't copy generic "TurboModules are the future of React Native" marketing language — every sentence must trace back to this method's real signature and this project's real RN version.
- Don't claim there's no trade-off — Codegen setup and the New Architecture's stricter build requirements are real costs; name them.
