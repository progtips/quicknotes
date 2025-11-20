# Структура проекта QuickNotes

## Общая структура монорепозитория

```
quicknotes/
├── packages/
│   ├── backend/                    # Backend API сервер
│   │   ├── src/
│   │   │   ├── controllers/        # HTTP контроллеры
│   │   │   ├── services/           # Бизнес-логика
│   │   │   ├── middleware/         # Express middleware
│   │   │   ├── routes/             # API маршруты
│   │   │   ├── utils/              # Утилиты (JWT, валидация)
│   │   │   ├── types/              # TypeScript типы
│   │   │   └── app.ts              # Точка входа Express
│   │   ├── prisma/
│   │   │   └── schema.prisma       # Схема базы данных
│   │   ├── .env.example            # Пример переменных окружения
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   │
│   └── mobile/                     # Mobile/Web приложение
│       ├── src/
│       │   ├── screens/            # Экраны приложения
│       │   │   ├── AuthScreen.tsx
│       │   │   ├── NotesListScreen.tsx
│       │   │   ├── NoteEditScreen.tsx
│       │   │   └── NoteDetailScreen.tsx
│       │   ├── components/        # UI компоненты
│       │   │   ├── NoteCard.tsx
│       │   │   ├── Button.tsx
│       │   │   └── Input.tsx
│       │   ├── navigation/        # Навигация
│       │   │   └── AppNavigator.tsx
│       │   ├── services/          # API сервисы
│       │   │   ├── api.ts         # HTTP клиент
│       │   │   ├── auth.ts        # Аутентификация
│       │   │   └── notes.ts       # Заметки
│       │   ├── store/             # Управление состоянием
│       │   │   ├── authStore.ts
│       │   │   └── notesStore.ts
│       │   ├── hooks/             # Custom hooks
│       │   ├── utils/             # Утилиты
│       │   ├── types/             # TypeScript типы
│       │   └── App.tsx            # Корневой компонент
│       ├── assets/                # Изображения, иконки
│       ├── .env.example           # Пример переменных окружения
│       ├── app.json               # Конфигурация Expo
│       ├── package.json
│       ├── tsconfig.json
│       └── README.md
│
├── package.json                   # Корневой package.json (workspaces)
├── .gitignore
├── README.md                      # Основная документация
├── ARCHITECTURE.md                # Детальная архитектура
└── STRUCTURE.md                   # Этот файл
```

## Детальная структура Backend

```
packages/backend/
├── src/
│   ├── controllers/
│   │   ├── authController.ts      # Контроллеры аутентификации
│   │   └── notesController.ts     # Контроллеры заметок
│   │
│   ├── services/
│   │   ├── authService.ts         # Логика аутентификации
│   │   └── notesService.ts       # Логика работы с заметками
│   │
│   ├── middleware/
│   │   ├── auth.ts                # JWT middleware
│   │   ├── validation.ts          # Валидация запросов
│   │   └── errorHandler.ts        # Обработка ошибок
│   │
│   ├── routes/
│   │   ├── authRoutes.ts          # Маршруты аутентификации
│   │   └── notesRoutes.ts         # Маршруты заметок
│   │
│   ├── utils/
│   │   ├── jwt.ts                 # Утилиты JWT
│   │   ├── password.ts            # Хеширование паролей
│   │   └── validation.ts          # Валидация данных
│   │
│   ├── types/
│   │   ├── auth.ts                # Типы аутентификации
│   │   └── notes.ts               # Типы заметок
│   │
│   └── app.ts                     # Инициализация Express
│
├── prisma/
│   ├── schema.prisma              # Схема БД
│   └── migrations/                # Миграции (генерируются)
│
├── dist/                          # Скомпилированный код (генерируется)
├── .env                           # Переменные окружения (не в git)
├── .env.example                   # Пример переменных окружения
├── package.json
├── tsconfig.json
└── README.md
```

## Детальная структура Mobile

```
packages/mobile/
├── src/
│   ├── screens/
│   │   ├── AuthScreen.tsx         # Экран входа/регистрации
│   │   ├── NotesListScreen.tsx    # Список заметок
│   │   ├── NoteEditScreen.tsx     # Редактирование заметки
│   │   └── NoteDetailScreen.tsx   # Просмотр заметки
│   │
│   ├── components/
│   │   ├── NoteCard.tsx           # Карточка заметки
│   │   ├── Button.tsx             # Кнопка
│   │   ├── Input.tsx              # Поле ввода
│   │   └── LoadingSpinner.tsx    # Индикатор загрузки
│   │
│   ├── navigation/
│   │   └── AppNavigator.tsx       # Конфигурация навигации
│   │
│   ├── services/
│   │   ├── api.ts                 # Axios клиент с interceptors
│   │   ├── auth.ts                # API методы аутентификации
│   │   └── notes.ts               # API методы заметок
│   │
│   ├── store/
│   │   ├── authStore.ts           # Состояние аутентификации
│   │   └── notesStore.ts          # Состояние заметок
│   │
│   ├── hooks/
│   │   ├── useAuth.ts             # Hook для аутентификации
│   │   └── useNotes.ts            # Hook для заметок
│   │
│   ├── utils/
│   │   ├── storage.ts             # Работа с AsyncStorage
│   │   └── date.ts                # Форматирование дат
│   │
│   ├── types/
│   │   ├── auth.ts                # Типы аутентификации
│   │   ├── notes.ts               # Типы заметок
│   │   └── api.ts                 # Типы API
│   │
│   └── App.tsx                    # Корневой компонент
│
├── assets/
│   ├── icon.png                   # Иконка приложения
│   ├── splash.png                 # Splash screen
│   ├── adaptive-icon.png          # Android adaptive icon
│   └── favicon.png                # Web favicon
│
├── .env                           # Переменные окружения (не в git)
├── .env.example                   # Пример переменных окружения
├── app.json                       # Конфигурация Expo
├── package.json
├── tsconfig.json
└── README.md
```

## Файлы конфигурации

### Корневой уровень
- `package.json` - Workspaces конфигурация для монорепозитория
- `.gitignore` - Игнорируемые файлы Git
- `README.md` - Основная документация проекта
- `ARCHITECTURE.md` - Детальное описание архитектуры
- `STRUCTURE.md` - Описание структуры проекта

### Backend
- `package.json` - Зависимости и скрипты backend
- `tsconfig.json` - Конфигурация TypeScript компилятора
- `.env.example` - Пример переменных окружения
- `prisma/schema.prisma` - Схема базы данных Prisma

### Mobile
- `package.json` - Зависимости и скрипты mobile приложения
- `tsconfig.json` - Конфигурация TypeScript для React Native
- `app.json` - Конфигурация Expo приложения
- `.env.example` - Пример переменных окружения

## Примечания

- Все `.env` файлы должны быть добавлены в `.gitignore`
- Используйте `.env.example` как шаблон для создания `.env`
- Папка `dist/` в backend генерируется при сборке
- Папка `prisma/migrations/` генерируется Prisma
- Папка `.expo/` в mobile генерируется Expo

