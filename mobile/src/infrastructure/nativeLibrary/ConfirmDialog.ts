import { showConfirmDialog, type ConfirmDialogOptions } from 'rn-savings-notifier';

/**
 * Thin wrapper around the rn-savings-notifier native confirm dialog. Same
 * reasoning as SavingsNotifier.ts: isolating it behind a module means
 * presentation/ tests can jest.mock('./ConfirmDialog') instead of mocking
 * the native bridge itself.
 */
export const ConfirmDialog = {
  show(options: ConfirmDialogOptions): Promise<boolean> {
    return showConfirmDialog(options);
  },
};
