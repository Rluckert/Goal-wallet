import type { SavingsGoal } from '../domain/SavingsGoal';

/**
 * Port this layer depends on. infrastructure/ provides the implementation
 * (InMemoryGoalsRepository) — application/ never imports infrastructure/
 * directly, per the DDD boundary.
 */
export interface GoalsRepository {
  getAll(): Promise<SavingsGoal[]>;
  getById(id: string): Promise<SavingsGoal | undefined>;
  save(goal: SavingsGoal): Promise<void>;
}
