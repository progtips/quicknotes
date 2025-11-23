import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

// Валидация API_BASE_URL перед созданием axios instance
const validatedBaseURL = (() => {
  if (!API_BASE_URL || typeof API_BASE_URL !== 'string' || API_BASE_URL.length === 0) {
    console.error('API: API_BASE_URL невалиден', API_BASE_URL);
    // Fallback на Railway URL
    const fallbackURL = 'https://quicknotesbackend-production-e224.up.railway.app/api';
    console.warn('API: используем fallback URL', fallbackURL);
    return fallbackURL;
  }
  return API_BASE_URL;
})();

/**
 * Создание экземпляра axios с базовой конфигурацией
 * API_BASE_URL из config/api.ts использует process.env.EXPO_PUBLIC_API_URL
 * или Railway production URL как fallback
 */
export const api = axios.create({
  baseURL: validatedBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 секунд таймаут
});

/**
 * Interceptor для автоматической подстановки JWT токена в заголовки
 */
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    try {
      const token = await tokenStorage.getToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Ошибка получения токена:', error);
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor для обработки ответов и ошибок
 */
api.interceptors.response.use(
  (response) => {
    // Логируем структуру ответа для отладки
    if (process.env.NODE_ENV === 'development') {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        baseURL: response.config.baseURL,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : [],
      });
    }
    // Успешный ответ - просто возвращаем
    return response;
  },
  async (error: AxiosError) => {
    // Обработка ошибок
    if (error.response?.status === 401) {
      // Токен истек или недействителен - очищаем токен
      try {
        await tokenStorage.clearToken();
      } catch (clearError) {
        console.error('Ошибка очистки токена:', clearError);
      }
      
      // На web платформе не делаем редирект через window.location
      // Навигация будет обработана через React Navigation
      // Это предотвращает 404 ошибки на Vercel
      console.warn('API: 401 ошибка - токен недействителен, навигация обработается через React Navigation');
    }

    // Пробрасываем ошибку дальше
    return Promise.reject(error);
  }
);

/**
 * Типы для API ответов
 */
export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: string;
  details?: unknown;
}
