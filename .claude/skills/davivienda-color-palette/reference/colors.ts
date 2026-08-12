/**
 * Official Davivienda brand color palette. Canonical source — never edit
 * these hex values without the user's explicit instruction, and never
 * invent new tokens here; this is real brand identity, not a placeholder
 * design system.
 */
export const colors = {
  light: {
    // Brand
    primary: '#E1251B',
    primaryDark: '#B91C15',
    primaryLight: '#FDE8E6',

    secondary: '#F18A00',
    accent: '#FFD100',
    info: '#0075C9',

    // Backgrounds
    background: '#FFFFFF',
    surface: '#F8F8F8',
    surfaceElevated: '#FFFFFF',

    // Text
    text: '#1A1A1A',
    textSecondary: '#737373',
    textDisabled: '#A3A3A3',
    textInverse: '#FFFFFF',

    // Borders
    border: '#E5E5E5',
    borderStrong: '#D4D4D4',

    // Semantic
    success: '#16803C',
    warning: '#D97706',
    error: '#C81E1E',

    // Common
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },

  dark: {
    // Brand
    primary: '#F0443B',
    primaryDark: '#D62820',
    primaryLight: '#4A1917',

    secondary: '#FF9F1A',
    accent: '#FFD83D',
    info: '#3B9BE5',

    // Backgrounds
    background: '#121212',
    surface: '#1E1E1E',
    surfaceElevated: '#292929',

    // Text
    text: '#FFFFFF',
    textSecondary: '#B8B8B8',
    textDisabled: '#707070',
    textInverse: '#1A1A1A',

    // Borders
    border: '#383838',
    borderStrong: '#505050',

    // Semantic
    success: '#32A852',
    warning: '#F59E0B',
    error: '#EF4444',

    // Common
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
  },
} as const;

// A plain Record, not `typeof colors.light` — that would narrow every value
// to its literal light-theme hex string, making colors.dark (different
// literals, same keys) not assignable to it.
export type ThemeColors = Record<keyof typeof colors.light, string>;
