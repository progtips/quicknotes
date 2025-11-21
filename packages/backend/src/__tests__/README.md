# Тесты Backend

Этот документ описывает структуру и запуск тестов для backend приложения.

## Структура тестов

```
src/__tests__/
├── setup.ts                    # Настройка тестового окружения
├── helpers/
│   ├── prisma.mock.ts         # Мок для Prisma Client
│   └── test-helpers.ts        # Вспомогательные функции
├── controllers/
│   └── notesController.test.ts # Тесты контроллера заметок
└── middlewares/
    └── auth.test.ts            # Тесты auth middleware
```

## Запуск тестов

```powershell
# Запуск всех тестов
npm test

# Запуск в watch режиме
npm run test:watch

# Запуск с покрытием кода
npm run test:coverage
```

## Типы тестов

### Юнит-тесты

- **`notesController.test.ts`** - Тесты логики контроллера заметок:
  - Создание заметок
  - Получение списка заметок с фильтрацией
  - Обновление заметок
  - Удаление заметок
  - Фильтрация по userId
  - Валидация данных

- **`auth.test.ts`** - Тесты auth middleware:
  - Проверка валидного токена
  - Обработка отсутствующего токена
  - Обработка истекшего токена
  - Обработка недействительного токена

## Моки

Тесты используют моки для:
- **Prisma Client** - для изоляции тестов от базы данных
- **JWT** - для тестирования токенов
- **Express Request/Response** - для тестирования middleware и контроллеров

## Покрытие кода

После запуска `npm run test:coverage` отчет будет доступен в:
- `coverage/lcov-report/index.html` - HTML отчет
- `coverage/lcov.info` - LCOV формат для CI/CD

## Добавление новых тестов

1. Создайте файл `*.test.ts` в соответствующей директории
2. Используйте моки из `helpers/`
3. Следуйте структуре существующих тестов
4. Запустите тесты для проверки

## Пример теста

```typescript
import { someFunction } from '../../controllers/someController';
import { createMockPrisma } from '../helpers/prisma.mock';

describe('SomeController', () => {
  it('должен выполнять действие', async () => {
    // Arrange
    const mockData = { /* ... */ };
    
    // Act
    const result = await someFunction(mockData);
    
    // Assert
    expect(result).toBeDefined();
  });
});
```

