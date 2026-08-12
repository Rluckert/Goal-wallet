import type { SavingsGoal } from '../../domain/SavingsGoal';
import type { GoalsRepository } from '../GoalsRepository';

/** Hand-rolled in-memory fake for application-layer tests — no mocking library, no RN. */
export class FakeGoalsRepository implements GoalsRepository {
  private readonly goals = new Map<string, SavingsGoal>();

  constructor(seed: SavingsGoal[] = []) {
    for (const goal of seed) {
      this.goals.set(goal.id, goal);
    }
  }

  async getAll(): Promise<SavingsGoal[]> {
    return Array.from(this.goals.values());
  }

  async getById(id: string): Promise<SavingsGoal | undefined> {
    return this.goals.get(id);
  }

  async save(goal: SavingsGoal): Promise<void> {
    this.goals.set(goal.id, goal);
  }
}
