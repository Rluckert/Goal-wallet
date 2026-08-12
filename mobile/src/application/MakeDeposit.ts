import { Money } from '../domain/Money';
import type { SavingsGoal } from '../domain/SavingsGoal';
import type { GoalsRepository } from './GoalsRepository';

export class GoalNotFoundError extends Error {
  constructor(goalId: string) {
    super(`No goal found with id "${goalId}".`);
    this.name = 'GoalNotFoundError';
  }
}

export interface MakeDepositInput {
  goalId: string;
  amount: number;
}

export interface MakeDepositResult {
  goal: SavingsGoal;
  /**
   * True only on the transition into completion — a deposit to a goal that
   * was already at 100% (e.g. depositing extra after already completing it
   * would be rejected by SavingsGoal.deposit anyway) does not re-fire this.
   * This is what lets the caller decide whether to trigger the native
   * completion notification, without application/ knowing anything about
   * notifications itself.
   */
  justCompleted: boolean;
}

export class MakeDeposit {
  constructor(private readonly repository: GoalsRepository) {}

  async execute({ goalId, amount }: MakeDepositInput): Promise<MakeDepositResult> {
    const goal = await this.repository.getById(goalId);
    if (!goal) {
      throw new GoalNotFoundError(goalId);
    }

    const wasComplete = goal.isComplete();
    const updated = goal.deposit(Money.of(amount));
    await this.repository.save(updated);

    return { goal: updated, justCompleted: !wasComplete && updated.isComplete() };
  }
}
