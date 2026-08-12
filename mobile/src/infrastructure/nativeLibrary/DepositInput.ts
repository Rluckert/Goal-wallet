/**
 * Re-exports rn-savings-notifier's <DepositInput/> from infrastructure/,
 * the only layer allowed to import the library directly — same boundary
 * SavingsNotifier.ts already applies to notifyGoalCompleted. presentation/
 * imports this module, not the package.
 */
export { DepositInput, type DepositInputProps } from 'rn-savings-notifier';
