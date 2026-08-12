import { configureStore } from '@reduxjs/toolkit';
import {
  savingsGoalAtPartialProgress,
  savingsGoalNearOverDeposit,
} from '../../../domain/__fixtures__/SavingsGoal.fixtures';

jest.mock('../../repositories/InMemoryGoalsRepository');
// Explicit factory — an automock would still require the real module first to
// introspect its shape, which would import rn-savings-notifier and crash with
// a TurboModuleRegistry "not found" invariant outside a real native runtime.
jest.mock('../../nativeLibrary/SavingsNotifier', () => ({
  SavingsNotifier: { notifyGoalCompleted: jest.fn() },
}));

import { InMemoryGoalsRepository } from '../../repositories/InMemoryGoalsRepository';
import { SavingsNotifier } from '../../nativeLibrary/SavingsNotifier';
import {
  goalsReducer,
  loadGoals,
  makeDeposit,
  selectAllGoals,
  selectGoalById,
  selectGoalProgress,
  type GoalDTO,
} from '../goalsSlice';

const MockedRepository = InMemoryGoalsRepository as jest.MockedClass<typeof InMemoryGoalsRepository>;
const MockedNotifier = SavingsNotifier as jest.Mocked<typeof SavingsNotifier>;

// goalsSlice.ts instantiates `new InMemoryGoalsRepository()` once at module load —
// this is that same singleton instance, now with auto-mocked methods.
const repositoryInstance = MockedRepository.mock.instances[0] as jest.Mocked<InMemoryGoalsRepository>;

function buildStore() {
  return configureStore({ reducer: { goals: goalsReducer } });
}

beforeEach(() => {
  repositoryInstance.getAll.mockReset();
  repositoryInstance.getById.mockReset();
  repositoryInstance.save.mockReset();
  MockedNotifier.notifyGoalCompleted.mockReset();
});

describe('goalsSlice reducer', () => {
  const goalDTO: GoalDTO = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 };

  it('sets status to loading on loadGoals.pending', () => {
    const state = goalsReducer(undefined, loadGoals.pending('req-1', undefined));
    expect(state.status).toBe('loading');
  });

  it('stores goals keyed by id on loadGoals.fulfilled', () => {
    const state = goalsReducer(undefined, loadGoals.fulfilled([goalDTO], 'req-1', undefined));
    expect(state.status).toBe('ready');
    expect(state.goals[goalDTO.id]).toEqual(goalDTO);
  });

  it('sets an error message on loadGoals.rejected', () => {
    const action = loadGoals.rejected(new Error('boom'), 'req-1', undefined);
    const state = goalsReducer(undefined, action);
    expect(state.status).toBe('error');
    expect(state.error).toBe('boom');
  });

  it('falls back to a default message on loadGoals.rejected when the error has none', () => {
    // RTK's own error serialization always fills in a message (e.g. "Rejected"
    // for a null error), so the only way to exercise the ?? fallback is an
    // error object that omits `message` entirely — SerializedError.message is optional.
    const action = { ...loadGoals.rejected(new Error('x'), 'req-1', undefined), error: { name: 'Error' } };
    const state = goalsReducer(undefined, action);
    expect(state.error).toBe('Failed to load goals.');
  });

  it('sets an error message on makeDeposit.rejected', () => {
    const action = makeDeposit.rejected(new Error('deposit failed'), 'req-2', {
      goalId: 'g-1',
      amount: 10,
    });
    const state = goalsReducer(undefined, action);
    expect(state.error).toBe('deposit failed');
  });

  it('falls back to a default message on makeDeposit.rejected when the error has none', () => {
    const rejected = makeDeposit.rejected(new Error('x'), 'req-2', { goalId: 'g-1', amount: 10 });
    const action = { ...rejected, error: { name: 'Error' } };
    const state = goalsReducer(undefined, action);
    expect(state.error).toBe('Failed to make deposit.');
  });

  it('updates a single goal on makeDeposit.fulfilled without touching the others', () => {
    const initial = goalsReducer(undefined, loadGoals.fulfilled([goalDTO], 'req-1', undefined));
    const updated: GoalDTO = { ...goalDTO, savedAmount: 600 };

    const state = goalsReducer(
      initial,
      makeDeposit.fulfilled(updated, 'req-2', { goalId: goalDTO.id, amount: 250 }),
    );

    expect(state.goals[goalDTO.id].savedAmount).toBe(600);
  });
});

describe('selectors', () => {
  it('selectAllGoals / selectGoalById / selectGoalProgress read from state', () => {
    const goalDTO: GoalDTO = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 500 };
    const state = { goals: goalsReducer(undefined, loadGoals.fulfilled([goalDTO], 'req-1', undefined)) };

    expect(selectAllGoals(state)).toEqual([goalDTO]);
    expect(selectGoalById(state, 'g-1')).toEqual(goalDTO);
    expect(selectGoalById(state, 'missing')).toBeUndefined();
    expect(selectGoalProgress(goalDTO)).toBe(50);
  });
});

describe('loadGoals thunk', () => {
  it('loads goals from the repository into the store', async () => {
    const goal = savingsGoalAtPartialProgress();
    repositoryInstance.getAll.mockResolvedValue([goal]);

    const store = buildStore();
    await store.dispatch(loadGoals());

    expect(selectAllGoals(store.getState())).toEqual([
      { id: goal.id, name: goal.name, targetAmount: 1000, savedAmount: 500 },
    ]);
  });
});

describe('makeDeposit thunk', () => {
  it('fires the native notification only when the deposit completes the goal', async () => {
    const goal = savingsGoalNearOverDeposit(); // 900 of 1000
    repositoryInstance.getById.mockResolvedValue(goal);
    repositoryInstance.save.mockResolvedValue(undefined);

    const store = buildStore();
    await store.dispatch(makeDeposit({ goalId: goal.id, amount: 100 }));

    expect(MockedNotifier.notifyGoalCompleted).toHaveBeenCalledWith(goal.name);
    expect(selectGoalById(store.getState(), goal.id)?.savedAmount).toBe(1000);
  });

  it('does not fire the notification for a partial deposit', async () => {
    const goal = savingsGoalAtPartialProgress(); // 500 of 1000
    repositoryInstance.getById.mockResolvedValue(goal);
    repositoryInstance.save.mockResolvedValue(undefined);

    const store = buildStore();
    await store.dispatch(makeDeposit({ goalId: goal.id, amount: 100 }));

    expect(MockedNotifier.notifyGoalCompleted).not.toHaveBeenCalled();
    expect(selectGoalById(store.getState(), goal.id)?.savedAmount).toBe(600);
  });
});
