import { renderHook } from '@testing-library/react-native';
import { useColorScheme } from 'react-native';
import { colors } from '../colors';
import { useThemeColors } from '../useThemeColors';

// react-native's own jest preset (node_modules/react-native/jest/setup.js)
// already mocks this hook as a jest.fn() — no jest.mock() of our own needed,
// just drive the existing mock's return value per test.
const mockUseColorScheme = useColorScheme as jest.Mock;

describe('useThemeColors', () => {
  it('returns the dark palette when the device color scheme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current).toBe(colors.dark);
  });

  it('returns the light palette when the device color scheme is not dark', () => {
    mockUseColorScheme.mockReturnValue('light');

    const { result } = renderHook(() => useThemeColors());

    expect(result.current).toBe(colors.light);
  });
});
