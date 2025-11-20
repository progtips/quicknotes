import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { notesRoutes } from './routes/notesRoutes';
import { sendSuccess, sendError } from './utils/response';

export const createApp = (): Express => {
  const app = express();

  // Middleware
  app.use(cors(config.cors));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/notes', notesRoutes);

  // 404 handler
  app.use((_req, res) => {
    sendError(res, 'Маршрут не найден', 404);
  });

  // Error handler (должен быть последним)
  app.use(errorHandler);

  return app;
};
