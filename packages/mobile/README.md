# Mobile/Web App - QuickNotes

Кроссплатформенное приложение QuickNotes для iOS, Android и Web, построенное на React Native, Expo и React Native Web.

## Технологии

- **React Native** - фреймворк для мобильных приложений
- **Expo** - инструменты и сервисы для разработки
- **React Native Web** - поддержка веб-платформы
- **TypeScript** - типизация
- **React Navigation** - навигация
- **AsyncStorage** - локальное хранилище
- **Axios** - HTTP клиент для API запросов

## Структура проекта

```
mobile/
├── src/
│   ├── screens/         # Экраны приложения
│   │   ├── AuthScreen.tsx
│   │   ├── NotesListScreen.tsx
│   │   ├── NoteEditScreen.tsx
│   │   └── NoteDetailScreen.tsx
│   ├── components/      # Переиспользуемые компоненты
│   │   ├── NoteCard.tsx
│   │   ├── Button.tsx
│   │   └── Input.tsx
│   ├── navigation/      # Конфигурация навигации
│   │   └── AppNavigator.tsx
│   ├── services/        # API сервисы
│   │   ├── api.ts       # HTTP клиент
│   │   ├── auth.ts      # Аутентификация
│   │   └── notes.ts     # Работа с заметками
│   ├── store/           # Управление состоянием
│   │   ├── authStore.ts
│   │   └── notesStore.ts
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Утилиты
│   ├── types/           # TypeScript типы
│   └── App.tsx          # Корневой компонент
├── app.json             # Конфигурация Expo
├── package.json
└── tsconfig.json
```

## Установка

```powershell
# Установка зависимостей
npm install

# Настройка переменных окружения
# Создайте .env файл с API_URL
```

## Запуск

```powershell
# Запуск на всех платформах (интерактивное меню)
npm start

# Запуск на конкретной платформе
npm run android      # Android эмулятор/устройство
npm run ios          # iOS симулятор (требует macOS)
npm run web          # Веб-браузер

# Разработка
npm run dev
```

## Переменные окружения

Создайте файл `.env`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

## Функциональность

### Аутентификация
- Регистрация нового пользователя
- Вход в систему
- Сохранение JWT токена
- Автоматический вход при наличии сохраненного токена

### Заметки
- Просмотр списка заметок
- Создание новой заметки
- Редактирование заметки
- Удаление заметки
- Архивирование заметок
- Синхронизация с сервером

### Синхронизация
- Автоматическая синхронизация при запуске приложения
- Синхронизация при создании/изменении/удалении
- Офлайн режим с локальным кешем

## Сборка

```powershell
# Сборка для Android
npm run build:android

# Сборка для iOS
npm run build:ios

# Сборка для Web
npm run build:web
```

## Разработка

Приложение использует Expo для разработки. Убедитесь, что:
1. Backend сервер запущен и доступен
2. Указан правильный `EXPO_PUBLIC_API_URL` в `.env`
3. Для тестирования на реальных устройствах используйте Expo Go или соберите standalone приложение

