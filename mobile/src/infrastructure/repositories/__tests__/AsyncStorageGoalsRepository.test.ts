// Explicit factory — an automock would still require() the real
// @react-native-async-storage/async-storage package to introspect it first,
// which risks hitting a native-module-at-import-time issue outside a real
// native runtime (the same class of problem already hit with
// rn-savings-notifier and react-native-webview elsewhere in this codebase).
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
  },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { savingsGoalAtPartialProgress } from '../../../domain/__fixtures__/SavingsGoal.fixtures';
import { AsyncStorageGoalsRepository } from '../AsyncStorageGoalsRepository';

const mockedGetItem = AsyncStorage.getItem as jest.Mock;
const mockedSetItem = AsyncStorage.setItem as jest.Mock;

describe('AsyncStorageGoalsRepository', () => {
  beforeEach(() => {
    mockedGetItem.mockReset();
    mockedSetItem.mockReset();
  });

  it('seeds and persists the default goals on first launch (no stored data)', async () => {
    mockedGetItem.mockResolvedValue(null);
    const repository = new AsyncStorageGoalsRepository();

    const goals = await repository.getAll();

    expect(goals.length).toBeGreaterThan(0);
    expect(mockedSetItem).toHaveBeenCalledTimes(1);
    const [key, json] = mockedSetItem.mock.calls[0];
    expect(key).toBe('@goal-wallet/goals');
    expect(JSON.parse(json)).toHaveLength(goals.length);
  });

  it('round-trips stored JSON into real SavingsGoal/Money instances', async () => {
    mockedGetItem.mockResolvedValue(
      JSON.stringify([{ id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 }]),
    );
    const repository = new AsyncStorageGoalsRepository();

    const goal = await repository.getById('g-1');

    expect(goal?.name).toBe('New Laptop');
    expect(goal?.targetAmount.toNumber()).toBe(1000);
    expect(goal?.savedAmount.toNumber()).toBe(350);
    expect(mockedSetItem).not.toHaveBeenCalled();
  });

  it('save() persists the full updated goal list', async () => {
    mockedGetItem.mockResolvedValue(JSON.stringify([]));
    const repository = new AsyncStorageGoalsRepository();
    const goal = savingsGoalAtPartialProgress();

    await repository.save(goal);

    expect(mockedSetItem).toHaveBeenCalledTimes(1);
    const [, json] = mockedSetItem.mock.calls[0];
    expect(JSON.parse(json)).toEqual([
      { id: goal.id, name: goal.name, targetAmount: 1000, savedAmount: 500 },
    ]);
  });

  it('falls back to the default seed when stored JSON is corrupted', async () => {
    mockedGetItem.mockResolvedValue('not valid json{');
    const repository = new AsyncStorageGoalsRepository();

    const goals = await repository.getAll();

    expect(goals.length).toBeGreaterThan(0);
    expect(mockedSetItem).toHaveBeenCalledTimes(1); // re-persisted the fallback seed
  });

  it('only reads from storage once, caching the hydrated repository', async () => {
    mockedGetItem.mockResolvedValue(JSON.stringify([]));
    const repository = new AsyncStorageGoalsRepository();

    await repository.getAll();
    await repository.getById('missing');
    await repository.getAll();

    expect(mockedGetItem).toHaveBeenCalledTimes(1);
  });
});
