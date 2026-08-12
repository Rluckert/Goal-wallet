import { Money } from '../domain/Money';
import { SavingsGoal } from '../domain/SavingsGoal';
import type { GoalsRepository } from './GoalsRepository';

export interface CreateGoalInput {
  name: string;
  targetAmount: number;
}

export type IdGenerator = () => string;

const defaultIdGenerator: IdGenerator = () => `goal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export class CreateGoal {
  constructor(
    private readonly repository: GoalsRepository,
    private readonly generateId: IdGenerator = defaultIdGenerator,
  ) {}

  async execute({ name, targetAmount }: CreateGoalInput): Promise<SavingsGoal> {
    const trimmedName = name.trim();
    if (trimmedName === '') {
      throw new Error('CreateGoal: name must not be empty.');
    }
    // Money.of only guards >= 0 — a $0-target goal has nothing to save
    // toward, so that's this use case's own rule, not the value object's.
    if (targetAmount <= 0) {
      throw new Error('CreateGoal: targetAmount must be greater than 0.');
    }

    const goal = new SavingsGoal({
      id: this.generateId(),
      name: trimmedName,
      targetAmount: Money.of(targetAmount),
      savedAmount: Money.zero(),
    });

    await this.repository.save(goal);
    return goal;
  }
}
