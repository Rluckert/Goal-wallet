import { useMemo } from 'react';
import { useThemeColors } from './useThemeColors';
import type { ThemeColors } from './colors';

/**
 * Reads the current theme and memoizes a StyleSheet built from it in one
 * call, instead of every screen repeating `useThemeColors()` +
 * `useMemo(() => createStyles(colors), [colors])` by hand. `factory` is
 * expected to be a stable reference (a module-level `createStyles`
 * function), so it's safe to include in the memo deps without causing
 * extra recomputation.
 */
export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const colors = useThemeColors();
  return useMemo(() => factory(colors), [colors, factory]);
}
