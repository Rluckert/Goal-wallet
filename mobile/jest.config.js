module.exports = {
  preset: 'react-native',
  // @reduxjs/toolkit pulls in immer's ESM build, react-redux,
  // react-native-webview, and @react-native-async-storage/async-storage each
  // ship their own ESM builds too — none of these are covered by the RN
  // preset's default transformIgnorePatterns, so extend it rather than replace it.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community|-async-storage)?|@reduxjs/toolkit|immer|react-redux|react-native-webview)/)',
  ],
};
