const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://facebook.github.io/metro/docs/configuration
 *
 * @type {import('metro-config').MetroConfig}
 */

const defaultConfig = getDefaultConfig(__dirname);

// Disable Hermes for development
defaultConfig.transformer = {
  ...defaultConfig.transformer,
  assetPlugins: ['react-native-reanimated/plugin'],
};

const config = {};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);