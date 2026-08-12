module.exports = {
  preset: 'react-native',
  // @reduxjs/toolkit pulls in immer's ESM build, which the RN preset's
  // default transformIgnorePatterns doesn't cover — extend it rather than
  // replace it, so RN's own internal packages stay transformed too.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@reduxjs/toolkit|immer)/)',
  ],
};
