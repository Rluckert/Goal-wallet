import { Money } from '../../domain/Money';
import { SavingsGoal } from '../../domain/SavingsGoal';
import type { GoalsRepository } from '../../application/GoalsRepository';

/** No backend per the exam spec — seeded in-memory, mirrors the goal shape web/'s micro-app expects. */
const SEED_GOALS: SavingsGoal[] = [
  new SavingsGoal({
    id: 'g-1',
    name: 'New Laptop',
    targetAmount: Money.of(1000),
    savedAmount: Money.of(350),
  }),
  new SavingsGoal({
    id: 'g-2',
    name: 'Trip to Japan',
    targetAmount: Money.of(3000),
    savedAmount: Money.of(900),
  }),
  new SavingsGoal({
    id: 'g-3',
    name: 'Emergency Fund',
    targetAmount: Money.of(500),
    savedAmount: Money.of(500),
  }),
];

export class InMemoryGoalsRepository implements GoalsRepository {
  private readonly goals: Map<string, SavingsGoal>;

  constructor(seed: SavingsGoal[] = SEED_GOALS) {
    this.goals = new Map(seed.map(goal => [goal.id, goal]));
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
