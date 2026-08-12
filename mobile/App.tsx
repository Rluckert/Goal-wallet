/**
 * @format
 */

import { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { store } from './src/infrastructure/redux/store';
import { loadGoals } from './src/infrastructure/redux/goalsSlice';
import { useAppDispatch } from './src/presentation/hooks/redux';
import { GoalListScreen } from './src/presentation/screens/GoalListScreen';
import { GoalDetailScreen } from './src/presentation/screens/GoalDetailScreen';

// No react-navigation — just two screens, so a local state switch avoids
// the extra native linking (gesture-handler, screens, safe-area-context
// wiring) that a navigation library would add. Documented as an
// intentional simplification in mobile/README.md.
type Screen = { name: 'list' } | { name: 'detail'; goalId: string };

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <AppContent />
      </SafeAreaProvider>
    </Provider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const [screen, setScreen] = useState<Screen>({ name: 'list' });

  useEffect(() => {
    dispatch(loadGoals());
  }, [dispatch]);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      {screen.name === 'list' ? (
        <GoalListScreen onSelectGoal={goalId => setScreen({ name: 'detail', goalId })} />
      ) : (
        <GoalDetailScreen goalId={screen.goalId} onBack={() => setScreen({ name: 'list' })} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
