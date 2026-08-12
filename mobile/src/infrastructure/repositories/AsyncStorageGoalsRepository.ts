import AsyncStorage from '@react-native-async-storage/async-storage';
import { Money } from '../../domain/Money';
import { SavingsGoal } from '../../domain/SavingsGoal';
import type { GoalsRepository } from '../../application/GoalsRepository';
import { InMemoryGoalsRepository } from './InMemoryGoalsRepository';

const STORAGE_KEY = '@goal-wallet/goals';

/**
 * Structurally the same shape as goalsSlice.ts's GoalDTO, and deliberately
 * not shared with it: this is the on-disk storage schema, GoalDTO is Redux's
 * state shape. Keeping them separate means a future storage format change
 * (e.g. adding a schema version field) doesn't ripple into Redux state, and
 * vice versa — the duplication is the cost of that isolation, not an oversight.
 */
interface StoredGoal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
}

function toStoredGoal(goal: SavingsGoal): StoredGoal {
  return {
    id: goal.id,
    name: goal.name,
    targetAmount: goal.targetAmount.toNumber(),
    savedAmount: goal.savedAmount.toNumber(),
  };
}

function fromStoredGoal(stored: StoredGoal): SavingsGoal {
  return new SavingsGoal({
    id: stored.id,
    name: stored.name,
    targetAmount: Money.of(stored.targetAmount),
    savedAmount: Money.of(stored.savedAmount),
  });
}

/**
 * Persists goals to on-device storage so they survive app restarts (HU4's
 * "deseable" persistence — no backend involved, per the exam's scope).
 *
 * Wraps an InMemoryGoalsRepository as its in-process cache instead of
 * reimplementing the Map-based lookup — this class only adds hydrate-once /
 * write-through-persist around it, so GetGoals/MakeDeposit (which depend on
 * the GoalsRepository interface, never a concrete class) don't change at all.
 */
export class AsyncStorageGoalsRepository implements GoalsRepository {
  private cache: InMemoryGoalsRepository | null = null;

  private async loadCache(): Promise<InMemoryGoalsRepository> {
    if (this.cache) {
      return this.cache;
    }

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      // First launch — no stored data yet.
      return this.seedAndPersistDefaults();
    }

    try {
      const stored: StoredGoal[] = JSON.parse(raw);
      this.cache = new InMemoryGoalsRepository(stored.map(fromStoredGoal));
      return this.cache;
    } catch {
      // Corrupted storage (bad JSON, or a shape an older/newer app version
      // wrote) — treat the same as "no storage yet" rather than crashing.
      return this.seedAndPersistDefaults();
    }
  }

  /** Seeds the cache with InMemoryGoalsRepository's own default goals and persists that seed immediately, so it's the baseline going forward. */
  private async seedAndPersistDefaults(): Promise<InMemoryGoalsRepository> {
    this.cache = new InMemoryGoalsRepository();
    await this.persist(this.cache);
    return this.cache;
  }

  private async persist(repo: InMemoryGoalsRepository): Promise<void> {
    const goals = await repo.getAll();
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(goals.map(toStoredGoal)));
  }

  async getAll(): Promise<SavingsGoal[]> {
    const repo = await this.loadCache();
    return repo.getAll();
  }

  async getById(id: string): Promise<SavingsGoal | undefined> {
    const repo = await this.loadCache();
    return repo.getById(id);
  }

  async save(goal: SavingsGoal): Promise<void> {
    const repo = await this.loadCache();
    await repo.save(goal);
    await this.persist(repo);
  }
}
