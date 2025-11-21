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
    console.log('authStorage: определяем платформу как web через window');
    return webStorage;
  }
  
  // Затем проверяем Platform (native платформы)
  try {
    if (Platform && Platform.OS) {
      const storage = Platform.OS === 'web' ? webStorage : nativeStorage;
      console.log('authStorage: определяем платформу через Platform.OS:', Platform.OS);
      return storage;
    }
  } catch (error) {
    console.warn('authStorage: ошибка определения платформы через Platform', error);
  }
  
  // Fallback: по умолчанию используем webStorage
  console.warn('authStorage: используем fallback - webStorage');
  return webStorage;
};

// Экспортируем правильную реализацию в зависимости от платформы
// Используем прямую инициализацию для гарантии правильной работы
// Ленивая инициализация может вызывать проблемы с порядком загрузки модулей

const initializeAuthStorage = (): AuthStorage => {
  const storage = getAuthStorage();
  
  // Проверяем, что экземпляр валиден
  if (!storage || typeof storage.getToken !== 'function') {
    console.error('authStorage: созданный экземпляр не валиден!', {
      instance: storage,
      type: typeof storage,
      keys: storage ? Object.keys(storage) : [],
      hasGetToken: storage && typeof storage.getToken,
      hasSetToken: storage && typeof storage.setToken,
      hasRemoveToken: storage && typeof storage.removeToken,
    });
    // Принудительно используем webStorage как fallback
    console.warn('authStorage: используем webStorage как fallback');
    return webStorage;
  }
  
  console.log('authStorage: экземпляр успешно создан и валиден', {
    hasGetToken: typeof storage.getToken === 'function',
    hasSetToken: typeof storage.setToken === 'function',
    hasRemoveToken: typeof storage.removeToken === 'function',
    keys: Object.keys(storage),
  });
  
  return storage;
};

// Инициализируем сразу при загрузке модуля
export const authStorage: AuthStorage = initializeAuthStorage();
