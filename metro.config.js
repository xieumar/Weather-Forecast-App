const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .wasm support for expo-sqlite on web
// Add font formats so Ionicons/.ttf/.otf are bundled into dist/assets/
config.resolver.assetExts.push('wasm', 'ttf', 'otf', 'woff', 'woff2');

module.exports = config;