---
name: davivienda-color-palette
description: Provides the official Davivienda brand color palette (light/dark themes, semantic tokens) as the single source of truth for UI colors in this project. Use whenever adding, reviewing, or asking about colors in web/, libreria/, or mobile/ — never invent or guess a hex value; pull it from here.
user-invocable: true
allowed-tools:
  - Read
  - Write
  - Edit
  - Grep
  - Glob
---

# davivienda-color-palette

Single source of truth for Davivienda's brand colors in this project. The canonical values live in [`reference/colors.ts`](./reference/colors.ts) — light and dark themes, keyed by semantic token name (`primary`, `background`, `textSecondary`, `error`, etc.), not by raw hex.

## When to invoke

- Building any new UI component or screen that needs colors (the `web/` micro-app, `mobile/src/presentation` screens/components).
- Reviewing existing code for hardcoded or guessed hex values that should reference this palette instead.
- Someone asks what Davivienda's brand colors are, or needs the palette available in a new file.

## Procedure

1. **Read `reference/colors.ts`** for the authoritative values. Never hardcode a hex string in a component — reference the semantic token instead (`colors.light.primary`, not `'#E1251B'` inline), so a future palette update only touches one file.
2. **If the target layer doesn't yet have its own colors module**, copy `reference/colors.ts` into that layer's local theme location (e.g. `web/src/theme/colors.ts`, `mobile/src/presentation/theme/colors.ts`), adapting only the export path/module structure to fit that layer's conventions. Do not change any hex value while copying.
3. **Pick the right theme.** `colors.light` / `colors.dark` map 1:1 on token names, so switching themes (e.g. via `useColorScheme()` in `mobile/`, or `prefers-color-scheme` in `web/`) is just selecting which half of the object to read — never mix a light token with a dark counterpart.
4. **When reviewing/validating existing UI code**, grep for raw hex literals (`#[0-9A-Fa-f]{6}`) outside `reference/colors.ts` and its copies, and flag them as violations to replace with the matching semantic token.

## What NOT to do

- Don't invent new tokens or hex values not present in the official palette without asking the user first — this is real brand identity, not a placeholder design system.
- Don't hardcode a hex string inline in a component's styles when a semantic token already covers that case.
- Don't silently "fix" a color that looks off (contrast, tone) — flag it to the user instead of guessing a replacement value.
