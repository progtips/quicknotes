import Constants from 'expo-constants';

/**
 * Интерфейс для переменных окружения
 */
interface EnvConfig {
  API_BASE_URL: string;
  isDev: boolean;
  isProd: boolean;
  env: string;
}

/**
 * Получение конфигурации из Expo Constants
 */
const getConfig = (): EnvConfig => {
  const extra = Constants.expoConfig?.extra as EnvConfig | undefined;

  if (!extra) {
    // Fallback значения для случаев, когда extra недоступен
    // Используем безопасную проверку для web платформы
    // __DEV__ доступен в Expo на всех платформах, включая web
    // process.env может быть недоступен на web, поэтому используем только __DEV__
    const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : true;
    return {
      API_BASE_URL: isDev ? 'http://localhost:4000/api' : 'https://your-domain.com/api',
      isDev,
      isProd: !isDev,
      env: isDev ? 'development' : 'production',
    };
  }

  return extra;
};

const config = getConfig();

/**
 * Базовый URL API
 */
export const API_BASE_URL = config.API_BASE_URL;

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
  isDev,
  isProd,
  env,
};

