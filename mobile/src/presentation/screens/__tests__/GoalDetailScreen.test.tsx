import React from 'react';
import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { Provider } from 'react-redux';
import { goalsReducer, loadGoals, type GoalDTO } from '../../../infrastructure/redux/goalsSlice';
import { GoalDetailScreen } from '../GoalDetailScreen';

interface MockWebViewProps {
  onLoadEnd?: () => void;
  onMessage?: (event: { nativeEvent: { data: string } }) => void;
}

// goalsSlice -> SavingsNotifier imports rn-savings-notifier at module scope,
// which hits TurboModuleRegistry outside a native runtime — same as in
// GoalListScreen.test.tsx, even though this screen never calls showConfirmDialog.
jest.mock('rn-savings-notifier', () => ({
  notifyGoalCompleted: jest.fn(),
  showConfirmDialog: jest.fn(),
}));

// Everything the test needs lives inside the factory closure (rather than
// referencing outer-scope variables, which jest.mock's hoisting forbids) and
// is exposed on the mocked module's exports, fetched below via requireMock.
jest.mock('react-native-webview', () => {
  const localReact = require('react');
  const { View } = require('react-native');
  const mockPostMessage = jest.fn();
  let lastProps: MockWebViewProps = {};

  const MockWebView = localReact.forwardRef((props: MockWebViewProps, ref: unknown) => {
    lastProps = props;
    localReact.useImperativeHandle(ref, () => ({ postMessage: mockPostMessage }));
    return localReact.createElement(View, { testID: 'webview' });
  });

  return {
    __esModule: true,
    default: MockWebView,
    __mockPostMessage: mockPostMessage,
    __getLastProps: () => lastProps,
  };
});

const webViewMock = jest.requireMock('react-native-webview') as {
  __mockPostMessage: jest.Mock;
  __getLastProps: () => MockWebViewProps;
};

const GOAL: GoalDTO = { id: 'g-1', name: 'New Laptop', targetAmount: 1000, savedAmount: 350 };

function renderScreen(goalId = 'g-1') {
  const store = configureStore({ reducer: { goals: goalsReducer } });
  store.dispatch(loadGoals.fulfilled([GOAL], 'req-1', undefined));
  const onBack = jest.fn();

  const utils = render(
    <Provider store={store}>
      <GoalDetailScreen goalId={goalId} onBack={onBack} />
    </Provider>,
  );

  return { ...utils, store, onBack };
}

describe('GoalDetailScreen', () => {
  beforeEach(() => {
    webViewMock.__mockPostMessage.mockClear();
  });

  it('sends INIT_SESSION with the goal snapshot once the WebView finishes loading', () => {
    renderScreen();

    webViewMock.__getLastProps().onLoadEnd?.();

    expect(webViewMock.__mockPostMessage).toHaveBeenCalledTimes(1);
    const sent = JSON.parse(webViewMock.__mockPostMessage.mock.calls[0][0]);
    expect(sent).toMatchObject({ type: 'INIT_SESSION', payload: { goalId: 'g-1', goal: GOAL } });
  });

  it('dispatches a deposit when the web micro-app confirms one', async () => {
    const { store } = renderScreen();

    webViewMock.__getLastProps().onMessage?.({
      nativeEvent: {
        data: JSON.stringify({ type: 'DEPOSIT_CONFIRMED', payload: { goalId: 'g-1', amount: 50 } }),
      },
    });

    await waitFor(() => {
      expect(store.getState().goals.goals['g-1'].savedAmount).toBe(400);
    });
  });

  it('ignores a malformed message instead of dispatching', async () => {
    const { store } = renderScreen();

    webViewMock.__getLastProps().onMessage?.({ nativeEvent: { data: 'not json' } });

    // Give any (incorrect) async dispatch a tick to have happened, then assert nothing changed.
    await new Promise<void>(resolve => setTimeout(() => resolve(), 0));
    expect(store.getState().goals.goals['g-1'].savedAmount).toBe(350);
  });

  it('calls onBack when the back link is pressed', () => {
    const { getByTestId, onBack } = renderScreen();
    fireEvent.press(getByTestId('goal-detail-back'));
    expect(onBack).toHaveBeenCalled();
  });

  it('shows a not-found state for an unknown goal id', () => {
    const { getByText } = renderScreen('missing');
    expect(getByText('Goal not found.')).toBeTruthy();
  });
});
