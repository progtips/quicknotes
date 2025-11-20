# Настройка Prisma для QuickNotes

## Схема базы данных

Схема определена в `prisma/schema.prisma`:

### Модель User
- `id` - уникальный идентификатор (cuid)
- `email` - email адрес (уникальный)
- `passwordHash` - хеш пароля
- `createdAt` - дата создания
- Связь: один ко многим с Note

### Модель Note
- `id` - уникальный идентификатор (cuid)
- `userId` - внешний ключ к User
- `title` - заголовок заметки
- `content` - содержимое заметки
- `isArchived` - флаг архивации
- `createdAt` - дата создания
- `updatedAt` - дата последнего обновления
- Индексы: по userId и по userId + isArchived

## Настройка переменных окружения

Убедитесь, что в `.env` файле указана строка подключения к PostgreSQL на Neon:

```env
DATABASE_URL="postgresql://user:password@host.neon.tech/database?sslmode=require"
```

## Команды Prisma

### Генерация Prisma Client

```powershell
npm run prisma:generate
```

Эта команда генерирует TypeScript типы на основе схемы Prisma.

### Первичная миграция (создание базы данных)

```powershell
npm run prisma:migrate
```

Или с указанием имени миграции:

```powershell
npx prisma migrate dev --name init
```

Эта команда:
1. Создаст файлы миграции в `prisma/migrations/`
2. Применит миграции к базе данных
3. Автоматически запустит `prisma generate`

### Другие полезные команды

**Открыть Prisma Studio (GUI для просмотра данных):**
```powershell
npm run prisma:studio
```

**Сброс базы данных (осторожно! Удалит все данные):**
```powershell
npm run prisma:reset
```

**Применить существующие миграции (production):**
```powershell
npx prisma migrate deploy
```

## Последовательность действий при первом запуске

1. **Настройте DATABASE_URL в .env**
   ```powershell
   Copy-Item .env.example .env
   # Отредактируйте .env и укажите DATABASE_URL
   ```

2. **Создайте первичную миграцию**
   ```powershell
   npm run prisma:migrate
   ```
   
   При первом запуске Prisma попросит ввести имя миграции. Введите, например: `init`

3. **Проверьте, что Prisma Client сгенерирован**
   ```powershell
   npm run prisma:generate
   ```

4. **Проверьте базу данных через Prisma Studio (опционально)**
   ```powershell
   npm run prisma:studio
   ```

## Скрипты в package.json

Все скрипты Prisma уже настроены:

- `npm run prisma:generate` - генерация Prisma Client
- `npm run prisma:migrate` - создание и применение миграций (dev)
- `npm run prisma:studio` - открыть Prisma Studio
- `npm run prisma:reset` - сброс базы данных

## Структура после миграции

После выполнения миграции будет создана структура:

```
prisma/
├── schema.prisma          # Схема базы данных
└── migrations/            # Папка с миграциями
    └── YYYYMMDDHHMMSS_init/
        └── migration.sql   # SQL миграции
```

