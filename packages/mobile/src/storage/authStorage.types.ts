/**
 * Интерфейс для хранения токенов и данных пользователя
 * Универсальный для всех платформ
 */
export interface AuthStorage {
  /**
   * Сохранить токен доступа
   */
  setToken(token: string): Promise<void>;

  /**
   * Получить токен доступа
   */
  getToken(): Promise<string | null>;

  /**
   * Удалить токен доступа
   */
  removeToken(): Promise<void>;

  /**
   * Сохранить данные пользователя
   */
  setUser(user: object): Promise<void>;

  /**
   * Получить данные пользователя
   */
  getUser(): Promise<object | null>;

  /**
   * Удалить данные пользователя
   */
  removeUser(): Promise<void>;

  /**
   * Очистить все данные (токен и пользователь)
   */
  clear(): Promise<void>;
}

