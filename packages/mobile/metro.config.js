// metro.config.js (исправленный и совместимый с Expo SDK 50+)

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Гарантируем, что resolver существует
config.resolver = config.resolver || {};

// Задаём alias для debug, чтобы Expo Web всегда использовал browser-версию
// Вместо node.js версии, которая тянет `tty` и ломает web-сборку
const debugBrowserPath = require.resolve('debug/src/browser.js');

config.resolver.alias = {
  ...(config.resolver.alias || {}),
  debug: debugBrowserPath,
};

// ВАЖНО: НЕ добавляем blockList, blacklist или resolverMainFields —
// эти поля в Expo легко ломают metro, т.к. структуры меняются в разных SDK.
// Минимальная конфигурация — самая безопасная и стабильная.

module.exports = config;
