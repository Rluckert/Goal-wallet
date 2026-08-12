import { TurboModuleRegistry, type TurboModule } from 'react-native';

export interface Spec extends TurboModule {
  /**
   * Fire-and-forget: shows a native local confirmation (Toast on Android)
   * when a savings goal reaches 100%. No return value expected by callers.
   */
  notifyGoalCompleted(goalName: string): void;

  /**
   * Parses and validates a raw deposit amount using the device's locale
   * (Android's NumberFormat), which handles decimal/thousands separators
   * correctly across locales in a way a plain JS Number()/parseFloat()
   * does not. Resolves with the validated numeric amount; rejects when the
   * input isn't a positive number. Also triggers native haptic feedback on
   * success as a side effect.
   */
  parseDepositAmount(rawAmount: string): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('RnSavingsNotifier');
