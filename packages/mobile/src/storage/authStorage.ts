import { Platform } from 'react-native';
import { AuthStorage } from './authStorage.types';

// Условный импорт с использованием require для избежания проблем с tree-shaking
// Metro bundler правильно обработает это для web и native платформ
let authStorage: AuthStorage;

try {
  if (Platform.OS === 'web') {
    // На web используем localStorage
    const webModule = require('./authStorage.web');
    authStorage = webModule.webAuthStorage;
  } else {
    // На native используем SecureStore/AsyncStorage
    const nativeModule = require('./authStorage.native');
    authStorage = nativeModule.nativeAuthStorage;
  }
} catch (error) {
  console.error('Ошибка загрузки authStorage:', error);
  // Fallback на базовую реализацию
  authStorage = {
    async setToken() {},
    async getToken() { return null; },
    async removeToken() {},
    async setUser() {},
    async getUser() { return null; },
    async removeUser() {},
    async clear() {},
  };
}

// Проверка, что authStorage инициализирован
if (!authStorage) {
  console.error('authStorage не инициализирован, используется fallback');
  authStorage = {
    async setToken() {},
    async getToken() { return null; },
    async removeToken() {},
    async setUser() {},
    async getUser() { return null; },
    async removeUser() {},
    async clear() {},
  };
}

export { authStorage };

