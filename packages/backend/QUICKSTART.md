# Быстрый старт Backend

## Установка зависимостей

```powershell
npm install
```

## Настройка переменных окружения

```powershell
Copy-Item .env.example .env
```

Отредактируйте `.env` и укажите:
- `DATABASE_URL` - строка подключения к PostgreSQL (Neon)
- `JWT_SECRET` - секретный ключ для JWT токенов
- `PORT` - порт сервера (по умолчанию 3000)

## Настройка базы данных

```powershell
# Генерация Prisma Client
npm run prisma:generate

# Применение миграций
npm run prisma:migrate
```

## Запуск

### Режим разработки (с hot-reload)

```powershell
npm run dev
```

Сервер запустится на `http://localhost:3000`

### Production сборка

```powershell
# Сборка проекта
npm run build

# Запуск собранного проекта
npm start
```

## Скрипты

- `npm run dev` - запуск в режиме разработки (tsx watch)
- `npm run build` - сборка проекта через tsup
- `npm start` - запуск собранного проекта
- `npm run lint` - проверка кода через ESLint
- `npm run lint:fix` - автоматическое исправление ошибок ESLint
- `npm run format` - форматирование кода через Prettier
- `npm run format:check` - проверка форматирования

## API Endpoints

### Health Check
- `GET /health` - проверка работоспособности сервера

### Аутентификация
- `POST /api/auth/register` - регистрация пользователя
- `POST /api/auth/login` - вход в систему
- `GET /api/auth/me` - получение текущего пользователя (требует JWT)

### Заметки (требуют JWT)
- `GET /api/notes` - список заметок
- `GET /api/notes/:id` - получение заметки по ID
- `POST /api/notes` - создание заметки
- `PUT /api/notes/:id` - обновление заметки
- `DELETE /api/notes/:id` - удаление заметки
- `PATCH /api/notes/:id/archive` - архивирование/разархивирование

## Структура проекта

```
src/
├── app.ts              # Конфигурация Express приложения
├── server.ts           # Точка входа, запуск сервера
├── config/             # Конфигурация (переменные окружения)
├── routes/             # Маршруты API
├── controllers/        # Контроллеры (обработка запросов)
├── middlewares/        # Middleware (auth, errorHandler)
├── services/           # Бизнес-логика (пока не используется)
├── utils/              # Утилиты (пока не используется)
└── types/              # TypeScript типы (пока не используется)
```

## Тестирование API

### Регистрация пользователя

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
```

### Вход в систему

```powershell
$body = @{
    email = "test@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $body -ContentType "application/json"
$token = $response.token
```

### Создание заметки

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

$body = @{
    title = "Моя первая заметка"
    content = "Содержимое заметки"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/notes" -Method POST -Body $body -ContentType "application/json" -Headers $headers
```

