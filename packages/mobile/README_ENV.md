# Конфигурация окружений

Этот документ описывает настройку переменных окружения для Expo приложения.

## Структура

- **`app.config.ts`** - Конфигурация Expo с поддержкой переменных окружения
- **`src/config/index.ts`** - Модуль для доступа к конфигурации в runtime
- **`.env.example`** - Пример файла с переменными окружения

## Переменные окружения

### Для разработки (development)

По умолчанию используется `http://localhost:4000/api` если переменная не задана.

```bash
NODE_ENV=development
EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api
```

### Для продакшена (production)

```bash
NODE_ENV=production
EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/api
```

## Использование

### В коде приложения

```typescript
import { API_BASE_URL, isDev, isProd } from './config';

// Использование базового URL API
console.log('API URL:', API_BASE_URL);

// Проверка окружения
if (isDev) {
  console.log('Режим разработки');
}

if (isProd) {
  console.log('Продакшен режим');
}
```

### Настройка для разных окружений

1. **Локальная разработка:**
   - Создайте файл `.env` в корне `packages/mobile`
   - Установите `EXPO_PUBLIC_API_BASE_URL=http://localhost:4000/api`

2. **Продакшен:**
   - Установите переменную окружения `EXPO_PUBLIC_API_BASE_URL=https://your-domain.com/api`
   - Или используйте EAS Build secrets для переменных окружения

## Важные замечания

- Переменные с префиксом `EXPO_PUBLIC_` доступны в клиентском коде
- Переменные без префикса `EXPO_PUBLIC_` доступны только в `app.config.ts`
- После изменения переменных окружения перезапустите Expo dev server
- Для продакшена используйте EAS Build secrets или переменные окружения CI/CD

## Примеры использования

### В API клиенте

```typescript
import { API_BASE_URL } from '../config';
import axios from 'axios';

const api = axios.create({
  baseURL: API_BASE_URL,
});
```

### Условная логика по окружению

```typescript
import { isDev, isProd } from '../config';

if (isDev) {
  // Логирование только в разработке
  console.log('Debug info');
}

if (isProd) {
  // Аналитика только в продакшене
  analytics.init();
}
```

