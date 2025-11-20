# Универсальный слой хранения токенов (AuthStorage)

Этот модуль предоставляет кроссплатформенный интерфейс для хранения токенов аутентификации и данных пользователя.

## Архитектура

- **`authStorage.types.ts`** - Определяет интерфейс `AuthStorage`
- **`authStorage.web.ts`** - Реализация для Web платформы (использует `localStorage`)
- **`authStorage.native.ts`** - Реализация для Native платформ (использует `SecureStore` с fallback на `AsyncStorage`)
- **`authStorage.ts`** - Экспортирует правильную реализацию в зависимости от платформы

## Использование

```typescript
import { authStorage } from '../storage/authStorage';

// Сохранить токен
await authStorage.setToken('your-jwt-token');

// Получить токен
const token = await authStorage.getToken();

// Сохранить данные пользователя
await authStorage.setUser({ id: '1', email: 'user@example.com' });

// Получить данные пользователя
const user = await authStorage.getUser();

// Очистить все данные
await authStorage.clear();
```

## Особенности реализации

### Web платформа
- Использует `localStorage` браузера
- Все операции синхронные (но интерфейс асинхронный для совместимости)
- Проверяет наличие `window.localStorage` перед использованием

### Native платформа (iOS/Android)
- Использует `SecureStore` для безопасного хранения токенов
- Fallback на `AsyncStorage` если `SecureStore` недоступен
- Динамический импорт `SecureStore` для избежания проблем на web

## Обратная совместимость

Старый модуль `src/utils/storage.ts` экспортирует `tokenStorage`, который является алиасом для `authStorage`. Это обеспечивает обратную совместимость с существующим кодом.

