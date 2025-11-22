# Команды для сборки QuickNotes

Быстрая шпаргалка по командам для сборки и деплоя.

## 🚀 Разработка

```powershell
# Запуск dev сервера
npm start

# Запуск на конкретной платформе
npm run web          # Web браузер
npm run android      # Android
npm run ios          # iOS (только macOS)

# Запуск с туннелем (для доступа через expo.dev)
npm run start:tunnel
```

## 🌐 Web версия

### Локальная разработка
```powershell
npm run web
```

### Production сборка
```powershell
# Установить переменные окружения
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend.com/api"
$env:NODE_ENV="production"

# Собрать
npm run build:web

# Результат в web-build/
```

### Деплой на Vercel
```powershell
cd web-build
vercel --prod
```

### Деплой на Netlify
```powershell
cd web-build
netlify deploy --prod --dir=.
```

## 📱 Android

### Требования
```powershell
# Установить EAS CLI
npm install -g eas-cli

# Авторизоваться
eas login
```

### Сборка APK (для тестирования)
```powershell
npm run build:android:preview
# или
eas build --platform android --profile preview
```

### Сборка AAB (для Google Play)
```powershell
npm run build:android
# или
eas build --platform android --profile production
```

### Загрузка в Google Play
```powershell
npm run submit:android
# или
eas submit --platform android
```

## 🍎 iOS

### Требования
- macOS
- Apple Developer Account ($99/год)
- EAS CLI установлен и авторизован

### Сборка для тестирования
```powershell
npm run build:ios:preview
# или
eas build --platform ios --profile preview
```

### Сборка для App Store
```powershell
npm run build:ios
# или
eas build --platform ios --profile production
```

### Загрузка в App Store
```powershell
npm run submit:ios
# или
eas submit --platform ios
```

## 🔐 Переменные окружения для Production

### Для сборки через EAS Build

```powershell
# Установить секреты в EAS
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "https://your-backend.com/api"
```

### Для локальной сборки Web

```powershell
# PowerShell
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend.com/api"
$env:NODE_ENV="production"
npm run build:web
```

## 📋 Чек-лист перед сборкой

- [ ] Переменные окружения настроены
- [ ] Backend доступен по публичному URL
- [ ] Версия приложения обновлена в `app.json`
- [ ] Иконки и splash screen настроены
- [ ] Bundle ID / Package name уникальны

## 📚 Подробная документация

- [README.md](./README.md) - Полная документация
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Подробные инструкции по деплою

