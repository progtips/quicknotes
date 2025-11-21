import { api, ApiResponse } from './api';
import { tokenStorage } from '../storage/tokenStorage';
import { authStorage } from '../storage/authStorage';
import { AxiosError } from 'axios';

/**
 * Типы для запросов аутентификации
 */
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

/**
 * Типы для ответов аутентификации
 */
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

/**
 * Регистрация нового пользователя
 * @param data - email и password
 * @returns Данные пользователя и accessToken
 * @throws AxiosError с кодом 409 если пользователь уже существует
 */
export const register = async (
  data: RegisterRequest
): Promise<ApiResponse<AuthResponse>> => {
  console.log('API register: отправляем запрос', {
    url: `${api.defaults.baseURL}/auth/register`,
    email: data.email,
  });
  
  try {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
    
    console.log('API register: получен ответ', {
      status: response.status,
      hasToken: !!response.data.data.accessToken,
      hasUser: !!response.data.data.user,
    });
    
    // Сохраняем токен и пользователя после успешной регистрации
    if (response.data.data.accessToken) {
      try {
        await tokenStorage.setToken(response.data.data.accessToken);
        if (authStorage && typeof authStorage.setUser === 'function') {
          await authStorage.setUser(response.data.data.user);
        }
        console.log('API register: токен и пользователь сохранены');
      } catch (error) {
        console.error('API register: ошибка сохранения токена', error);
        // Не пробрасываем ошибку дальше, чтобы не ломать регистрацию
        // Токен можно будет сохранить позже при следующем запросе
      }
    }
    
    return response.data;
  } catch (error) {
    const axiosError = error as AxiosError<{ error?: string; message?: string }>;
    
    // Специальная обработка для 409 Conflict (пользователь уже существует)
    if (axiosError.response?.status === 409) {
      // Создаем понятную ошибку для пользователя
      const errorMessage = axiosError.response.data?.error || 
                          axiosError.response.data?.message || 
                          'Пользователь с таким email уже зарегистрирован';
      
      // Создаем новую ошибку с понятным сообщением
      const customError = new Error(errorMessage) as AxiosError;
      customError.response = axiosError.response;
      customError.request = axiosError.request;
      customError.config = axiosError.config;
      customError.isAxiosError = true;
      
      throw customError;
    }
    
    // Для других ошибок пробрасываем как есть
    throw error;
  }
};

/**
 * Вход в систему
 * @param data - email и password
 * @returns Данные пользователя и accessToken
 */
export const login = async (
  data: LoginRequest
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', data);
  
  // Сохраняем токен и пользователя после успешного входа
  if (response.data.data.accessToken) {
    try {
      await tokenStorage.setToken(response.data.data.accessToken);
      if (authStorage && typeof authStorage.setUser === 'function') {
        await authStorage.setUser(response.data.data.user);
      }
    } catch (error) {
      console.error('API login: ошибка сохранения токена', error);
      throw error; // Пробрасываем ошибку, так как без токена вход не имеет смысла
    }
  }
  
  return response.data;
};

/**
 * Получить информацию о текущем пользователе
 * @returns Данные текущего пользователя
 */
export const getMe = async (): Promise<ApiResponse<{ user: User }>> => {
  const response = await api.get<ApiResponse<{ user: User }>>('/auth/me');
  return response.data;
};

/**
 * Выход из системы (очистка токена и пользователя)
 */
export const logout = async (): Promise<void> => {
  try {
    console.log('API logout: начало выхода');
    
    // Очищаем токен
    await tokenStorage.clearToken();
    console.log('API logout: токен очищен');
    
    // Также очищаем пользователя из хранилища
    if (authStorage && typeof authStorage.removeUser === 'function') {
      await authStorage.removeUser();
      console.log('API logout: пользователь удален из хранилища');
    } else if (authStorage && typeof authStorage.clear === 'function') {
      // Fallback: используем clear если removeUser недоступен
      await authStorage.clear();
      console.log('API logout: хранилище очищено через clear()');
    }
    
    console.log('API logout: выход завершен успешно');
  } catch (error) {
    console.error('API logout: ошибка очистки токена', error);
    // Не пробрасываем ошибку, так как выход должен работать в любом случае
    // Пытаемся очистить хотя бы через localStorage напрямую
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        console.log('API logout: очистка через localStorage fallback');
      }
    } catch (fallbackError) {
      console.error('API logout: ошибка fallback очистки', fallbackError);
    }
  }
};
