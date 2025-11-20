import { AuthStorage } from './authStorage.types';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// Динамический импорт SecureStore только для native платформ
let SecureStore: typeof import('expo-secure-store') | null = null;

// Инициализация SecureStore только если доступен
const initSecureStore = async () => {
  if (!SecureStore) {
    try {
      SecureStore = await import('expo-secure-store');
    } catch (error) {
      console.warn('SecureStore недоступен, используем AsyncStorage');
    }
  }
};

/**
 * Реализация AuthStorage для Native платформ (iOS/Android)
 * Использует SecureStore с fallback на AsyncStorage
 */
export const nativeAuthStorage: AuthStorage = {
  async setToken(token: string): Promise<void> {
    await initSecureStore();
    try {
      if (SecureStore) {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } else {
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    } catch (error) {
      // Fallback на AsyncStorage
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    await initSecureStore();
    try {
      if (SecureStore) {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } else {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
    } catch (error) {
      return await AsyncStorage.getItem(TOKEN_KEY);
    }
  },

  async removeToken(): Promise<void> {
    await initSecureStore();
    try {
      if (SecureStore) {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } else {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    } catch (error) {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  },

  async setUser(user: object): Promise<void> {
    const userStr = JSON.stringify(user);
    await AsyncStorage.setItem(USER_KEY, userStr);
  },

  async getUser(): Promise<object | null> {
    try {
      const userStr = await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  },

  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(USER_KEY);
  },

  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};

