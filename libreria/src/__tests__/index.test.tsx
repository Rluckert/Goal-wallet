import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { notifyGoalCompleted, showConfirmDialog } from '../index';
import NativeRnSavingsNotifier from '../NativeRnSavingsNotifier';

jest.mock('../NativeRnSavingsNotifier', () => ({
  __esModule: true,
  default: {
    notifyGoalCompleted: jest.fn(),
    showConfirmDialog: jest.fn(),
  },
}));

const mockedNative = NativeRnSavingsNotifier as jest.Mocked<
  typeof NativeRnSavingsNotifier
>;

describe('notifyGoalCompleted', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('forwards a valid goal name to the native module', () => {
    notifyGoalCompleted('New Laptop');

    expect(mockedNative.notifyGoalCompleted).toHaveBeenCalledTimes(1);
    expect(mockedNative.notifyGoalCompleted).toHaveBeenCalledWith(
      'New Laptop'
    );
  });

  it('throws without calling native when the goal name is empty', () => {
    expect(() => notifyGoalCompleted('')).toThrow(
      'notifyGoalCompleted: goalName must not be empty.'
    );
    expect(mockedNative.notifyGoalCompleted).not.toHaveBeenCalled();
  });

  it('throws without calling native when the goal name is blank', () => {
    expect(() => notifyGoalCompleted('   ')).toThrow(
      'notifyGoalCompleted: goalName must not be empty.'
    );
    expect(mockedNative.notifyGoalCompleted).not.toHaveBeenCalled();
  });
});

describe('showConfirmDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls native with the title and message as separate string args', async () => {
    mockedNative.showConfirmDialog.mockResolvedValueOnce(true);

    await showConfirmDialog({ title: 'New Laptop', message: 'Deposit?' });

    expect(mockedNative.showConfirmDialog).toHaveBeenCalledWith('New Laptop', 'Deposit?');
  });

  it('resolves with the native result (true)', async () => {
    mockedNative.showConfirmDialog.mockResolvedValueOnce(true);
    await expect(
      showConfirmDialog({ title: 'New Laptop', message: 'Deposit?' })
    ).resolves.toBe(true);
  });

  it('resolves with the native result (false)', async () => {
    mockedNative.showConfirmDialog.mockResolvedValueOnce(false);
    await expect(
      showConfirmDialog({ title: 'New Laptop', message: 'Deposit?' })
    ).resolves.toBe(false);
  });
});
