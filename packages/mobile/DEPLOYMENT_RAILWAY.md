# Инструкция по деплою с Railway Backend

## Проблема

Фронтенд все еще обращается к старому URL `https://quicknotes-backend.vercel.app` вместо Railway URL.

## Решение

### 1. Установите переменную окружения в Vercel

**Важно:** Переменная окружения должна быть установлена ДО следующего деплоя.

1. Откройте проект фронтенда в Vercel Dashboard
2. Перейдите в **Settings** → **Environment Variables**
3. Добавьте новую переменную:
   - **Name:** `EXPO_PUBLIC_API_URL`
   - **Value:** `https://quicknotesbackend-production-e224.up.railway.app/api`
   - **Environment:** Выберите все (Production, Preview, Development)

### 2. Пересоберите и задеплойте фронтенд

После установки переменной окружения:

1. **Вариант A: Автоматический деплой (рекомендуется)**
   - Сделайте commit и push изменений в репозиторий
   - Vercel автоматически пересоберет проект с новой переменной окружения

2. **Вариант B: Ручной деплой**
   ```bash
   cd packages/mobile
   npm run build
   # Затем задеплойте dist/ на Vercel
   ```

### 3. Проверьте, что изменения применены

После деплоя проверьте в браузере:

1. Откройте DevTools → Network
2. Попробуйте зарегистрироваться
3. Проверьте, что запросы идут на:
   ```
   https://quicknotesbackend-production-e224.up.railway.app/api/auth/register
   ```
   А НЕ на:
   ```
   https://quicknotes-backend.vercel.app/api/auth/createuser
   ```

### 4. Если проблема сохраняется

Если после деплоя фронтенд все еще обращается к старому URL:

1. **Очистите кэш Vercel:**
   - В Vercel Dashboard → Deployments
   - Найдите последний деплой
   - Нажмите "Redeploy" → "Use existing Build Cache" → **НЕ выбирайте** (чтобы очистить кэш)

2. **Проверьте переменные окружения:**
   - Убедитесь, что `EXPO_PUBLIC_API_URL` установлена для всех окружений
   - Проверьте, что значение правильное (без лишних пробелов, с `/api` в конце)

3. **Проверьте build logs:**
   - В Vercel Dashboard → Deployments → выберите последний деплой
   - Проверьте Build Logs, что переменная окружения видна во время сборки

## Текущая конфигурация

### Файлы с API URL:

1. **`packages/mobile/src/config/api.ts`** (централизованный конфиг)
   ```typescript
   export const API_BASE_URL =
     process.env.EXPO_PUBLIC_API_URL ??
     'https://quicknotesbackend-production-e224.up.railway.app/api';
   ```

2. **`packages/mobile/app.config.ts`** (Expo config)
   - Использует `process.env.EXPO_PUBLIC_API_URL` с fallback на Railway URL

3. **`packages/mobile/src/services/api.ts`** (Axios instance)
   - Импортирует `API_BASE_URL` из `config/api.ts`

### Приоритет получения URL:

1. `process.env.EXPO_PUBLIC_API_URL` (из Vercel Environment Variables)
2. Railway URL как fallback: `https://quicknotesbackend-production-e224.up.railway.app/api`

## Проверка после деплоя

После успешного деплоя:

1. Откройте фронтенд в браузере
2. Откройте DevTools → Console
3. Выполните в консоли:
   ```javascript
   // Проверка, что переменная окружения установлена
   console.log('API URL:', process.env.EXPO_PUBLIC_API_URL);
   ```
4. Проверьте Network tab - все запросы должны идти на Railway URL

## Примечание про `/auth/createuser`

В консоли видно запрос на `/api/auth/createuser`, но в коде используется `/api/auth/register`. Это означает, что используется старая версия фронтенда. После пересборки с правильной переменной окружения это должно исправиться.

