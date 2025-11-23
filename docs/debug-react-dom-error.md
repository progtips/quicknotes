# Отчёт: Исправление ошибки React DOM в монорепозитории QuickNotes

## Проблема

При запуске Expo Web возникала ошибка:
```
Cannot read properties of undefined (reading 'S')
at react-dom-client.development.js:25679:58
```

Это указывало на несовместимость версий React/React DOM или конфликт версий в монорепозитории.

## Анализ структуры репозитория

### Expo SDK версия
- **Expo SDK**: 54.0.25 (из `packages/mobile/package.json`)
- **Определено из**: `expo: "^54.0.25"` в dependencies

### Версии ДО изменений

#### `packages/mobile/package.json`:
```json
{
  "expo": "^54.0.25",
  "react": "18.3.1",
  "react-dom": "18.3.1",
  "react-native": "0.76.5",
  "react-native-web": "~0.20.0"
}
```
**Проблемы**:
- `react-native-web: ~0.20.0` - несовместима с Expo SDK 54 (нужна 0.19.12)
- Отсутствует `@expo/metro-runtime` - требуется для Expo SDK 54

#### Корневой `package.json`:
```json
{
  "dependencies": {
    "expo-dev-client": "~6.0.18"
  },
  "overrides": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native-web": "~0.20.0"
  }
}
```
**Проблемы**:
- Использовался `overrides` вместо `pnpm.overrides` (для pnpm workspaces)
- `react-native-web: ~0.20.0` - несовместимая версия

#### `packages/backend/package.json`:
- ✅ Не содержит React зависимостей (чистый Node.js backend)

## Версии ПОСЛЕ изменений

### Совместимые версии для Expo SDK 54:
- **react**: `18.3.1` (официально поддерживается Expo SDK 54)
- **react-dom**: `18.3.1` (должна совпадать с react)
- **react-native**: `0.76.5` (уже была правильная)
- **react-native-web**: `~0.19.12` (совместима с Expo SDK 54)
- **@expo/metro-runtime**: `~4.0.0` (требуется для Expo SDK 54)

### Изменения в `packages/mobile/package.json`:

**Строка 38**: `"expo": "^54.0.25"` → `"expo": "~54.0.0"`
- Зафиксирована версия для стабильности

**Строка 40**: Добавлено `"@expo/metro-runtime": "~4.0.0"`
- Требуется для корректной работы Metro bundler в Expo SDK 54

**Строка 45**: `"react-native-web": "~0.20.0"` → `"react-native-web": "~0.19.12"`
- Исправлена на совместимую версию для Expo SDK 54

**Строки 54-57**: Обновлены `overrides`:
```json
"overrides": {
  "react": "18.3.1",
  "react-dom": "18.3.1"
}
```
- Остались без изменений (уже были правильные)

### Изменения в корневом `package.json`:

**Строки 38-42**: Заменено `overrides` на `pnpm.overrides`:
```json
"pnpm": {
  "overrides": {
    "react": "18.3.1",
    "react-dom": "18.3.1",
    "react-native-web": "~0.19.12"
  }
}
```
- Используется правильный формат для pnpm workspaces
- Обновлена версия `react-native-web` на совместимую

## Сводка изменений

| Файл | Строка | Было | Стало | Причина |
|------|--------|------|-------|---------|
| `packages/mobile/package.json` | 38 | `"expo": "^54.0.25"` | `"expo": "~54.0.0"` | Фиксация версии |
| `packages/mobile/package.json` | 40 | - | `"@expo/metro-runtime": "~4.0.0"` | Требуется для SDK 54 |
| `packages/mobile/package.json` | 45 | `"react-native-web": "~0.20.0"` | `"react-native-web": "~0.19.12"` | Совместимость с SDK 54 |
| `package.json` | 38-42 | `"overrides": {...}` | `"pnpm": { "overrides": {...} }` | Правильный формат для pnpm |

## Дополнительные замечания

### Потенциальные конфликты (не изменены):
1. **@tanstack/react-query**: `^5.17.0` - может требовать React 18+, но совместим
2. **@react-navigation**: Все пакеты используют `^`, что может привести к обновлениям, но обычно совместимы

### Рекомендации:
- После переустановки зависимостей проверить версии через `pnpm list react react-dom react-native-web`
- Использовать `expo-doctor` для проверки совместимости версий
- В будущем использовать `expo install` для установки зависимостей, чтобы автоматически получать совместимые версии

## Ожидаемый результат

После выполнения команд переустановки:
- ✅ Все пакеты будут использовать React 18.3.1
- ✅ Все пакеты будут использовать React DOM 18.3.1
- ✅ `react-native-web` будет версии 0.19.12 (совместима с Expo SDK 54)
- ✅ Metro bundler будет работать корректно с `@expo/metro-runtime`
- ✅ Ошибка "Cannot read properties of undefined (reading 'S')" должна исчезнуть

## Дата исправления
2025-01-23

