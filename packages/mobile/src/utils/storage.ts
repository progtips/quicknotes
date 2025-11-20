import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

// Определяем, используем ли мы web платформу
const isWeb = Platform.OS === 'web';

/**
 * Универсальное хранилище токенов:
 * - Web: localStorage
 * - Mobile: SecureStore (iOS/Android) или AsyncStorage (fallback)
 */
class TokenStorage {
  /**
   * Сохранить токен
   */
  async setToken(token: string): Promise<void> {
    if (isWeb) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      try {
        // Пытаемся использовать SecureStore для безопасности
        await SecureStore.setItemAsync(TOKEN_KEY, token);
      } catch (error) {
        // Fallback на AsyncStorage если SecureStore недоступен
        console.warn('SecureStore недоступен, используем AsyncStorage');
        await AsyncStorage.setItem(TOKEN_KEY, token);
      }
    }
  }

  /**
   * Получить токен
   */
  async getToken(): Promise<string | null> {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      try {
        return await SecureStore.getItemAsync(TOKEN_KEY);
      } catch (error) {
        return await AsyncStorage.getItem(TOKEN_KEY);
      }
    }
  }

  /**
   * Удалить токен
   */
  async removeToken(): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
    } else {
      try {
        await SecureStore.deleteItemAsync(TOKEN_KEY);
      } catch (error) {
        await AsyncStorage.removeItem(TOKEN_KEY);
      }
    }
  }

  /**
   * Сохранить данные пользователя
   */
  async setUser(user: object): Promise<void> {
    const userStr = JSON.stringify(user);
    if (isWeb) {
      localStorage.setItem(USER_KEY, userStr);
    } else {
      await AsyncStorage.setItem(USER_KEY, userStr);
    }
  }

  /**
   * Получить данные пользователя
   */
  async getUser(): Promise<object | null> {
    try {
      const userStr = isWeb
        ? localStorage.getItem(USER_KEY)
        : await AsyncStorage.getItem(USER_KEY);
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Удалить данные пользователя
   */
  async removeUser(): Promise<void> {
    if (isWeb) {
      localStorage.removeItem(USER_KEY);
    } else {
      await AsyncStorage.removeItem(USER_KEY);
    }
  }

  /**
   * Очистить все данные (токен и пользователь)
   */
  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  }
}

export const tokenStorage = new TokenStorage();

