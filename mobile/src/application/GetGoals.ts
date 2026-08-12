import type { SavingsGoal } from '../domain/SavingsGoal';
import type { GoalsRepository } from './GoalsRepository';

export class GetGoals {
  constructor(private readonly repository: GoalsRepository) {}

  execute(): Promise<SavingsGoal[]> {
    return this.repository.getAll();
  }
}
