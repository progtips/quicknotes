# Исправление ошибки Expo Web с модулем debug

## Проблема

При запуске Expo Web приложения возникает ошибка, связанная с модулем `debug/src/node.js`, который пытается импортировать Node.js-специфичные модули (например, `tty`), что ломает web-сборку.

## Решение

В файле `metro.config.js` добавлен resolver alias, который принудительно использует браузерную версию модуля `debug` (`debug/src/browser.js`) вместо Node.js версии.

## Изменения

Файл `metro.config.js` был обновлен с добавлением:

```javascript
config.resolver = config.resolver || {};
config.resolver.alias = {
  ...(config.resolver.alias || {}),
  debug: require.resolve('debug/src/browser.js'),
};
```

Это гарантирует, что Metro bundler всегда будет использовать браузерную версию `debug` при сборке для web платформы.

## Как перезапустить проект

После внесения изменений в `metro.config.js` необходимо:

1. **Остановить текущий процесс Expo** (если запущен):
   - Нажмите `Ctrl+C` в терминале, где запущен Expo

2. **Очистить кеш Metro bundler**:
   ```powershell
   cd packages\mobile
   npx expo start --clear
   ```

   Или для web:
   ```powershell
   npx expo start --web --clear
   ```

3. **Альтернативный способ** (полная очистка):
   ```powershell
   # Очистить кеш Metro
   npx expo start --clear
   
   # Или удалить кеш вручную и перезапустить
   Remove-Item -Recurse -Force node_modules\.cache -ErrorAction SilentlyContinue
   npx expo start --web
   ```

## Проверка

После перезапуска приложение должно запускаться на web без ошибок, связанных с модулем `debug`.

## Дополнительная информация

- Этот фикс не влияет на работу приложения на iOS и Android
- Браузерная версия `debug` полностью совместима с web платформой
- Изменения сохраняют всю остальную конфигурацию Expo

