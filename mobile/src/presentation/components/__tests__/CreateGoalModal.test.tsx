// goalsSlice -> SavingsNotifier imports rn-savings-notifier at module scope,
// which hits TurboModuleRegistry outside a native runtime — same as in
// GoalListScreen.test.tsx, even though this modal never calls it directly.
jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(),
  showConfirmDialog: jest.fn(),
}));

// createGoal's thunk reads/writes through the real AsyncStorageGoalsRepository
// (not mocked here, only its dependency is) — getItem resolving null makes it
// fall back to the default in-memory seed, same pattern as GoalDetailScreen.test.tsx.
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn().mockResolvedValue(null),
    setItem: jest.fn().mockResolvedValue(undefined),
  },
}));

import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { goalsReducer, selectAllGoals } from '../../../infrastructure/redux/goalsSlice';
import { CreateGoalModal } from '../CreateGoalModal';

function renderModal(visible = true) {
  const store = configureStore({ reducer: { goals: goalsReducer } });
  const onClose = jest.fn();

  const utils = render(
    <Provider store={store}>
      <CreateGoalModal visible={visible} onClose={onClose} />
    </Provider>,
  );

  return { ...utils, store, onClose };
}

describe('CreateGoalModal', () => {
  it('surfaces CreateGoal\'s real validation error for an empty name, without adding a goal', async () => {
    const { getByTestId, store } = renderModal();

    fireEvent.changeText(getByTestId('create-goal-amount-input'), '500');
    fireEvent.press(getByTestId('create-goal-submit'));

    await waitFor(() => {
      expect(getByTestId('create-goal-error').props.children).toBe(
        'CreateGoal: name must not be empty.',
      );
    });
    expect(selectAllGoals(store.getState())).toHaveLength(0);
  });

  it("surfaces CreateGoal's real validation error for a non-positive amount, without adding a goal", async () => {
    const { getByTestId, store } = renderModal();

    fireEvent.changeText(getByTestId('create-goal-name-input'), 'New Bike');
    fireEvent.changeText(getByTestId('create-goal-amount-input'), '0');
    fireEvent.press(getByTestId('create-goal-submit'));

    await waitFor(() => {
      expect(getByTestId('create-goal-error').props.children).toBe(
        'CreateGoal: targetAmount must be greater than 0.',
      );
    });
    expect(selectAllGoals(store.getState())).toHaveLength(0);
  });

  it("surfaces Money's real validation error for a non-numeric amount, without adding a goal", async () => {
    const { getByTestId, store } = renderModal();

    fireEvent.changeText(getByTestId('create-goal-name-input'), 'New Bike');
    fireEvent.changeText(getByTestId('create-goal-amount-input'), 'not a number');
    fireEvent.press(getByTestId('create-goal-submit'));

    await waitFor(() => {
      expect(getByTestId('create-goal-error').props.children).toContain('must be finite');
    });
    expect(selectAllGoals(store.getState())).toHaveLength(0);
  });

  it('creates the goal and closes on valid input', async () => {
    const { getByTestId, store, onClose } = renderModal();

    fireEvent.changeText(getByTestId('create-goal-name-input'), 'New Bike');
    fireEvent.changeText(getByTestId('create-goal-amount-input'), '500');
    fireEvent.press(getByTestId('create-goal-submit'));

    await waitFor(() => {
      const goals = selectAllGoals(store.getState());
      expect(goals).toHaveLength(1);
      expect(goals[0]).toMatchObject({ name: 'New Bike', targetAmount: 500, savedAmount: 0 });
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onClose without dispatching when Cancel is pressed', () => {
    const { getByTestId, store, onClose } = renderModal();

    fireEvent.changeText(getByTestId('create-goal-name-input'), 'New Bike');
    fireEvent.press(getByTestId('create-goal-cancel'));

    expect(onClose).toHaveBeenCalled();
    expect(selectAllGoals(store.getState())).toHaveLength(0);
  });
});
