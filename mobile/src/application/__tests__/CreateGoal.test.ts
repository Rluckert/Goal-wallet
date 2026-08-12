import { CreateGoal } from '../CreateGoal';
import { FakeGoalsRepository } from '../__testUtils__/FakeGoalsRepository';

describe('CreateGoal', () => {
  it('creates a goal with zero saved amount and persists it', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository, () => 'goal-fixed-id');

    const goal = await useCase.execute({ name: 'New Bike', targetAmount: 500 });

    expect(goal.id).toBe('goal-fixed-id');
    expect(goal.name).toBe('New Bike');
    expect(goal.targetAmount.toNumber()).toBe(500);
    expect(goal.savedAmount.toNumber()).toBe(0);

    const persisted = await repository.getById('goal-fixed-id');
    expect(persisted).toBe(goal);
  });

  it('trims the name before saving', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository, () => 'goal-fixed-id');

    const goal = await useCase.execute({ name: '  New Bike  ', targetAmount: 500 });

    expect(goal.name).toBe('New Bike');
  });

  it('rejects an empty name without persisting anything', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository, () => 'goal-fixed-id');

    await expect(useCase.execute({ name: '', targetAmount: 500 })).rejects.toThrow(
      'CreateGoal: name must not be empty.',
    );
    expect(await repository.getAll()).toHaveLength(0);
  });

  it('rejects a blank (whitespace-only) name', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository, () => 'goal-fixed-id');

    await expect(useCase.execute({ name: '   ', targetAmount: 500 })).rejects.toThrow(
      'CreateGoal: name must not be empty.',
    );
  });

  it('rejects a non-positive target amount without persisting anything', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository, () => 'goal-fixed-id');

    await expect(useCase.execute({ name: 'New Bike', targetAmount: 0 })).rejects.toThrow(
      'CreateGoal: targetAmount must be greater than 0.',
    );
    await expect(useCase.execute({ name: 'New Bike', targetAmount: -10 })).rejects.toThrow(
      'CreateGoal: targetAmount must be greater than 0.',
    );
    expect(await repository.getAll()).toHaveLength(0);
  });

  it('generates a distinct id per call when using the default generator', async () => {
    const repository = new FakeGoalsRepository();
    const useCase = new CreateGoal(repository);

    const first = await useCase.execute({ name: 'Goal A', targetAmount: 100 });
    const second = await useCase.execute({ name: 'Goal B', targetAmount: 200 });

    expect(first.id).not.toBe(second.id);
  });
});
