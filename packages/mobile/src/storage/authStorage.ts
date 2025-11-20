import { Platform } from 'react-native';
import { AuthStorage } from './authStorage.types';

// Условный импорт реализаций в зависимости от платформы
let authStorage: AuthStorage;

if (Platform.OS === 'web') {
  // На web используем localStorage
  authStorage = require('./authStorage.web').webAuthStorage;
} else {
  // На native используем SecureStore/AsyncStorage
  authStorage = require('./authStorage.native').nativeAuthStorage;
}

export { authStorage };

