/**
 * Конфигурация API для QuickNotes
 * 
 * Приоритет получения API URL:
 * 1. EXPO_PUBLIC_API_URL (переменная окружения)
 * 2. Railway production URL (fallback)
 * 
 * Для локальной разработки установите:
 * EXPO_PUBLIC_API_URL=http://localhost:4000/api
 * 
 * Для production в Vercel установите:
 * EXPO_PUBLIC_API_URL=https://quicknotesbackend-production-e224.up.railway.app/api
 */

const getApiBaseUrl = () => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL;
  const fallbackUrl = 'https://quicknotesbackend-production-e224.up.railway.app/api';
  
  const finalUrl = envUrl ?? fallbackUrl;
  
  // Логируем для отладки
  console.log('API Config:', {
    envUrl,
    fallbackUrl,
    finalUrl,
    hasEnvVar: !!envUrl,
  });
  
  return finalUrl;
};

export const API_BASE_URL = getApiBaseUrl();

