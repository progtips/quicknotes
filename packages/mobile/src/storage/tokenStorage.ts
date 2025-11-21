const TOKEN_KEY = 'accessToken';

/**
 * Создать реализацию хранилища токенов для текущей платформы
 * На web использует localStorage напрямую, на native - пытается использовать authStorage
 */
const createTokenStorageImpl = () => {
  // Для web платформы используем localStorage напрямую
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getToken: async (): Promise<string | null> => {
        try {
          return localStorage.getItem(TOKEN_KEY);
        } catch {
          return null;
        }
      },
      setToken: async (token: string): Promise<void> => {
        try {
          localStorage.setItem(TOKEN_KEY, token);
        } catch (error) {
          console.error('tokenStorage: ошибка сохранения токена', error);
          throw error;
        }
      },
      removeToken: async (): Promise<void> => {
        try {
          localStorage.removeItem(TOKEN_KEY);
        } catch {
          // Игнорируем ошибки
        }
      },
    };
  }
  
  // Для native платформ пытаемся использовать authStorage
  try {
    const authStorageModule = require('./authStorage');
    const authStorage = authStorageModule.authStorage;
    
    if (authStorage && typeof authStorage.getToken === 'function') {
      return {
        getToken: authStorage.getToken.bind(authStorage),
        setToken: authStorage.setToken.bind(authStorage),
        removeToken: authStorage.removeToken.bind(authStorage),
      };
    }
  } catch (error) {
    // Игнорируем ошибки импорта
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

// Создаем реализацию один раз при загрузке модуля
const storageImpl = createTokenStorageImpl();

/**
 * Единый адаптер для работы с токеном
 * Обеспечивает безопасный доступ к хранилищу токенов для всех платформ
 */
export const tokenStorage = {
  /**
   * Получить токен из хранилища
   */
  async getToken(): Promise<string | null> {
    try {
      return await storageImpl.getToken();
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
      await storageImpl.setToken(token);
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
      await storageImpl.removeToken();
    } catch (error) {
      console.error('tokenStorage: ошибка удаления токена', error);
      // Не пробрасываем ошибку, так как очистка должна работать в любом случае
    }
  },
};

