import { createApp } from './app';
import { config } from './config';
import { connectDatabase, disconnectDatabase } from './utils/prisma';

const startServer = async (): Promise<void> => {
  try {
    // Подключение к базе данных
    await connectDatabase();

    // Создание и запуск Express приложения
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🚀 Сервер запущен на порту ${config.port}`);
      console.log(`📝 Окружение: ${config.nodeEnv}`);
      console.log(`🌐 Health check: http://localhost:${config.port}/health`);
      console.log(`📚 API: http://localhost:${config.port}/api`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string): Promise<void> => {
      console.log(`\n${signal} получен, завершение работы сервера...`);
      server.close(async () => {
        console.log('✅ HTTP сервер закрыт');
        await disconnectDatabase();
        console.log('✅ Сервер завершен');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Ошибка запуска сервера:', error);
    await disconnectDatabase();
    process.exit(1);
  }
};

startServer();
