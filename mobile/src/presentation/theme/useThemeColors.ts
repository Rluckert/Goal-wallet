import { useColorScheme } from 'react-native';
import { colors, type ThemeColors } from './colors';

/** Selects light/dark from the Davivienda palette based on the device's color scheme. */
export function useThemeColors(): ThemeColors {
  const scheme = useColorScheme();
  return scheme === 'dark' ? colors.dark : colors.light;
}
