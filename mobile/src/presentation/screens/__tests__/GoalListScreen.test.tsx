import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { goalsReducer, loadGoals, type GoalDTO } from '../../../infrastructure/redux/goalsSlice';
import { GoalListScreen } from '../GoalListScreen';

// GoalListScreen renders <DepositInput/> from rn-savings-notifier per goal
// card — the real package imports a TurboModule that only resolves inside a
// native runtime, so it's replaced with a lightweight test double whose
// button calls onConfirm with a fixed amount.
jest.mock('rn-savings-notifier', () => {
  const localReact = require('react');
  const { View, Pressable, Text } = require('react-native');
  return {
    DepositInput: ({ onConfirm }: { onConfirm: (amount: number) => void }) =>
      localReact.createElement(
        View,
        { testID: 'deposit-input' },
        localReact.createElement(
          Pressable,
          { testID: 'deposit-input-button', onPress: () => onConfirm(100) },
          localReact.createElement(Text, null, 'Deposit'),
        ),
      ),
    notifyGoalCompleted: jest.fn(),
  };
});

// Matches the real InMemoryGoalsRepository's default seed for goal g-1, so a
// makeDeposit dispatch (which reads from the repository, not from this
// preloaded state) resolves against a goal that actually exists.
const GOAL: GoalDTO = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 };

function renderWithStore(goals: GoalDTO[] = [GOAL]) {
  const store = configureStore({ reducer: { goals: goalsReducer } });
  store.dispatch(loadGoals.fulfilled(goals, 'req-1', undefined));
  const onSelectGoal = jest.fn();

  const utils = render(
    <Provider store={store}>
      <GoalListScreen onSelectGoal={onSelectGoal} />
    </Provider>,
  );

  return { ...utils, store, onSelectGoal };
}

describe('GoalListScreen', () => {
  it('renders each goal with its name, amounts and progress', () => {
    const { getByText } = renderWithStore();
    expect(getByText('New Laptop')).toBeTruthy();
    expect(getByText('$350.00 of $1000.00 (35%)')).toBeTruthy();
  });

  it('shows an empty state when there are no goals', () => {
    const { getByText } = renderWithStore([]);
    expect(getByText('No goals yet.')).toBeTruthy();
  });

  it('calls onSelectGoal with the goal id when its name is pressed', () => {
    const { getByTestId, onSelectGoal } = renderWithStore();
    fireEvent.press(getByTestId('goal-card-g-1-open'));
    expect(onSelectGoal).toHaveBeenCalledWith('g-1');
  });

  it('dispatches a deposit through the native DepositInput and updates the store', async () => {
    const { getByTestId, store } = renderWithStore();

    fireEvent.press(getByTestId('deposit-input-button'));

    await waitFor(() => {
      const updated = store.getState().goals.goals['g-1'];
      expect(updated.savedAmount).toBe(450); // 350 + 100 from the mocked DepositInput
    });
  });
});
