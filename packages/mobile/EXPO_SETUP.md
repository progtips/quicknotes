# Настройка Expo для доступа через expo.dev

## Шаг 1: Авторизация в Expo

Откройте терминал PowerShell и выполните:

```powershell
cd C:\Work\quicknotes\packages\mobile
npx expo login
```

Введите:
- **Email** или **username** от аккаунта Expo
- **Пароль**

Если у вас нет аккаунта, создайте его на [expo.dev](https://expo.dev/signup)

## Шаг 2: Запуск с туннелем

После успешной авторизации запустите:

```powershell
npm run start:tunnel
```

или

```powershell
npx expo start --tunnel
```

## Что произойдет:

1. ✅ Expo создаст публичный туннель через expo.dev
2. ✅ В терминале появится QR-код
3. ✅ Появится ссылка вида: `exp://u.expo.dev/...`
4. ✅ Эту ссылку можно открыть на любом устройстве через Expo Go

## Альтернатива: Локальный запуск

Если туннель не нужен (работаете в одной сети):

```powershell
npm start
```

QR-код будет работать только в локальной сети Wi-Fi.

## Проверка авторизации

Проверить, авторизованы ли вы:

```powershell
npx expo whoami
```

Выйти из аккаунта:

```powershell
npx expo logout
```

## Полезные ссылки

- [Expo.dev Dashboard](https://expo.dev)
- [Документация Expo](https://docs.expo.dev)
- [Expo Go для iOS](https://apps.apple.com/app/expo-go/id982107779)
- [Expo Go для Android](https://play.google.com/store/apps/details?id=host.exp.exponent)

