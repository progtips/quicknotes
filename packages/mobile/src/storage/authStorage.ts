import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStorage } from './authStorage.types';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// Web-адаптер через localStorage
const webStorage: AuthStorage = {
  async setToken(token: string): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      // Игнорируем ошибки localStorage (например, в приватном режиме)
    }
  },

  async getToken(): Promise<string | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(TOKEN_KEY);
      }
    } catch (error) {
      // Игнорируем ошибки localStorage
    }
    return null;
  },

  async removeToken(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      // Игнорируем ошибки localStorage
    }
  },

  async setUser(user: object): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const userStr = JSON.stringify(user);
        localStorage.setItem(USER_KEY, userStr);
      }
    } catch (error) {
      // Игнорируем ошибки localStorage
    }
  },

  async getUser(): Promise<object | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const userStr = localStorage.getItem(USER_KEY);
        if (userStr) {
          return JSON.parse(userStr);
        }
      }
    } catch (error) {
      // Игнорируем ошибки парсинга или localStorage
    }
    return null;
  },

  async removeUser(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(USER_KEY);
      }
    } catch (error) {
      // Игнорируем ошибки localStorage
    }
  },

  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};

// Native — используем AsyncStorage
const nativeStorage: AuthStorage = {
  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getToken(): Promise<string | null> {
    return await AsyncStorage.getItem(TOKEN_KEY);
  },

  async removeToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_KEY);
  },

  async setUser(user: object): Promise<void> {
    const userStr = JSON.stringify(user);
    await AsyncStorage.setItem(USER_KEY, userStr);
  },

  async getUser(): Promise<object | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      if (userStr) {
        return JSON.parse(userStr);
      }
    } catch (error) {
      // Игнорируем ошибки парсинга
    }
    return null;
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clear(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  },
};

// Экспортируем правильную реализацию в зависимости от платформы
export const authStorage: AuthStorage = Platform.OS === 'web' ? webStorage : nativeStorage;
