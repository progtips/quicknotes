import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { authStorage } from '../storage/authStorage';
import { Platform } from 'react-native';

// Базовый URL API (пока захардкожен, потом вынесем в .env)
const API_URL = 'http://localhost:4000/api';

/**
 * Создание экземпляра axios с базовой конфигурацией
 */
export const api = axios.create({
  baseURL: API_URL,
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
      const token = await authStorage.getToken();
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
    // Успешный ответ - просто возвращаем
    return response;
  },
  async (error: AxiosError) => {
    // Обработка ошибок
    if (error.response?.status === 401) {
      // Токен истек или недействителен - очищаем хранилище
      await authStorage.clear();
      
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
