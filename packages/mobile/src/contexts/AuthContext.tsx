import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage } from '../storage/authStorage';
import { login as loginApi, register as registerApi, logout as logoutApi, User } from '../services/auth';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загрузка пользователя при инициализации
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await authStorage.getUser();
        if (userData) {
          setUser(userData as User);
        }
      } catch (error) {
        // Тихо игнорируем ошибки загрузки - пользователь просто не будет авторизован
        // Это нормально при первом запуске приложения
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await loginApi({ email, password });
      console.log('AuthContext.login: получен ответ', { 
        hasResponse: !!response,
        hasData: !!response?.data,
        hasUser: !!response?.data?.user 
      });
      
      // Проверяем наличие данных перед установкой
      if (response?.data?.user) {
        setUser(response.data.user);
      } else {
        throw new Error('Ответ сервера не содержит данных пользователя');
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    console.log('AuthContext.register: начало', { email });
    try {
      console.log('AuthContext.register: вызываем registerApi');
      const response = await registerApi({ email, password });
      console.log('AuthContext.register: получен ответ', { 
        hasResponse: !!response,
        hasData: !!response?.data,
        hasUser: !!response?.data?.user,
        responseStructure: response 
      });
      
      // Проверяем наличие данных перед установкой
      if (response?.data?.user) {
        // Токен уже сохранен в registerApi функции
        setUser(response.data.user);
        console.log('AuthContext.register: пользователь установлен в state');
      } else {
        console.error('AuthContext.register: ответ не содержит user', response);
        throw new Error('Ответ сервера не содержит данных пользователя');
      }
    } catch (error) {
      console.error('AuthContext.register: ошибка', error);
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('AuthContext.logout: начало выхода');
      await logoutApi();
      console.log('AuthContext.logout: logoutApi завершен');
    } catch (error) {
      console.error('AuthContext.logout: ошибка при вызове logoutApi', error);
      // Продолжаем выполнение даже при ошибке
    }
    
    // Всегда очищаем пользователя из state, даже если logoutApi упал
    console.log('AuthContext.logout: очищаем пользователя из state');
    setUser(null);
    
    // Также пытаемся очистить хранилище напрямую для надежности
    try {
      if (authStorage && typeof authStorage.removeUser === 'function') {
        await authStorage.removeUser();
        console.log('AuthContext.logout: пользователь удален из authStorage');
      } else if (authStorage && typeof authStorage.clear === 'function') {
        await authStorage.clear();
        console.log('AuthContext.logout: хранилище очищено через clear()');
      }
    } catch (clearError) {
      console.error('AuthContext.logout: ошибка очистки хранилища', clearError);
      // Игнорируем ошибку - главное, что пользователь удален из state
    }
    
    console.log('AuthContext.logout: выход завершен');
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

