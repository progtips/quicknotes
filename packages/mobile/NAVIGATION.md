# Навигация - QuickNotes Mobile

Приложение использует React Navigation с разделением на AuthStack и AppStack.

## Структура навигации

```
RootNavigator
├── AuthStack (если не авторизован)
│   ├── LoginScreen
│   └── RegisterScreen
└── AppStack (если авторизован)
    ├── MainTabs
    │   ├── Notes (NotesListScreen)
    │   └── Settings (SettingsScreen)
    └── NoteEdit (NoteEditScreen)
```

## Контекст авторизации

Состояние авторизации хранится в `AuthContext` (`src/contexts/AuthContext.tsx`):

- `user` - данные текущего пользователя
- `isLoading` - состояние загрузки
- `isAuthenticated` - флаг авторизации
- `login(email, password)` - функция входа
- `register(email, password)` - функция регистрации
- `logout()` - функция выхода

## Экраны

### AuthStack

#### LoginScreen (`src/screens/auth/LoginScreen.tsx`)
- Поля: email, password
- Кнопка "Войти"
- Переход на RegisterScreen
- После успешного входа автоматически переходит в AppStack

#### RegisterScreen (`src/screens/auth/RegisterScreen.tsx`)
- Поля: email, password, confirmPassword
- Валидация паролей
- Кнопка "Зарегистрироваться"
- Переход на LoginScreen
- После успешной регистрации автоматически переходит в AppStack

### AppStack

#### NotesListScreen (`src/screens/app/NotesListScreen.tsx`)
- Список заметок пользователя
- Фильтр архивных заметок (кнопка переключения)
- Pull-to-refresh для обновления списка
- FAB кнопка для создания новой заметки
- Нажатие на заметку открывает NoteEditScreen

**API вызовы:**
- `getNotes(includeArchived)` - получение списка заметок

#### NoteEditScreen (`src/screens/app/NoteEditScreen.tsx`)
- Поля: title, content
- Переключатель архивации (только для существующих заметок)
- Кнопка "Сохранить"
- Кнопка "Удалить" (только для существующих заметок)

**API вызовы:**
- `getNote(id)` - загрузка заметки (если редактирование)
- `createNote({ title, content })` - создание заметки
- `updateNote(id, { title, content, isArchived })` - обновление заметки
- `deleteNote(id)` - удаление заметки

#### SettingsScreen (`src/screens/app/SettingsScreen.tsx`)
- Отображение email пользователя
- Кнопка "Выйти из аккаунта"
- После выхода автоматически переходит в AuthStack

## Навигация между экранами

### Из AuthStack
```typescript
// Переход на регистрацию
navigation.navigate('Register');

// После успешного входа/регистрации автоматически переходит в AppStack
```

### Из AppStack
```typescript
// Открыть редактирование заметки
navigation.navigate('NoteEdit', { noteId: '123' });

// Создать новую заметку
navigation.navigate('NoteEdit', {});

// Вернуться назад
navigation.goBack();
```

## Автоматическая навигация

`RootNavigator` автоматически переключается между стеками на основе состояния авторизации:

- Если `isAuthenticated === false` → показывается `AuthStack`
- Если `isAuthenticated === true` → показывается `AppStack`

## Типы навигации

Все типы навигации определены в файлах стеков:

- `AuthStackParamList` - параметры AuthStack
- `AppStackParamList` - параметры AppStack
- `MainTabsParamList` - параметры MainTabs

Использование типов:

```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppStackParamList } from '../navigation/AppStack';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

const navigation = useNavigation<NavigationProp>();
navigation.navigate('NoteEdit', { noteId: '123' });
```

