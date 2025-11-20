# Авторизация JWT в QuickNotes Backend

## Обзор

Backend использует JWT (JSON Web Tokens) для аутентификации пользователей. Все маршруты заметок защищены middleware авторизации.

## Роуты аутентификации

### POST /api/auth/register
Регистрация нового пользователя.

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (201):**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### POST /api/auth/login
Вход в систему.

**Запрос:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Ответ (200):**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### GET /api/auth/me
Получение информации о текущем пользователе (требует авторизации).

**Заголовки:**
```
Authorization: Bearer <accessToken>
```

**Ответ (200):**
```json
{
  "user": {
    "id": "clx...",
    "email": "user@example.com"
  }
}
```

## Защищенные маршруты

Все маршруты `/api/notes/*` требуют авторизации через middleware.

**Заголовок для всех запросов:**
```
Authorization: Bearer <accessToken>
```

## Middleware авторизации

`authMiddleware` выполняет следующие действия:

1. Читает заголовок `Authorization: Bearer <token>`
2. Проверяет валидность JWT токена
3. Добавляет в `req.user` объект с данными пользователя:
   ```typescript
   {
     id: string;
     email: string;
   }
   ```

## Конфигурация

### Переменные окружения (.env)

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

- `JWT_SECRET` - секретный ключ для подписи токенов (обязательно)
- `JWT_EXPIRES_IN` - срок жизни токена (по умолчанию 7 дней)

## Безопасность

- Пароли хешируются с помощью `bcrypt` (10 rounds)
- JWT токены содержат `userId` и `email`
- Срок жизни токена: 7 дней
- Все защищенные маршруты проверяют валидность токена

## Пример использования

### Регистрация и получение токена

```powershell
$body = @{
    email = "user@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $body -ContentType "application/json"
$accessToken = $response.accessToken
```

### Использование токена для запросов

```powershell
$headers = @{
    Authorization = "Bearer $accessToken"
}

$notes = Invoke-RestMethod -Uri "http://localhost:3000/api/notes" -Method GET -Headers $headers
```

## Структура кода

- `src/middlewares/auth.ts` - middleware авторизации
- `src/controllers/authController.ts` - контроллеры регистрации и входа
- `src/routes/authRoutes.ts` - маршруты аутентификации
- `src/routes/notesRoutes.ts` - защищенные маршруты заметок

