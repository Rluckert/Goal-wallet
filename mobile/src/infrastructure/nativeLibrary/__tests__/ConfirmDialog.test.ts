jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(),
  showConfirmDialog: jest.fn(),
}));

import { showConfirmDialog as mockedShowConfirmDialog } from 'rn-savings-notifier';
import { ConfirmDialog } from '../ConfirmDialog';

const mocked = mockedShowConfirmDialog as jest.Mock;

describe('ConfirmDialog.show', () => {
  beforeEach(() => {
    mocked.mockReset();
  });

  it('forwards the options to the underlying rn-savings-notifier call', async () => {
    mocked.mockResolvedValueOnce(true);

    await ConfirmDialog.show({ title: 'New Laptop', message: 'Deposit?' });

    expect(mocked).toHaveBeenCalledWith({ title: 'New Laptop', message: 'Deposit?' });
  });

  it('resolves with the native result', async () => {
    mocked.mockResolvedValueOnce(false);
    await expect(ConfirmDialog.show({ title: 'New Laptop', message: 'Deposit?' })).resolves.toBe(
      false,
    );
  });
});
