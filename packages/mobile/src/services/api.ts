import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '../storage/tokenStorage';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../config/api';

/**
 * Создание экземпляра axios с базовой конфигурацией
 * API_BASE_URL из config/api.ts использует process.env.EXPO_PUBLIC_API_URL
 * или Railway production URL как fallback
 */
export const api = axios.create({
  baseURL: API_BASE_URL,
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
      
      // На web платформе можно перенаправить на страницу входа
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.location.href = '/login';
      }
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
