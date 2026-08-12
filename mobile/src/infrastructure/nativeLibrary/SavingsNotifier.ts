import { notifyGoalCompleted } from 'rn-savings-notifier';

/**
 * Thin wrapper around the rn-savings-notifier TurboModule call. Isolating it
 * behind a module (rather than calling notifyGoalCompleted directly from the
 * Redux thunk) means goalsSlice tests can jest.mock('./SavingsNotifier')
 * instead of mocking the native bridge itself.
 */
export const SavingsNotifier = {
  notifyGoalCompleted(goalName: string): void {
    notifyGoalCompleted(goalName);
  },
};
