# Финальное исправление ошибки debug/tty для Expo Web

## Проблема

При сборке Expo Web возникает ошибка:
```
The package at `..\..\node_modules\debug\src\node.js` attempted to import the Node standard library module "tty". 
It failed because the native React runtime does not include the Node standard library.
```

## Причина

Модуль `debug` пытается использовать Node.js версию (`debug/src/node.js`), которая импортирует модуль `tty`, недоступный в браузере.

## Решение

Обновлен `metro.config.js` с комплексным подходом:

1. **Alias для debug** - принудительное использование браузерной версии
2. **ResolverMainFields** - приоритет browser полей в package.json
3. **BlockList** - блокировка Node.js версии debug

## Изменения в metro.config.js

### Ключевые улучшения:

1. **Умное определение пути** - автоматически находит `debug/src/browser.js` в:
   - Корневой `node_modules` (монорепо)
   - Локальной `node_modules` (fallback)
   - Через `require.resolve` (последний fallback)

2. **ResolverMainFields** - Metro теперь проверяет поля в следующем порядке:
   - `react-native` (приоритет для RN)
   - `browser` (браузерные версии)
   - `main` (стандартная точка входа)

3. **BlockList** - явно блокирует `debug/src/node.js` от загрузки

## Инструкция по перезапуску

### Важно: Полная очистка кеша

После изменений в `metro.config.js` **обязательно** выполните полную очистку:

```powershell
cd packages\mobile

# Остановите текущий процесс Expo (Ctrl+C)

# Удалите кеш Metro
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue

# Запустите с очисткой кеша
npx expo start --web --clear
```

### Альтернативный способ (если проблемы сохраняются)

```powershell
cd packages\mobile

# Полная очистка всех кешей
Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .expo -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force .metro -ErrorAction SilentlyContinue

# Переустановка зависимостей (опционально, только если ничего не помогает)
# npm install

# Запуск с очисткой
npx expo start --web --clear
```

## Проверка

После перезапуска:

1. ✅ Сборка должна завершиться без ошибок `tty`
2. ✅ В консоли не должно быть ошибок про `debug/src/node.js`
3. ✅ Приложение должно открыться в браузере
4. ✅ Все функции должны работать корректно

## Технические детали

### Почему это работает:

1. **Alias** перехватывает все импорты `debug` и перенаправляет на `browser.js`
2. **ResolverMainFields** помогает Metro выбирать правильные версии модулей
3. **BlockList** предотвращает случайную загрузку Node.js версии

### Безопасность для других платформ:

- ✅ iOS/Android не затронуты - alias работает для всех платформ
- ✅ Браузерная версия debug совместима со всеми платформами
- ✅ Изменения не влияют на функциональность приложения

## Дополнительная информация

Если ошибка все еще возникает:

1. Проверьте, что `node_modules/debug/src/browser.js` существует
2. Убедитесь, что выполнили полную очистку кеша
3. Проверьте версию пакета `debug` в `package.json` (должна поддерживать browser версию)

## Связанные файлы

- `metro.config.js` - основная конфигурация Metro
- `WEB_DEBUG_FIX.md` - предыдущая документация
- `WEB_COMPATIBILITY_REPORT.md` - отчет о совместимости

