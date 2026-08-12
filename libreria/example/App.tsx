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
import { DepositInput, notifyGoalCompleted } from 'rn-savings-notifier';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [lastConfirmed, setLastConfirmed] = useState<number | null>(null);

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
        <Text style={styles.label}>DepositInput</Text>
        <Text style={styles.hint}>
          Valid amount → haptic buzz + onConfirm below. Invalid amount →
          native Toast + inline error, no onConfirm.
        </Text>
        <DepositInput onConfirm={(amount) => setLastConfirmed(amount)} />
        <Text style={styles.result} testID="last-confirmed">
          Last confirmed: {lastConfirmed === null ? '(none yet)' : lastConfirmed}
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
