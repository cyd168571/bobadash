/**
 * Metro Configuration for Boba Dash
 * Enables requiring .html files as assets (for WebView game)
 */
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add .html as an asset extension so we can require() it in GameScreen
config.resolver.assetExts.push('html');

module.exports = config;
