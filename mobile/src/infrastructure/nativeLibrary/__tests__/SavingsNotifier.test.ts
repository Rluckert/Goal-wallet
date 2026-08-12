jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(),
  showConfirmDialog: jest.fn(),
}));

import { notifyGoalCompleted as mockedNotifyGoalCompleted } from 'rn-savings-notifier';
import { SavingsNotifier } from '../SavingsNotifier';

describe('SavingsNotifier.notifyGoalCompleted', () => {
  it('forwards the goal name to the underlying rn-savings-notifier call', () => {
    SavingsNotifier.notifyGoalCompleted('New Laptop');
    expect(mockedNotifyGoalCompleted).toHaveBeenCalledWith('New Laptop');
  });
});
