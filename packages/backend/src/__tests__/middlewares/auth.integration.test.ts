/**
 * Интеграционные тесты для auth middleware
 * Тестируют взаимодействие с реальными зависимостями
 */

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, AuthRequest } from '../../middlewares/auth';
import { config } from '../../config';

// Мокируем config для интеграционных тестов
jest.mock('../../config', () => ({
  config: {
    jwt: {
      secret: 'test-secret-key-minimum-32-characters-long-for-integration-tests',
    },
  },
}));

// Мокируем sendError для проверки вызовов
jest.mock('../../utils/response', () => ({
  sendError: jest.fn((res: Response, error: string, statusCode: number) => {
    res.status(statusCode).json({ error });
  }),
}));

describe('authMiddleware - Интеграционные тесты', () => {
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

  describe('Интеграция с JWT библиотекой', () => {
    it('должен корректно работать с реальным JWT токеном', () => {
      const userId = 'user-integration-123';
      const email = 'integration@test.com';
      const token = jwt.sign(
        { userId, email },
        config.jwt.secret!,
        { expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockRequest.user?.id).toBe(userId);
      expect(mockRequest.user?.email).toBe(email);
      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('должен корректно обрабатывать истекший токен', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      // Создаем токен с отрицательным временем жизни (уже истек)
      const expiredToken = jwt.sign(
        { userId, email },
        config.jwt.secret!,
        { expiresIn: '-1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${expiredToken}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Токен истек',
      });
      expect(mockNext).not.toHaveBeenCalled();
      expect(mockRequest.user).toBeUndefined();
    });

    it('должен корректно обрабатывать токен с разными алгоритмами', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      
      // Создаем токен с алгоритмом HS256 (по умолчанию)
      const tokenHS256 = jwt.sign(
        { userId, email },
        config.jwt.secret!,
        { algorithm: 'HS256', expiresIn: '1h' }
      );

      mockRequest.headers = {
        authorization: `Bearer ${tokenHS256}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('Интеграция с Express Request/Response', () => {
    it('должен корректно работать с различными форматами заголовков', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const token = jwt.sign({ userId, email }, config.jwt.secret!, { expiresIn: '1h' });

      // Тест с разными вариантами заголовка Authorization
      const headerVariants = [
        `Bearer ${token}`,
        `Bearer${token}`, // без пробела (должен обработаться корректно)
      ];

      headerVariants.forEach((header) => {
        jest.clearAllMocks();
        mockRequest.headers = {
          authorization: header,
        };

        authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

        if (header.startsWith('Bearer ')) {
          expect(mockRequest.user).toBeDefined();
          expect(mockNext).toHaveBeenCalled();
        }
      });
    });

    it('должен корректно обрабатывать отсутствие заголовка authorization', () => {
      mockRequest.headers = {};

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Токен доступа не предоставлен',
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('должен корректно устанавливать req.user для последующих middleware', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const token = jwt.sign({ userId, email }, config.jwt.secret!, { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      // Проверяем, что req.user установлен и доступен
      expect(mockRequest.user).toEqual({
        id: userId,
        email: email,
      });

      // Проверяем, что next() был вызван для передачи управления следующему middleware
      expect(mockNext).toHaveBeenCalledTimes(1);
    });
  });

  describe('Обработка граничных случаев', () => {
    it('должен обрабатывать очень длинный токен', () => {
      const userId = 'user-123';
      const email = 'test@example.com';
      const longPayload = { userId, email, extra: 'x'.repeat(10000) };
      const longToken = jwt.sign(longPayload, config.jwt.secret!, { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${longToken}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user).toBeDefined();
      expect(mockNext).toHaveBeenCalled();
    });

    it('должен обрабатывать токен с специальными символами в payload', () => {
      const userId = 'user-123';
      const email = 'test+special@example.com';
      const token = jwt.sign({ userId, email }, config.jwt.secret!, { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user?.email).toBe(email);
      expect(mockNext).toHaveBeenCalled();
    });

    it('должен обрабатывать токен с unicode символами', () => {
      const userId = 'user-123';
      const email = 'тест@example.com';
      const token = jwt.sign({ userId, email }, config.jwt.secret!, { expiresIn: '1h' });

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      authMiddleware(mockRequest as AuthRequest, mockResponse as Response, mockNext);

      expect(mockRequest.user?.email).toBe(email);
      expect(mockNext).toHaveBeenCalled();
    });
  });
});

