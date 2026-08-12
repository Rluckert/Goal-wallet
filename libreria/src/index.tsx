import NativeRnSavingsNotifier from './NativeRnSavingsNotifier';

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

export interface ConfirmDialogOptions {
  title: string;
  message: string;
}

/**
 * Shows a native confirmation dialog (AlertDialog on Android) and resolves
 * with the user's choice. The object-shaped call is the public API; the
 * native bridge itself takes two plain strings (see NativeRnSavingsNotifier.ts).
 */
export function showConfirmDialog({ title, message }: ConfirmDialogOptions): Promise<boolean> {
  return NativeRnSavingsNotifier.showConfirmDialog(title, message);
}
