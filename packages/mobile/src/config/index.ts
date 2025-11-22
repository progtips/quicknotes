import Constants from 'expo-constants';
import { API_BASE_URL as API_BASE_URL_FROM_CONFIG } from './api';

/**
 * Интерфейс для переменных окружения
 */
interface EnvConfig {
  API_BASE_URL: string;
  EXPO_PUBLIC_API_URL?: string;
  isDev: boolean;
  isProd: boolean;
  env: string;
}

/**
 * Получение API URL с приоритетом process.env.EXPO_PUBLIC_API_URL
 * Это работает для всех платформ (mobile, web, production builds)
 */
const getApiUrl = (): string => {
  // Приоритет 1: process.env.EXPO_PUBLIC_API_URL (работает в web и production builds)
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Приоритет 2: Constants.expoConfig.extra.EXPO_PUBLIC_API_URL (для mobile builds)
  const extra = Constants.expoConfig?.extra as EnvConfig | undefined;
  if (extra?.EXPO_PUBLIC_API_URL) {
    return extra.EXPO_PUBLIC_API_URL;
  }

  // Приоритет 3: Constants.expoConfig.extra.API_BASE_URL (backward compatibility)
  if (extra?.API_BASE_URL) {
    return extra.API_BASE_URL;
  }

  // Приоритет 4: Используем централизованный конфиг из api.ts
  return API_BASE_URL_FROM_CONFIG;
};

/**
 * Получение конфигурации из Expo Constants
 */
const getConfig = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra as EnvConfig | undefined;
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
  
  // Получаем API URL с учетом всех источников
  const apiUrl = getApiUrl();

  if (!extra) {
    // Fallback значения для случаев, когда extra недоступен
    return {
      API_BASE_URL: apiUrl,
      isDev,
      isProd: !isDev,
      env: isDev ? 'development' : 'production',
    };
  }

  // Возвращаем конфигурацию с обновленным API URL
  return {
    ...extra,
    API_BASE_URL: apiUrl,
    EXPO_PUBLIC_API_URL: apiUrl,
  };
};

const config = getConfig();

/**
 * Базовый URL API
 * Использует process.env.EXPO_PUBLIC_API_URL с fallback на конфигурацию
 * Для прямого доступа используйте импорт из '../config/api'
 */
export const API_BASE_URL = config.API_BASE_URL;

// Реэкспорт из централизованного конфига для удобства
export { API_BASE_URL as API_URL } from './api';

/**
 * API URL из переменной окружения (для прямого доступа)
 * Работает в mobile, web и production builds
 */
export const EXPO_PUBLIC_API_URL = config.EXPO_PUBLIC_API_URL || config.API_BASE_URL;

/**
 * Флаг разработки
 */
export const isDev = config.isDev;

/**
 * Флаг продакшена
 */
export const isProd = config.isProd;

/**
 * Текущее окружение
 */
export const env = config.env;

/**
 * Экспорт всей конфигурации
 */
export default {
  API_BASE_URL,
  EXPO_PUBLIC_API_URL,
  isDev,
  isProd,
  env,
};

