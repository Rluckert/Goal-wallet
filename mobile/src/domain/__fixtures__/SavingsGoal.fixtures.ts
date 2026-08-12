import { Money } from '../Money';
import { SavingsGoal } from '../SavingsGoal';

export interface SavingsGoalOverrides {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

export function buildSavingsGoal(overrides: Partial<SavingsGoalOverrides> = {}): SavingsGoal {
  return new SavingsGoal({
    id: overrides.id ?? 'goal-1',
    name: overrides.name ?? 'New Laptop',
    targetAmount: Money.of(overrides.targetAmount ?? 1000),
    savedAmount: Money.of(overrides.savedAmount ?? 0),
  });
}

/** Freshly created goal, no deposits yet. */
export function savingsGoalAtZeroProgress(): SavingsGoal {
  return buildSavingsGoal({ id: 'goal-zero', targetAmount: 1000, savedAmount: 0 });
}

/** Roughly halfway to the target. */
export function savingsGoalAtPartialProgress(): SavingsGoal {
  return buildSavingsGoal({ id: 'goal-partial', targetAmount: 1000, savedAmount: 500 });
}

/** Exactly at 100% — the state that should trigger the native completion notification. */
export function savingsGoalAtFullProgress(): SavingsGoal {
  return buildSavingsGoal({ id: 'goal-full', targetAmount: 1000, savedAmount: 1000 });
}

/**
 * Close to its target but not there yet — a fixture for tests that then
 * attempt a deposit larger than the remaining amount, which SavingsGoal.deposit()
 * must reject with DepositExceedsTargetError rather than clamp.
 */
export function savingsGoalNearOverDeposit(): SavingsGoal {
  return buildSavingsGoal({ id: 'goal-near-target', targetAmount: 1000, savedAmount: 900 });
}
