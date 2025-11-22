import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { config } from '../../config';

// Мокируем config
jest.mock('../../config', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-minimum-32-characters-long',
    },
  },
}));

describe('authMiddleware', () => {
  let mockRequest: Partial<AuthRequest>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it('должен пропускать запрос с валидным токеном', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const token = jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual({ id: userId, email });
    expect(mockNext).toHaveBeenCalled();
    expect(mockResponse.status).not.toHaveBeenCalled();
  });

  it('должен возвращать 401 если токен не предоставлен', () => {
    mockRequest.headers = {};

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Токен доступа не предоставлен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен возвращать 401 если заголовок не начинается с Bearer', () => {
    mockRequest.headers = {
      authorization: 'Invalid token',
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Токен доступа не предоставлен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен возвращать 401 если токен истек', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const token = jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: '-1h' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Токен истек',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен возвращать 401 если токен недействителен', () => {
    mockRequest.headers = {
      authorization: 'Bearer invalid-token',
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Недействительный токен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен извлекать токен из заголовка Authorization', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const token = jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockRequest.user).toEqual({ id: userId, email });
  });

  it('должен устанавливать req.user с данными из токена', () => {
    const userId = 'user-456';
    const email = 'another@example.com';
    const token = jwt.sign({ userId, email }, config.jwt.secret, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockRequest.user).toBeDefined();
    expect(mockRequest.user?.id).toBe(userId);
    expect(mockRequest.user?.email).toBe(email);
  });

  it('должен возвращать 500 если JWT secret не настроен', () => {
    // Мокируем config без secret через Object.defineProperty
    const originalSecret = config.jwt.secret;
    Object.defineProperty(config.jwt, 'secret', {
      get: () => undefined,
      configurable: true,
    });

    const userId = 'user-123';
    const email = 'test@example.com';
    const token = jwt.sign({ userId, email }, 'some-secret', { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Ошибка конфигурации сервера',
    });
    expect(mockNext).not.toHaveBeenCalled();

    // Восстанавливаем config
    Object.defineProperty(config.jwt, 'secret', {
      get: () => originalSecret,
      configurable: true,
    });
  });

  it('должен обрабатывать токен с неправильным форматом payload', () => {
    // Создаем токен с неправильной структурой payload
    const invalidPayload = { wrongField: 'value' };
    const token = jwt.sign(invalidPayload as any, config.jwt.secret, { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    // Должен пройти проверку токена, но req.user может быть некорректным
    // Это зависит от реализации, но обычно должно обработаться
    expect(mockNext).toHaveBeenCalled();
  });

  it('должен обрабатывать пустой токен после Bearer', () => {
    mockRequest.headers = {
      authorization: 'Bearer ',
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Недействительный токен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен обрабатывать токен с неправильным секретом', () => {
    const userId = 'user-123';
    const email = 'test@example.com';
    const token = jwt.sign({ userId, email }, 'wrong-secret', { expiresIn: '7d' });

    mockRequest.headers = {
      authorization: `Bearer ${token}`,
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Недействительный токен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('должен обрабатывать не-JWT токен', () => {
    mockRequest.headers = {
      authorization: 'Bearer not-a-jwt-token-12345',
    };

    authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Недействительный токен',
    });
    expect(mockNext).not.toHaveBeenCalled();
  });
});

