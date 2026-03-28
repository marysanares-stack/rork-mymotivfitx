// Metro configuration for Expo/React Native
// Blocks the nested duplicate project folder from being resolved by Metro,
// which can cause bundling hangs and stray imports.

const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Prevent Metro from resolving modules from the nested duplicate project.
const nestedProjectPath = path.resolve(__dirname, 'rork-mymotivfitx');

// Use resolver.blockList with a simple array of RegExp patterns
config.resolver = {
  ...config.resolver,
  blockList: [
    new RegExp(`${nestedProjectPath.replace(/[/\\]/g, '[/\\\\]')}/.*`),
  ],
};

module.exports = config;
