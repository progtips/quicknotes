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

// Функция для безопасного получения authStorage
const getAuthStorage = (): AuthStorage => {
  // Сначала проверяем наличие window (web платформа)
  if (typeof window !== 'undefined') {
    return webStorage;
  }
  
  // Затем проверяем Platform (native платформы)
  try {
    if (Platform && Platform.OS) {
      return Platform.OS === 'web' ? webStorage : nativeStorage;
    }
  } catch (error) {
    console.warn('Ошибка определения платформы через Platform, используем fallback');
  }
  
  // Fallback: по умолчанию используем nativeStorage
  // Но если мы дошли сюда, скорее всего это web, поэтому используем webStorage
  return webStorage;
};

// Экспортируем правильную реализацию в зависимости от платформы
// Используем ленивую инициализацию для гарантии правильной работы
let _authStorageInstance: AuthStorage | null = null;

const getAuthStorageInstance = (): AuthStorage => {
  if (!_authStorageInstance) {
    _authStorageInstance = getAuthStorage();
  }
  return _authStorageInstance;
};

export const authStorage: AuthStorage = getAuthStorageInstance();
