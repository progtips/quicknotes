import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config';
import { errorHandler } from './middlewares/errorHandler';
import { authRoutes } from './routes/authRoutes';
import { notesRoutes } from './routes/notesRoutes';
import { sendSuccess, sendError } from './utils/response';

export const createApp = (): Express => {
  const app = express();

  // CORS Configuration - должно быть ПЕРВЫМ middleware
  const allowedOrigins = [
    'https://quicknotes-rust-gamma.vercel.app',
    'http://localhost:3000',
    'http://localhost:19006',
  ];

  // CORS middleware с явной обработкой preflight
  const corsOptions = {
    origin(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      // Разрешаем запросы без origin (например, мобильные приложения, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24 часа для preflight cache
  };

  app.use(cors(corsOptions));

  // Явная обработка preflight запросов для всех маршрутов
  app.options('*', (req, res) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
      res.header('Access-Control-Allow-Credentials', 'true');
      res.header('Access-Control-Max-Age', '86400');
    }
    res.sendStatus(204);
  });

  // Middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Root route
  app.get('/', (_req, res) => {
    sendSuccess(res, {
      message: 'QuickNotes API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        notes: '/api/notes',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Health check
  app.get('/health', (_req, res) => {
    sendSuccess(res, { status: 'ok', timestamp: new Date().toISOString() });
  });

  // API info
  app.get('/api', (_req, res) => {
    sendSuccess(res, {
      message: 'QuickNotes API',
      version: '1.0.0',
      endpoints: {
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          me: 'GET /api/auth/me',
        },
        notes: {
          list: 'GET /api/notes',
          get: 'GET /api/notes/:id',
          create: 'POST /api/notes',
          update: 'PUT /api/notes/:id',
          delete: 'DELETE /api/notes/:id',
        },
      },
    });
  });

  // Routes
  app.use('/api/auth', authRoutes);
  app.use('/api/notes', notesRoutes);

  // 404 handler с CORS заголовками
  app.use((req, res) => {
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Access-Control-Allow-Credentials', 'true');
    }
    sendError(res, 'Маршрут не найден', 404);
  });

  // Error handler (должен быть последним)
  app.use(errorHandler);

  return app;
};
