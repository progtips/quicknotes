import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { sendError } from '../utils/response';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Токен доступа не предоставлен', 401);
      return;
    }

    const token = authHeader.substring(7);

    if (!config.jwt.secret) {
      sendError(res, 'Ошибка конфигурации сервера', 500);
      return;
    }

    const decoded = jwt.verify(token, config.jwt.secret) as { userId: string; email: string };

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      sendError(res, 'Токен истек', 401);
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      sendError(res, 'Недействительный токен', 401);
      return;
    }

    sendError(res, 'Ошибка аутентификации', 500);
  }
};
