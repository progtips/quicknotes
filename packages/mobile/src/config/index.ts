import { Platform } from 'react-native';
import { API_BASE_URL as API_BASE_URL_FROM_CONFIG } from './api';

// Условный импорт Constants только для мобильных платформ
// На web Constants может быть недоступен или вызывать ошибки
let Constants: any;
try {
  if (Platform.OS !== 'web') {
    Constants = require('expo-constants').default;
  }
} catch (error) {
  console.warn('Config: не удалось загрузить expo-constants', error);
  Constants = null;
}

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
    const url = process.env.EXPO_PUBLIC_API_URL;
    if (url && typeof url === 'string' && url.length > 0) {
      return url;
    }
  }

  // Приоритет 2: Constants.expoConfig.extra.EXPO_PUBLIC_API_URL (только для mobile builds)
  // На web полностью избегаем использования Constants, чтобы предотвратить ошибки
  if (Platform.OS !== 'web') {
    try {
      // Строгая проверка Constants перед использованием
      if (typeof Constants === 'undefined' || Constants === null) {
        throw new Error('Constants is undefined');
      }
      
      // Проверка expoConfig
      if (!Constants.expoConfig || typeof Constants.expoConfig !== 'object') {
        throw new Error('Constants.expoConfig is not available');
      }
      
      const extra = Constants.expoConfig.extra as EnvConfig | undefined;
      if (extra?.EXPO_PUBLIC_API_URL && typeof extra.EXPO_PUBLIC_API_URL === 'string') {
        return extra.EXPO_PUBLIC_API_URL;
      }

      // Приоритет 3: Constants.expoConfig.extra.API_BASE_URL (backward compatibility)
      if (extra?.API_BASE_URL && typeof extra.API_BASE_URL === 'string') {
        return extra.API_BASE_URL;
      }
    } catch (error) {
      console.warn('Config: ошибка чтения Constants.expoConfig', error);
    }
  }

  // Приоритет 4: Используем централизованный конфиг из api.ts
  if (!API_BASE_URL_FROM_CONFIG || typeof API_BASE_URL_FROM_CONFIG !== 'string') {
    console.error('Config: API_BASE_URL_FROM_CONFIG невалиден', API_BASE_URL_FROM_CONFIG);
    // Последний fallback
    return 'https://quicknotesbackend-production-e224.up.railway.app/api';
  }
  
  return API_BASE_URL_FROM_CONFIG;
};

/**
 * Получение конфигурации из Expo Constants
 */
const getConfig = (): EnvConfig => {
  let extra: EnvConfig | undefined;
  
  // На web полностью избегаем использования Constants
  if (Platform.OS !== 'web') {
    try {
      // Строгая проверка Constants перед использованием
      if (typeof Constants !== 'undefined' && Constants !== null && Constants.expoConfig) {
        extra = Constants.expoConfig.extra as EnvConfig | undefined;
      }
    } catch (error) {
      console.warn('Config: не удалось получить Constants.expoConfig.extra', error);
    }
  }
  
  const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
  
  // Получаем API URL с учетом всех источников
  const apiUrl = getApiUrl();
  
  // Валидация apiUrl
  if (!apiUrl || typeof apiUrl !== 'string' || apiUrl.length === 0) {
    console.error('Config: apiUrl невалиден', apiUrl);
    throw new Error('Не удалось определить API URL');
  }

  if (!extra) {
    // Fallback значения для случаев, когда extra недоступен
    return {
      API_BASE_URL: apiUrl,
      EXPO_PUBLIC_API_URL: apiUrl,
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
    // Гарантируем, что флаги установлены
    isDev: extra.isDev ?? isDev,
    isProd: extra.isProd ?? !isDev,
    env: extra.env || (isDev ? 'development' : 'production'),
  };
};

const config = getConfig();

// Безопасная проверка конфигурации
if (!config || !config.API_BASE_URL) {
  console.error('Config: критическая ошибка - конфигурация невалидна', config);
  throw new Error('Не удалось инициализировать конфигурацию приложения');
}

/**
 * Базовый URL API
 * Использует process.env.EXPO_PUBLIC_API_URL с fallback на конфигурацию
 * Для прямого доступа используйте импорт из '../config/api'
 */
export const API_BASE_URL = config.API_BASE_URL || API_BASE_URL_FROM_CONFIG;

// Реэкспорт из централизованного конфига для удобства
export { API_BASE_URL as API_URL } from './api';

/**
 * API URL из переменной окружения (для прямого доступа)
 * Работает в mobile, web и production builds
 */
export const EXPO_PUBLIC_API_URL = config?.EXPO_PUBLIC_API_URL || config?.API_BASE_URL || API_BASE_URL_FROM_CONFIG;

/**
 * Флаг разработки
 */
export const isDev = config?.isDev ?? (typeof __DEV__ !== 'undefined' ? __DEV__ : false);

/**
 * Флаг продакшена
 */
export const isProd = config?.isProd ?? !isDev;

/**
 * Текущее окружение
 */
export const env = config?.env ?? (isDev ? 'development' : 'production');

/**
 * Экспорт всей конфигурации
 */
export default {
  API_BASE_URL: API_BASE_URL || API_BASE_URL_FROM_CONFIG,
  EXPO_PUBLIC_API_URL: EXPO_PUBLIC_API_URL || API_BASE_URL_FROM_CONFIG,
  isDev,
  isProd,
  env,
};

