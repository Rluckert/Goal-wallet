module.exports = {
  preset: 'react-native',
  // @reduxjs/toolkit pulls in immer's ESM build, react-redux and
  // react-native-webview ship their own ESM builds too — none of these are
  // covered by the RN preset's default transformIgnorePatterns, so extend
  // it rather than replace it.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@reduxjs/toolkit|immer|react-redux|react-native-webview)/)',
  ],
};
