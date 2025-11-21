import { authStorage } from './authStorage';

const TOKEN_KEY = 'accessToken';

/**
 * Получить валидный экземпляр authStorage
 * Гарантирует, что всегда возвращается валидный объект
 */
const getValidAuthStorage = () => {
  // Проверяем, что authStorage существует и имеет нужные методы
  if (authStorage && typeof authStorage.getToken === 'function' && typeof authStorage.setToken === 'function') {
    return authStorage;
  }
  
  // Если authStorage не валиден, создаем fallback реализацию
  console.warn('tokenStorage: authStorage не валиден, используем fallback');
  
  // Fallback для web платформы
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getToken: async () => {
        try {
          return localStorage.getItem(TOKEN_KEY);
        } catch {
          return null;
        }
      },
      setToken: async (token: string) => {
        try {
          localStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
          console.error('tokenStorage fallback: ошибка сохранения токена', error);
          throw error;
        }
      },
      removeToken: async () => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // Игнорируем ошибки
        }
      },
    };
  }
  
  // Fallback для native (пустая реализация)
  return {
    getToken: async () => null,
    setToken: async () => {
      throw new Error('Хранилище токенов недоступно');
    },
    removeToken: async () => {},
  };
};

/**
 * Единый адаптер для работы с токеном
 * Обеспечивает безопасный доступ к authStorage и предотвращает ошибки undefined
 */
export const tokenStorage = {
  /**
   * Получить токен из хранилища
   */
  async getToken(): Promise<string | null> {
    try {
      const storage = getValidAuthStorage();
      return await storage.getToken();
    } catch (error) {
      console.error('tokenStorage: ошибка получения токена', error);
      return null;
    }
  },

  /**
   * Сохранить токен в хранилище
   */
  async setToken(token: string): Promise<void> {
    try {
      const storage = getValidAuthStorage();
      await storage.setToken(token);
    } catch (error) {
      console.error('tokenStorage: ошибка сохранения токена', error);
      throw error;
    }
  },

  /**
   * Удалить токен из хранилища
   */
  async clearToken(): Promise<void> {
    try {
      const storage = getValidAuthStorage();
      if (typeof storage.removeToken === 'function') {
        await storage.removeToken();
      }
    } catch (error) {
      console.error('tokenStorage: ошибка удаления токена', error);
      // Не пробрасываем ошибку, так как очистка должна работать в любом случае
    }
  },
};

