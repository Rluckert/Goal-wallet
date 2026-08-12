const path = require('path');
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// rn-savings-notifier is linked via "file:../libreria" (npm symlinks it into
// node_modules). Metro only watches this app's own root by default, so it
// never sees the symlinked source unless the library's folder is added to
// watchFolders. Same fix as libreria/example/metro.config.js, adapted since
// libreria/ is a sibling here, not a parent.
const libraryRoot = path.resolve(__dirname, '../libreria');

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
    // which confuses codegen/Flow processing for RN's internal files (two
    // mismatched react-native versions in the graph). Block only those —
    // not all of libreria/node_modules, since the compiled lib/ output
    // still needs to resolve its own deps like @babel/runtime from there.
    blockList: [
      /libreria[\\/]node_modules[\\/]react-native[\\/].*/,
      /libreria[\\/]node_modules[\\/]react[\\/].*/,
      /libreria[\\/]node_modules[\\/]@react-native[\\/].*/,
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
