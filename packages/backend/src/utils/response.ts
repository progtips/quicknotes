import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  details?: unknown;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): void => {
  res.status(statusCode).json({ data } as ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 500,
  details?: unknown
): void => {
  res.status(statusCode).json({ error, details } as ApiResponse);
};
