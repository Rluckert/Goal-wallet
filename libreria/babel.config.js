// Windows uses backslashes in absolute paths — a plain "/node_modules/" regex
// never matches there, silently disabling the node_modules override below
// (breaks parsing of RN's own Flow source, e.g. @react-native/jest-preset's
// use of Flow's "as" casting, which needs the hermes-parser override that
// only @react-native/babel-preset wires in). Match both separators.
const NODE_MODULES = /[\\/]node_modules[\\/]/;

module.exports = {
  overrides: [
    {
      exclude: NODE_MODULES,
      presets: ['module:react-native-builder-bob/babel-preset'],
    },
    {
      include: NODE_MODULES,
      presets: ['module:@react-native/babel-preset'],
    },
  ],
};
