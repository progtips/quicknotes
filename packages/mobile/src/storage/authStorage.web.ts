import { AuthStorage } from './authStorage.types';

const TOKEN_KEY = 'accessToken';
const USER_KEY = 'user';

/**
 * Реализация AuthStorage для Web платформы
 * Использует localStorage
 */
export const webAuthStorage: AuthStorage = {
  async setToken(token: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem(TOKEN_KEY, token);
    }
  },

  async getToken(): Promise<string | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  async removeToken(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(TOKEN_KEY);
    }
  },

  async setUser(user: object): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      const userStr = JSON.stringify(user);
      localStorage.setItem(USER_KEY, userStr);
    }
  },

  async getUser(): Promise<object | null> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const userStr = localStorage.getItem(USER_KEY);
        return userStr ? JSON.parse(userStr) : null;
      } catch (error) {
        return null;
      }
    }
    return null;
  },

  async removeUser(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(USER_KEY);
    }
  },

  async clear(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
  },
};

