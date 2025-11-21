# Поддержка Web платформы

Этот документ описывает особенности работы приложения на web платформе.

## Кроссплатформенные компоненты

Приложение использует стандартные React Native компоненты, которые работают на всех платформах:
- `View`, `Text`, `TextInput`, `TouchableOpacity` - базовые компоненты
- `FlatList`, `ScrollView` - списки и прокрутка
- `ActivityIndicator` - индикатор загрузки
- `Alert` - диалоги (на web использует `window.alert`)

## Навигация

- **React Navigation** полностью поддерживает web платформу
- `BottomTabNavigator` настроен для корректной работы на web
- Все экраны работают одинаково на всех платформах

## Хранение данных

### AuthStorage

Используется универсальный слой `authStorage` с разделением реализаций:

- **Web**: `localStorage` браузера
- **Native**: `SecureStore` (iOS/Android) с fallback на `AsyncStorage`

```typescript
import { authStorage } from './storage/authStorage';

// Использование одинаково на всех платформах
await authStorage.setToken(token);
const token = await authStorage.getToken();
```

## Стили

Стили адаптированы для web платформы:

- Используется `Platform.select()` для платформо-специфичных стилей
- Web-специфичные свойства (например, `boxShadow`, `cursor`) применяются только на web
- `elevation` (Android) и `shadow` (iOS) заменяются на `boxShadow` на web

## API клиент

- Axios работает на всех платформах
- Автоматическая подстановка JWT токена через interceptors
- Обработка ошибок 401 с очисткой токена и перенаправлением на web

## Запуск на web

```bash
cd packages/mobile
npx expo start --web
```

Приложение будет доступно по адресу `http://localhost:8082` (или другому порту, указанному Expo).

## Известные ограничения

1. **SecureStore** недоступен на web - используется `localStorage`
2. **Native модули** не работают на web - все модули проверяются на доступность перед использованием
3. **Некоторые React Native компоненты** могут иметь ограниченную функциональность на web

## Проверка кроссплатформенности

Все компоненты протестированы на:
- ✅ Web (Chrome, Firefox, Safari)
- ✅ iOS (симулятор и устройство)
- ✅ Android (эмулятор и устройство)

