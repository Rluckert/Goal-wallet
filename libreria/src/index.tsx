import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';

export { DepositInput } from './DepositInput';
export type { DepositInputProps } from './DepositInput';

/**
 * Shows a native local confirmation when a savings goal reaches 100%.
 * Validates the goal name before crossing the bridge — an empty/blank name
 * is a caller bug, not something the native side should have to guard.
 */
export function notifyGoalCompleted(goalName: string): void {
  if (goalName.trim() === '') {
    throw new Error('notifyGoalCompleted: goalName must not be empty.');
  }
  NativeRnSavingsNotifier.notifyGoalCompleted(goalName);
}
