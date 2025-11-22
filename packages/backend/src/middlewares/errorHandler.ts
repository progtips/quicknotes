import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { ApiResponse } from '../utils/response';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

// Список разрешенных origins для CORS
const allowedOrigins = [
  'https://quicknotes-frontend.vercel.app',
  'http://localhost:3000',
  'http://localhost:19006',
];

// Функция для добавления CORS заголовков
const setCorsHeaders = (req: Request, res: Response): void => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  }
};

export const errorHandler = (
  err: AppError | ZodError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Добавляем CORS заголовки даже при ошибках
  setCorsHeaders(req, res);

  // Ошибка валидации Zod
  if (err instanceof ZodError) {
    const response: ApiResponse = {
      error: 'Ошибка валидации',
      details: err.errors.map(e => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    };
    res.status(400).json(response);
    return;
  }

  // Приложение ошибка с кодом статуса
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Внутренняя ошибка сервера';

  // Логирование ошибки в development
  if (process.env.NODE_ENV === 'development') {
    console.error('Ошибка:', err);
  }

  const response: ApiResponse = {
    error: message,
    ...(process.env.NODE_ENV === 'development' && { details: { stack: err.stack } }),
  };

  res.status(statusCode).json(response);
};
