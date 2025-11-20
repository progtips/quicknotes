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
        console.error('Ошибка загрузки пользователя:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await loginApi({ email, password });
      // Токен уже сохранен в loginApi функции
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const register = async (email: string, password: string): Promise<void> => {
    try {
      const response = await registerApi({ email, password });
      // Токен уже сохранен в registerApi функции
      setUser(response.data.user);
    } catch (error) {
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    await logoutApi();
    setUser(null);
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

