const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.blockList = [
  // Exclude test files and unnecessary modules
  /\*\*\/node_modules\/react-native\/\.?\(buck\|build\)/,
];

// Enable proper module resolution for native modules
config.resolver.extraNodeModules = {
  'react-native': require.resolve('react-native'),
};

module.exports = config;
