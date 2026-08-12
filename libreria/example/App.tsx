/**
 * Manual smoke-test harness for rn-savings-notifier.
 * Exercises both native methods end to end on a real device/emulator,
 * before this library is wired into mobile/ (Phase 3).
 *
 * @format
 */

import { useState } from 'react';
import {
  Button,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from 'react-native';
import { notifyGoalCompleted, showConfirmDialog } from 'rn-savings-notifier';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [lastAnswer, setLastAnswer] = useState<boolean | null>(null);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />

      <Text style={styles.title}>rn-savings-notifier smoke test</Text>

      <View style={styles.section}>
        <Text style={styles.label}>notifyGoalCompleted</Text>
        <Text style={styles.hint}>Expect a native Toast on tap.</Text>
        <Button
          title="Notify goal completed"
          onPress={() => notifyGoalCompleted('New Laptop')}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>showConfirmDialog</Text>
        <Text style={styles.hint}>
          Expect a native AlertDialog with Yes/No buttons. The result below
          reflects your choice (or "false" if dismissed).
        </Text>
        <Button
          title="Show confirm dialog"
          onPress={async () => {
            const confirmed = await showConfirmDialog({
              title: 'New Laptop',
              message: 'Would you like to make a deposit to this goal?',
            });
            setLastAnswer(confirmed);
          }}
        />
        <Text style={styles.result} testID="last-answer">
          Last answer: {lastAnswer === null ? '(none yet)' : String(lastAnswer)}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    gap: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  section: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  hint: {
    fontSize: 13,
    color: '#6b7280',
  },
  result: {
    marginTop: 8,
    fontSize: 14,
  },
});

export default App;
