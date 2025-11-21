/**
 * Конфигурация Expo приложения с поддержкой переменных окружения
 */
export default ({ config }: { config: any }) => {
  // Определение окружения (development по умолчанию)
  const env = process.env.NODE_ENV || 'development';
  const isDev = env === 'development';

  // URL API в зависимости от окружения
  const API_BASE_URL =
    process.env.EXPO_PUBLIC_API_BASE_URL ||
    (isDev ? 'http://localhost:4000/api' : 'https://your-domain.com/api');

  return {
    ...config,
    name: 'QuickNotes',
    slug: 'quicknotes',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.quicknotes.app',
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      package: 'com.quicknotes.app',
    },
    web: {
      favicon: './assets/favicon.png',
      bundler: 'metro',
      // Изменено с 'static' на 'single' для полного отключения SSR
      // 'single' режим генерирует один HTML файл без серверного рендеринга
      output: 'single',
      // Отключаем SSR (Server-Side Rendering) для предотвращения ошибок с Node.js модулями
      // Это предотвращает попытки Expo рендерить приложение на Node.js,
      // где используются модули debug/src/node.js и tty, недоступные в браузере
      ssr: false,
    },
    scheme: 'quicknotes',
    plugins: [],
    // Переменные окружения доступные в runtime через Constants.expoConfig.extra
    extra: {
      API_BASE_URL,
      isDev,
      isProd: !isDev,
      env,
    },
  };
};

