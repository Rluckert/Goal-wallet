/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

// The default screen renders <DepositInput/> per goal card — importing the
// real rn-savings-notifier package would hit TurboModuleRegistry outside a
// native runtime, so it's mocked the same way GoalListScreen.test.tsx does.
jest.mock('rn-savings-notifier', () => {
  const localReact = require('react');
  const { View } = require('react-native');
  return {
    DepositInput: () => localReact.createElement(View, { testID: 'deposit-input' }),
    notifyGoalCompleted: jest.fn(),
  };
});

// GoalDetailScreen imports react-native-webview at module scope, which hits
// TurboModuleRegistry immediately — mocked even though the list screen
// (App's initial screen) never mounts a WebView, since the import alone
// would crash outside a native runtime.
jest.mock('react-native-webview', () => {
  const localReact = require('react');
  const { View } = require('react-native');
  return {
    __esModule: true,
    default: localReact.forwardRef((_props: unknown, ref: unknown) =>
      localReact.createElement(View, { ref, testID: 'webview' }),
    ),
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<App />);
  });
});
