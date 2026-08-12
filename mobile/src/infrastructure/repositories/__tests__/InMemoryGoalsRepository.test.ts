import { savingsGoalAtPartialProgress } from '../../../domain/__fixtures__/SavingsGoal.fixtures';
import { InMemoryGoalsRepository } from '../InMemoryGoalsRepository';

describe('InMemoryGoalsRepository', () => {
  it('returns the default seed when constructed with no arguments', async () => {
    const repository = new InMemoryGoalsRepository();
    const goals = await repository.getAll();
    expect(goals.length).toBeGreaterThan(0);
  });

  it('getById finds a seeded goal by id', async () => {
    const goal = savingsGoalAtPartialProgress();
    const repository = new InMemoryGoalsRepository([goal]);
    expect(await repository.getById(goal.id)).toBe(goal);
  });

  it('getById returns undefined for an unknown id', async () => {
    const repository = new InMemoryGoalsRepository([]);
    expect(await repository.getById('missing')).toBeUndefined();
  });

  it('save upserts a goal', async () => {
    const goal = savingsGoalAtPartialProgress();
    const repository = new InMemoryGoalsRepository([]);

    await repository.save(goal);

    expect(await repository.getById(goal.id)).toBe(goal);
    expect(await repository.getAll()).toHaveLength(1);
  });
});
