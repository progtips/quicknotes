import { api } from './api';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    createdAt: string;
  };
  accessToken: string;
}

export const login = async (data: LoginRequest) => {
  const response = await api.post<{ data: AuthResponse }>('/auth/login', data);
  return response.data;
};

export const register = async (data: RegisterRequest) => {
  const response = await api.post<{ data: AuthResponse }>('/auth/register', data);
  return response.data;
};

export const getMe = async () => {
  const response = await api.get<{ data: { user: AuthResponse['user'] } }>('/auth/me');
  return response.data;
};

