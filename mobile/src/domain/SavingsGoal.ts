import { Money } from './Money';
import { computeProgressPercent, isProgressComplete } from './Progress';

/**
 * Thrown when a deposit would push savedAmount past targetAmount.
 * Rejected explicitly rather than silently clamped — discarding part of a
 * user's declared deposit amount would be a worse outcome than asking them
 * to adjust it.
 */
export class DepositExceedsTargetError extends Error {
  constructor(goalId: string, attemptedTotal: number, targetAmount: number) {
    super(
      `Deposit rejected for goal "${goalId}": total would be ${attemptedTotal}, exceeding target ${targetAmount}.`,
    );
    this.name = 'DepositExceedsTargetError';
  }
}

export interface SavingsGoalProps {
  id: string;
  name: string;
  targetAmount: Money;
  savedAmount: Money;
}

/**
 * Entity. Immutable — deposit() returns a new instance rather than mutating
 * in place, so it stays trivially testable (no hidden state to reset
 * between assertions).
 */
export class SavingsGoal {
  readonly id: string;
  readonly name: string;
  readonly targetAmount: Money;
  readonly savedAmount: Money;

  constructor(props: SavingsGoalProps) {
    this.id = props.id;
    this.name = props.name;
    this.targetAmount = props.targetAmount;
    this.savedAmount = props.savedAmount;
  }

  deposit(amount: Money): SavingsGoal {
    if (!amount.isPositive()) {
      throw new Error(`SavingsGoal.deposit: amount must be greater than 0, got ${amount.toNumber()}.`);
    }
    const updatedSaved = this.savedAmount.add(amount);
    if (updatedSaved.isGreaterThan(this.targetAmount)) {
      throw new DepositExceedsTargetError(this.id, updatedSaved.toNumber(), this.targetAmount.toNumber());
    }
    return new SavingsGoal({ ...this, savedAmount: updatedSaved });
  }

  progress(): number {
    return computeProgressPercent(this.savedAmount.toNumber(), this.targetAmount.toNumber());
  }

  isComplete(): boolean {
    return isProgressComplete(this.progress());
  }
}
