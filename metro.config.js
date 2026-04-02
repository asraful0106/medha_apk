// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Add sql to asset extensions
// config.resolver.assetExts.push("sql");

// Add ogg to asset extensions
config.resolver.assetExts.push("ogg");

module.exports = config;
