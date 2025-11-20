# API Клиент - QuickNotes Mobile

Полный модуль API-клиента с автоматическим управлением JWT токенами и поддержкой всех платформ.

## Структура модуля

```
src/
├── services/
│   ├── api.ts          # Базовый axios клиент с interceptors
│   ├── auth.ts         # Функции аутентификации
│   └── notes.ts        # Функции работы с заметками
└── utils/
    └── storage.ts      # Универсальное хранилище токенов
```

## Основные компоненты

### 1. Универсальное хранилище (`src/utils/storage.ts`)

Автоматически выбирает правильное хранилище в зависимости от платформы:
- **Web**: `localStorage`
- **Mobile (iOS/Android)**: `expo-secure-store` (безопасное хранилище)
- **Fallback**: `AsyncStorage` (если SecureStore недоступен)

**Методы:**
- `setToken(token)` - сохранить токен
- `getToken()` - получить токен
- `removeToken()` - удалить токен
- `setUser(user)` - сохранить данные пользователя
- `getUser()` - получить данные пользователя
- `clear()` - очистить все данные

### 2. API Клиент (`src/services/api.ts`)

**Базовый URL:** `http://localhost:4000/api` (захардкожен, потом вынесем в .env)

**Особенности:**
- Автоматическая подстановка JWT токена в заголовки через interceptor
- Обработка ошибок 401 (автоматическая очистка токена)
- Таймаут запросов: 10 секунд
- Типизация TypeScript

### 3. Функции аутентификации (`src/services/auth.ts`)

```typescript
// Регистрация
register(email: string, password: string)
// → POST /auth/register
// → Автоматически сохраняет токен и пользователя

// Вход
login(email: string, password: string)
// → POST /auth/login
// → Автоматически сохраняет токен и пользователя

// Получить текущего пользователя
getMe()
// → GET /auth/me

// Выход
logout()
// → Очищает токен и данные пользователя
```

### 4. Функции заметок (`src/services/notes.ts`)

```typescript
// Получить список заметок
getNotes(includeArchived?: boolean)
// → GET /notes?includeArchived=false

// Получить заметку по ID
getNote(id: string)
// → GET /notes/:id

// Создать заметку
createNote({ title: string, content: string })
// → POST /notes

// Обновить заметку
updateNote(id: string, { title?, content?, isArchived? })
// → PUT /notes/:id

// Удалить заметку
deleteNote(id: string)
// → DELETE /notes/:id
```

## Пример использования

### Пример 1: Экран авторизации

```typescript
import { useMutation } from '@tanstack/react-query';
import { login, register } from '../../src/services/auth';
import { AxiosError } from 'axios';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Вход - токен автоматически сохраняется в login()
  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      // Токен уже сохранен, можно перенаправлять
      router.replace('/(tabs)/notes');
    },
    onError: (error: AxiosError<{ error: string }>) => {
      Alert.alert('Ошибка', error.response?.data?.error || 'Не удалось войти');
    },
  });

  // Регистрация - токен автоматически сохраняется в register()
  const registerMutation = useMutation({
    mutationFn: register,
    onSuccess: () => {
      // Токен уже сохранен, можно перенаправлять
      router.replace('/(tabs)/notes');
    },
  });

  const handleLogin = () => {
    loginMutation.mutate({ email, password });
  };

  return (
    // ... UI компоненты
  );
}
```

### Пример 2: Список заметок

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getNotes, deleteNote } from '../../src/services/notes';

export default function NotesScreen() {
  const queryClient = useQueryClient();

  // Получение списка заметок
  // Токен автоматически добавляется через interceptor
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notes'],
    queryFn: () => getNotes(false), // только активные
  });

  // Удаление заметки
  // Токен автоматически добавляется через interceptor
  const deleteMutation = useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Инвалидируем кеш после удаления
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    // ... UI компоненты
  );
}
```

### Пример 3: Создание/редактирование заметки

```typescript
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createNote, updateNote, getNote } from '../../src/services/notes';

export default function NoteEditScreen({ noteId }: { noteId?: string }) {
  const isNew = !noteId;
  const queryClient = useQueryClient();

  // Загрузка существующей заметки
  const { data: noteData } = useQuery({
    queryKey: ['note', noteId],
    queryFn: () => getNote(noteId!),
    enabled: !isNew,
  });

  // Создание заметки
  const createMutation = useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      router.back();
    },
  });

  // Обновление заметки
  const updateMutation = useMutation({
    mutationFn: (data: { title: string; content: string }) =>
      updateNote(noteId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] });
      queryClient.invalidateQueries({ queryKey: ['note', noteId] });
      router.back();
    },
  });

  const handleSave = (title: string, content: string) => {
    if (isNew) {
      createMutation.mutate({ title, content });
    } else {
      updateMutation.mutate({ title, content });
    }
  };

  return (
    // ... UI компоненты
  );
}
```

## Автоматическая работа с токенами

### Request Interceptor

Автоматически добавляет токен в каждый запрос:

```typescript
api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

Обрабатывает ошибки 401 (истекший токен):

```typescript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.clear();
      // На web можно перенаправить на страницу входа
      if (Platform.OS === 'web') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
```

## Безопасность

- **Mobile**: Использует `expo-secure-store` для безопасного хранения токенов
- **Web**: Использует `localStorage` (стандарт для web приложений)
- **Fallback**: `AsyncStorage` если SecureStore недоступен

## Типизация

Все функции полностью типизированы TypeScript:

```typescript
// Типы ответов API
interface ApiResponse<T> {
  data: T;
}

// Типы для заметок
interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  isArchived: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// Типы для аутентификации
interface AuthResponse {
  user: User;
  accessToken: string;
}
```

## Обработка ошибок

Все ошибки обрабатываются через Axios interceptors и возвращаются в формате:

```typescript
{
  error: string;
  details?: unknown;
}
```

Пример обработки:

```typescript
try {
  await login({ email, password });
} catch (error) {
  if (error instanceof AxiosError) {
    const errorMessage = error.response?.data?.error || 'Произошла ошибка';
    Alert.alert('Ошибка', errorMessage);
  }
}
```

