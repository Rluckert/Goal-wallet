import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { goalsReducer, loadGoals, type GoalDTO } from '../../../infrastructure/redux/goalsSlice';
import { GoalListScreen } from '../GoalListScreen';

// GoalListScreen calls the native confirm dialog (via ConfirmDialog ->
// rn-savings-notifier's showConfirmDialog) before navigating — the real
// package imports a TurboModule that only resolves inside a native runtime,
// so it's mocked here.
jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(),
  showConfirmDialog: jest.fn(),
}));

import { showConfirmDialog } from 'rn-savings-notifier';

const mockedShowConfirmDialog = showConfirmDialog as jest.Mock;

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
  beforeEach(() => {
    mockedShowConfirmDialog.mockReset();
  });

  it('renders each goal with its name, amounts and progress bar, with no deposit input', () => {
    const { getByText, getByTestId, queryByTestId } = renderWithStore();
    expect(getByText('New Laptop')).toBeTruthy();
    expect(getByText('$350.00 of $1000.00')).toBeTruthy();
    expect(getByText('35% complete')).toBeTruthy();
    expect(getByTestId('goal-card-g-1-fill').props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ width: '35%' })]),
    );
    expect(queryByTestId('deposit-input')).toBeNull();
  });

  it('shows an empty state when there are no goals', () => {
    const { getByText } = renderWithStore([]);
    expect(getByText('No goals yet.')).toBeTruthy();
  });

  it('asks for confirmation with the goal name before navigating', async () => {
    mockedShowConfirmDialog.mockResolvedValueOnce(true);
    const { getByTestId, onSelectGoal } = renderWithStore();

    fireEvent.press(getByTestId('goal-card-g-1-open'));

    expect(mockedShowConfirmDialog).toHaveBeenCalledWith({
      title: 'New Laptop',
      message: 'Would you like to make a deposit to this goal?',
    });
    await waitFor(() => expect(onSelectGoal).toHaveBeenCalledWith('g-1'));
  });

  it('does not navigate when the confirm dialog is declined', async () => {
    mockedShowConfirmDialog.mockResolvedValueOnce(false);
    const { getByTestId, onSelectGoal } = renderWithStore();

    fireEvent.press(getByTestId('goal-card-g-1-open'));

    await waitFor(() => expect(mockedShowConfirmDialog).toHaveBeenCalled());
    expect(onSelectGoal).not.toHaveBeenCalled();
  });
});
