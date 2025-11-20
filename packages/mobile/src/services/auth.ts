import { api, ApiResponse } from './api';
import { authStorage } from '../storage/authStorage';

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
 */
export const register = async (
  data: RegisterRequest
): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  
  // Сохраняем токен и пользователя после успешной регистрации
  if (response.data.data.accessToken) {
    await authStorage.setToken(response.data.data.accessToken);
    await authStorage.setUser(response.data.data.user);
  }
  
  return response.data;
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
    await authStorage.setToken(response.data.data.accessToken);
    await authStorage.setUser(response.data.data.user);
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
 * Выход из системы (очистка токена)
 */
export const logout = async (): Promise<void> => {
  await authStorage.clear();
};
