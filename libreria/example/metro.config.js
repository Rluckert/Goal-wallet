const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// rn-savings-notifier is linked via "file:.." (npm symlinks it in
// node_modules). Its own node_modules has its own react/react-native
// copies (used for its unit tests) — force Metro to resolve a single
// instance from this app instead, or hooks break with "Invalid hook
// call" from two React copies being loaded.
const libraryRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [libraryRoot],
  resolver: {
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
    },
    // libreria/node_modules has its own react/react-native copies (for its
    // own unit tests). Watching libraryRoot makes Metro see those too,
    // which confuses its codegen/Flow processing for RN's internal files
    // (two mismatched react-native versions in the graph). Block only
    // those two — NOT all of libreria/node_modules, since the compiled
    // lib/ output still needs to resolve its own deps like @babel/runtime
    // from there.
    blockList: [
      /libreria[\\/]node_modules[\\/]react-native[\\/].*/,
      /libreria[\\/]node_modules[\\/]react[\\/].*/,
      /libreria[\\/]node_modules[\\/]@react-native[\\/].*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
