import {
  savingsGoalAtFullProgress,
  savingsGoalAtPartialProgress,
} from '../../domain/__fixtures__/SavingsGoal.fixtures';
import { GetGoals } from '../GetGoals';
import { FakeGoalsRepository } from '../__testUtils__/FakeGoalsRepository';

describe('GetGoals', () => {
  it('returns every goal in the repository', async () => {
    const goals = [
      savingsGoalAtPartialProgress(),
      savingsGoalAtFullProgress(),
    ];
    const repository = new FakeGoalsRepository(goals);
    const useCase = new GetGoals(repository);

    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result.map(g => g.id)).toEqual(goals.map(g => g.id));
  });

  it('returns an empty list when the repository has no goals', async () => {
    const useCase = new GetGoals(new FakeGoalsRepository());
    expect(await useCase.execute()).toEqual([]);
  });
});
