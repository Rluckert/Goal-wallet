import { Money } from '../Money';
import { DepositExceedsTargetError, SavingsGoal } from '../SavingsGoal';
import {
  savingsGoalAtFullProgress,
  savingsGoalAtPartialProgress,
  savingsGoalAtZeroProgress,
  savingsGoalNearOverDeposit,
} from '../__fixtures__/SavingsGoal.fixtures';

describe('SavingsGoal.deposit', () => {
  it('rejects a non-positive amount', () => {
    const goal = savingsGoalAtZeroProgress();
    expect(() => goal.deposit(Money.zero())).toThrow(/greater than 0/);
  });

  it('returns a new instance with the increased saved amount, leaving the original untouched', () => {
    const goal = savingsGoalAtZeroProgress();
    const updated = goal.deposit(Money.of(250));

    expect(updated.savedAmount.toNumber()).toBe(250);
    expect(goal.savedAmount.toNumber()).toBe(0);
    expect(updated).not.toBe(goal);
  });

  it('rejects a deposit that would exceed the target, without mutating the goal', () => {
    const goal = savingsGoalNearOverDeposit(); // 900 of 1000
    expect(() => goal.deposit(Money.of(200))).toThrow(DepositExceedsTargetError);
    expect(goal.savedAmount.toNumber()).toBe(900);
  });

  it('allows a deposit that lands exactly on the target', () => {
    const goal = savingsGoalNearOverDeposit(); // 900 of 1000
    const updated = goal.deposit(Money.of(100));
    expect(updated.savedAmount.toNumber()).toBe(1000);
    expect(updated.isComplete()).toBe(true);
  });
});

describe('SavingsGoal.progress / isComplete', () => {
  it('is 0% for a freshly created goal', () => {
    const goal = savingsGoalAtZeroProgress();
    expect(goal.progress()).toBe(0);
    expect(goal.isComplete()).toBe(false);
  });

  it('reflects partial progress', () => {
    const goal = savingsGoalAtPartialProgress();
    expect(goal.progress()).toBe(50);
    expect(goal.isComplete()).toBe(false);
  });

  it('is complete at exactly 100%', () => {
    const goal = savingsGoalAtFullProgress();
    expect(goal.progress()).toBe(100);
    expect(goal.isComplete()).toBe(true);
  });
});

describe('SavingsGoal construction', () => {
  it('exposes the props it was built with', () => {
    const goal = new SavingsGoal({
      id: 'g-42',
      name: 'Trip to Japan',
      targetAmount: Money.of(3000),
      savedAmount: Money.of(1200),
    });

    expect(goal.id).toBe('g-42');
    expect(goal.name).toBe('Trip to Japan');
    expect(goal.targetAmount.toNumber()).toBe(3000);
    expect(goal.savedAmount.toNumber()).toBe(1200);
  });
});
