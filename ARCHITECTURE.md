# Архитектура QuickNotes

## Обзор системы

QuickNotes - это кроссплатформенный сервис заметок, состоящий из двух основных компонентов:

1. **Backend API** - серверная часть на Node.js + Express + PostgreSQL
2. **Mobile/Web App** - клиентское приложение на React Native + Expo

## Архитектурная диаграмма

```
┌─────────────────────────────────────────────────────────────┐
│                    Клиентские приложения                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │   iOS    │  │ Android  │  │   Web    │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
│       │             │             │                         │
│       └─────────────┼─────────────┘                         │
│                     │                                        │
│         React Native + Expo + React Native Web              │
└─────────────────────┼────────────────────────────────────────┘
                      │
                      │ HTTPS/REST API
                      │
┌─────────────────────┼────────────────────────────────────────┐
│                     │     Backend API                        │
│                     │                                        │
│         ┌───────────▼───────────┐                           │
│         │   Express Server      │                           │
│         │   (Node.js + TS)      │                           │
│         └───────────┬───────────┘                           │
│                     │                                        │
│    ┌────────────────┼────────────────┐                     │
│    │                 │                │                     │
│ ┌──▼──┐        ┌─────▼─────┐    ┌────▼────┐                │
│ │Auth │        │  Notes    │    │  User   │                │
│ │Ctrl │        │  Ctrl     │    │  Ctrl   │                │
│ └──┬──┘        └─────┬─────┘    └────┬────┘                │
│    │                 │                │                     │
│ ┌──▼──┐        ┌─────▼─────┐    ┌────▼────┐                │
│ │Auth │        │  Notes    │    │  User   │                │
│ │Svc  │        │  Service  │    │ Service │                │
│ └──┬──┘        └─────┬─────┘    └────┬────┘                │
│    │                 │                │                     │
│    └─────────────────┼────────────────┘                     │
│                      │                                        │
│              ┌───────▼────────┐                              │
│              │  Prisma ORM    │                              │
│              └───────┬────────┘                              │
│                      │                                        │
└──────────────────────┼────────────────────────────────────────┘
                       │
                       │ SQL
                       │
┌──────────────────────▼────────────────────────────────────────┐
│              PostgreSQL Database (Neon)                      │
│  ┌──────────────┐              ┌──────────────┐            │
│  │    Users     │              │    Notes     │            │
│  │              │              │              │            │
│  │ - id         │              │ - id         │            │
│  │ - email      │◄─────────────│ - userId     │            │
│  │ - password   │              │ - title      │            │
│  │ - timestamps │              │ - content    │            │
│  └──────────────┘              │ - isArchived │            │
│                                │ - timestamps │            │
│                                └──────────────┘            │
└──────────────────────────────────────────────────────────────┘
```

## Компоненты системы

### Backend API

#### Слои архитектуры

1. **Routes Layer** (`src/routes/`)
   - Определение HTTP маршрутов
   - Привязка маршрутов к контроллерам
   - Применение middleware (auth, validation)

2. **Controllers Layer** (`src/controllers/`)
   - Обработка HTTP запросов
   - Валидация входных данных
   - Вызов сервисов
   - Формирование HTTP ответов

3. **Services Layer** (`src/services/`)
   - Бизнес-логика приложения
   - Работа с данными через Prisma
   - Обработка ошибок бизнес-логики

4. **Middleware Layer** (`src/middleware/`)
   - Аутентификация (JWT проверка)
   - Валидация запросов
   - Обработка ошибок
   - Логирование

5. **Utils Layer** (`src/utils/`)
   - Утилиты для JWT
   - Хеширование паролей
   - Валидация данных
   - Вспомогательные функции

#### Поток запроса

```
HTTP Request
    ↓
Express Router
    ↓
Middleware (Auth, Validation)
    ↓
Controller
    ↓
Service (Business Logic)
    ↓
Prisma Client
    ↓
PostgreSQL Database
    ↓
Response ← ← ← ← ← ← ← ← ← ← ← ← ← ← ←
```

### Mobile/Web App

#### Архитектурные слои

1. **Screens Layer** (`src/screens/`)
   - Экраны приложения (UI)
   - Управление состоянием экрана
   - Обработка пользовательских действий

2. **Components Layer** (`src/components/`)
   - Переиспользуемые UI компоненты
   - Компоненты без бизнес-логики

3. **Services Layer** (`src/services/`)
   - API клиенты (HTTP запросы)
   - Работа с AsyncStorage
   - Синхронизация данных

4. **Store Layer** (`src/store/`)
   - Глобальное состояние приложения
   - Управление данными заметок
   - Управление состоянием аутентификации

5. **Navigation Layer** (`src/navigation/`)
   - Конфигурация навигации
   - Защищенные маршруты

#### Поток данных

```
User Action (Screen)
    ↓
Service Call
    ↓
API Request (Axios)
    ↓
Backend API
    ↓
Response
    ↓
Update Store
    ↓
UI Update (Screen)
```

## Аутентификация и безопасность

### Процесс аутентификации

1. **Регистрация**
   ```
   Client → POST /api/auth/register
   Backend → Hash password (bcrypt)
   Backend → Create user in DB
   Backend → Generate JWT token
   Backend → Return token to client
   Client → Store token (AsyncStorage)
   ```

2. **Вход**
   ```
   Client → POST /api/auth/login
   Backend → Verify credentials
   Backend → Generate JWT token
   Backend → Return token to client
   Client → Store token
   ```

3. **Защищенные запросы**
   ```
   Client → Request with JWT in header
   Backend → Verify JWT (middleware)
   Backend → Extract userId from token
   Backend → Process request
   ```

### Безопасность

- Пароли хешируются с помощью bcrypt (10 rounds)
- JWT токены с истечением срока действия (7 дней)
- Валидация всех входных данных (Zod)
- Защита от SQL инъекций через Prisma
- CORS настройки
- HTTPS в production

## Синхронизация данных

### Стратегия синхронизации

1. **При запуске приложения**
   - Проверка наличия токена
   - Загрузка всех заметок с сервера
   - Обновление локального кеша

2. **При создании/изменении**
   - Оптимистичное обновление UI
   - Отправка запроса на сервер
   - Обновление локального кеша при успехе
   - Откат при ошибке

3. **Офлайн режим**
   - Сохранение изменений локально
   - Очередь синхронизации
   - Автоматическая синхронизация при подключении

### Конфликт-резолюция

- Используется `updatedAt` timestamp
- Последнее изменение побеждает (Last Write Wins)
- В будущем можно добавить более сложную логику

## Модель данных

### User
```typescript
{
  id: string (cuid)
  email: string (unique)
  password: string (hashed)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Note
```typescript
{
  id: string (cuid)
  userId: string (FK → User.id)
  title: string
  content: string
  isArchived: boolean
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Design

### RESTful принципы

- Использование HTTP методов (GET, POST, PUT, DELETE, PATCH)
- Ресурс-ориентированные URL
- Стандартные HTTP статус коды
- JSON формат данных

### Примеры запросов

```http
# Регистрация
POST /api/auth/register
Body: { email, password }

# Вход
POST /api/auth/login
Body: { email, password }

# Получить заметки
GET /api/notes
Headers: Authorization: Bearer <token>

# Создать заметку
POST /api/notes
Headers: Authorization: Bearer <token>
Body: { title, content }

# Обновить заметку
PUT /api/notes/:id
Headers: Authorization: Bearer <token>
Body: { title, content }

# Удалить заметку
DELETE /api/notes/:id
Headers: Authorization: Bearer <token>

# Архивировать заметку
PATCH /api/notes/:id/archive
Headers: Authorization: Bearer <token>
Body: { isArchived: true }
```

## Масштабируемость

### Текущая архитектура
- Монолитное backend приложение
- Одна база данных PostgreSQL
- Stateless API серверы

### Будущие улучшения
- Микросервисная архитектура (при необходимости)
- Кеширование (Redis)
- CDN для статических ресурсов
- Горизонтальное масштабирование API
- Репликация базы данных

## Мониторинг и логирование

### Рекомендации для production
- Логирование всех запросов
- Мониторинг ошибок (Sentry)
- Метрики производительности
- Health check endpoints
- Логирование базы данных

## Развертывание

### Backend
- Node.js сервер (Vercel, Railway, Heroku)
- PostgreSQL на Neon
- Переменные окружения для конфигурации

### Mobile App
- iOS: App Store через EAS Build
- Android: Google Play через EAS Build
- Web: Статический хостинг (Vercel, Netlify)

