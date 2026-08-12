import { DepositExceedsTargetError } from '../../domain/SavingsGoal';
import {
  savingsGoalAtFullProgress,
  savingsGoalAtZeroProgress,
  savingsGoalNearOverDeposit,
} from '../../domain/__fixtures__/SavingsGoal.fixtures';
import { GoalNotFoundError, MakeDeposit } from '../MakeDeposit';
import { FakeGoalsRepository } from '../__testUtils__/FakeGoalsRepository';

describe('MakeDeposit', () => {
  it('deposits into the goal and persists the update', async () => {
    const goal = savingsGoalAtZeroProgress(); // target 1000
    const repository = new FakeGoalsRepository([goal]);
    const useCase = new MakeDeposit(repository);

    const result = await useCase.execute({ goalId: goal.id, amount: 250 });

    expect(result.goal.savedAmount.toNumber()).toBe(250);
    expect(result.justCompleted).toBe(false);

    const persisted = await repository.getById(goal.id);
    expect(persisted?.savedAmount.toNumber()).toBe(250);
  });

  it('reports justCompleted only on the transition into 100%', async () => {
    const goal = savingsGoalNearOverDeposit(); // 900 of 1000
    const repository = new FakeGoalsRepository([goal]);
    const useCase = new MakeDeposit(repository);

    const result = await useCase.execute({ goalId: goal.id, amount: 100 });

    expect(result.goal.isComplete()).toBe(true);
    expect(result.justCompleted).toBe(true);
  });

  it('does not report justCompleted for an already-complete goal', async () => {
    const goal = savingsGoalAtFullProgress(); // already 1000 of 1000
    const repository = new FakeGoalsRepository([goal]);
    const useCase = new MakeDeposit(repository);

    // Any further positive deposit exceeds the target, so the domain rejects it —
    // an already-complete goal can never re-fire justCompleted.
    await expect(useCase.execute({ goalId: goal.id, amount: 1 })).rejects.toThrow(
      DepositExceedsTargetError,
    );
  });

  it('throws GoalNotFoundError for an unknown goal id', async () => {
    const repository = new FakeGoalsRepository([]);
    const useCase = new MakeDeposit(repository);

    await expect(useCase.execute({ goalId: 'missing', amount: 10 })).rejects.toThrow(
      GoalNotFoundError,
    );
  });

  it('propagates DepositExceedsTargetError without persisting anything', async () => {
    const goal = savingsGoalNearOverDeposit(); // 900 of 1000
    const repository = new FakeGoalsRepository([goal]);
    const useCase = new MakeDeposit(repository);

    await expect(useCase.execute({ goalId: goal.id, amount: 200 })).rejects.toThrow(
      DepositExceedsTargetError,
    );

    const persisted = await repository.getById(goal.id);
    expect(persisted?.savedAmount.toNumber()).toBe(900);
  });
});
