---
name: write-architecture-justification
description: Drafts a trade-offs/alternatives/scalability justification paragraph for an architecture or design-pattern decision made in this project, formatted for the root README. Use whenever a non-obvious architectural choice is made (a design pattern, a DDD boundary, TurboModule vs bridge, Redux vs alternatives) and needs to be defended in writing for the exam's evaluation.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# write-architecture-justification

Produces the kind of write-up the exam explicitly rewards: a justified architecture/pattern decision with trade-offs, alternatives considered, and scalability notes — not just a description of what was built.

## When to invoke

Given a decision already made in the codebase (e.g. "Adapter pattern for the postMessage → domain-event translation", "Repository pattern for goal access", "Redux Toolkit over Context+useReducer"), draft the justification section for the root `README.md`'s architecture section.

## Procedure

1. **Read the actual implementation** the decision refers to (e.g. `mobile/src/infrastructure/webview/WebViewMessageAdapter.ts`) — the justification must describe what the code really does, not a generic textbook definition of the pattern.
2. **State the decision in one line**: what pattern/approach was chosen, and where it lives (file/layer).
3. **Name at least one concrete alternative** that was NOT chosen, and why it would have been worse *for this specific problem* — not a generic pros/cons list copied from documentation. Examples of real alternatives in this project: Observer/Pub-Sub instead of Adapter for the WebView channel; a classic NativeModule bridge instead of TurboModule; Context API instead of Redux for cross-screen state; a single God-repository instead of one Repository per aggregate.
4. **Note the trade-off being accepted**, honestly — every choice costs something (e.g. TurboModule adds Codegen/build complexity in exchange for type safety and New Architecture alignment; Redux adds boilerplate in exchange for a single inspectable source of truth that the WebView bridge can dispatch into from anywhere).
5. **Note scalability**: what happens if this project grew (more goal types, more message types, more native capabilities) — does the chosen approach still hold, or where would it need to change?
6. **Write 1–2 short paragraphs**, not a wall of text — this feeds a README section, and the same content will need to be defended verbally in the 30-minute exam presentation, so keep it something the author can actually explain from memory.
7. **Append or update** the relevant section of `README.md` at the repo root (create an "Architecture Decisions" section if it doesn't exist yet) — never overwrite unrelated README content.

## What NOT to do

- Don't write generic Gang-of-Four textbook prose disconnected from this codebase — every claim must trace back to an actual file/line in the project.
- Don't claim a trade-off was "worth it" without naming what was given up.
- Don't invent alternatives nobody seriously considered — pick the realistic ones for a React Native + WebView + Redux + native-module project.
