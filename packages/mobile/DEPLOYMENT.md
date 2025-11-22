# Руководство по деплою QuickNotes

Этот документ содержит подробные инструкции по деплою всех компонентов приложения QuickNotes.

## 📋 Содержание

- [Backend (Node.js хостинг)](#backend-nodejs-хостинг)
- [Web версия (Vercel/Netlify)](#web-версия-vercelnetlify)
- [Mobile версии (App Stores)](#mobile-версии-app-stores)

---

## 🖥 Backend (Node.js хостинг)

### Вариант 1: Railway (Рекомендуется)

Railway - простой и быстрый способ деплоя Node.js приложений.

#### Шаг 1: Установка Railway CLI

```powershell
npm install -g @railway/cli
```

#### Шаг 2: Авторизация

```powershell
railway login
```

#### Шаг 3: Инициализация проекта

```powershell
cd packages/backend
railway init
```

#### Шаг 4: Настройка переменных окружения

В Railway Dashboard или через CLI:

```powershell
railway variables set DATABASE_URL=your_postgres_url
railway variables set JWT_SECRET=your_jwt_secret
railway variables set PORT=4000
railway variables set NODE_ENV=production
```

#### Шаг 5: Настройка базы данных

**Вариант A: Railway PostgreSQL (рекомендуется)**

```powershell
# Добавить PostgreSQL в Railway проект
railway add postgresql

# Получить DATABASE_URL автоматически
railway variables
```

**Вариант B: Внешняя база данных**

Используйте любой PostgreSQL хостинг:
- [Supabase](https://supabase.com) (бесплатный план)
- [Neon](https://neon.tech) (бесплатный план)
- [ElephantSQL](https://www.elephantsql.com) (бесплатный план)

#### Шаг 6: Применение миграций

```powershell
# В Railway Dashboard добавьте команду для деплоя:
# npm run prisma:generate && npm run prisma:migrate deploy && npm start
```

Или через CLI:

```powershell
railway run npm run prisma:generate
railway run npm run prisma:migrate deploy
```

#### Шаг 7: Деплой

```powershell
railway up
```

Railway автоматически:
- Определит Node.js проект
- Установит зависимости
- Запустит `npm start`
- Предоставит публичный URL

#### Шаг 8: Получение URL

```powershell
railway domain
```

Или в Railway Dashboard найдите URL вашего сервиса.

---

### Вариант 2: Render

Render предоставляет бесплатный план для Node.js приложений.

#### Шаг 1: Создание Web Service

1. Зайдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите ваш GitHub репозиторий

#### Шаг 2: Настройка

**Build Command:**
```bash
cd packages/backend && npm install && npm run build
```

**Start Command:**
```bash
cd packages/backend && npm start
```

**Root Directory:**
```
packages/backend
```

#### Шаг 3: Переменные окружения

В Render Dashboard добавьте:
```
DATABASE_URL=your_postgres_url
JWT_SECRET=your_jwt_secret
NODE_ENV=production
PORT=4000
```

#### Шаг 4: База данных

1. Создайте PostgreSQL базу данных в Render
2. Скопируйте `DATABASE_URL` из настроек базы
3. Добавьте в переменные окружения

#### Шаг 5: Применение миграций

Добавьте в Build Command:

```bash
cd packages/backend && npm install && npm run build && npm run prisma:generate && npm run prisma:migrate deploy
```

---

### Вариант 3: Heroku

#### Шаг 1: Установка Heroku CLI

```powershell
# Скачайте и установите с https://devcenter.heroku.com/articles/heroku-cli
```

#### Шаг 2: Авторизация

```powershell
heroku login
```

#### Шаг 3: Создание приложения

```powershell
cd packages/backend
heroku create your-app-name
```

#### Шаг 4: Добавление PostgreSQL

```powershell
heroku addons:create heroku-postgresql:mini
```

#### Шаг 5: Переменные окружения

```powershell
heroku config:set JWT_SECRET=your_jwt_secret
heroku config:set NODE_ENV=production
```

#### Шаг 6: Procfile

Создайте файл `Procfile` в `packages/backend/`:

```
web: npm start
release: npm run prisma:generate && npm run prisma:migrate deploy
```

#### Шаг 7: Деплой

```powershell
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

### Вариант 4: DigitalOcean App Platform

#### Шаг 1: Создание App

1. Зайдите на [DigitalOcean](https://www.digitalocean.com)
2. Создайте новый App
3. Подключите GitHub репозиторий

#### Шаг 2: Настройка

**Build Command:**
```bash
cd packages/backend && npm install && npm run build
```

**Run Command:**
```bash
cd packages/backend && npm start
```

**Source Directory:** `packages/backend`

#### Шаг 3: База данных

1. Добавьте PostgreSQL компонент
2. Настройте переменные окружения

---

### Вариант 5: AWS Elastic Beanstalk

#### Шаг 1: Установка EB CLI

```powershell
pip install awsebcli
```

#### Шаг 2: Инициализация

```powershell
cd packages/backend
eb init
```

#### Шаг 3: Создание окружения

```powershell
eb create production
```

#### Шаг 4: Настройка переменных окружения

```powershell
eb setenv DATABASE_URL=your_postgres_url JWT_SECRET=your_jwt_secret NODE_ENV=production
```

#### Шаг 5: Деплой

```powershell
eb deploy
```

---

## 🌐 Web версия (Vercel/Netlify)

### Вариант 1: Vercel (Рекомендуется)

Vercel отлично подходит для статических сайтов и имеет отличную интеграцию с Git.

#### Шаг 1: Установка Vercel CLI

```powershell
npm install -g vercel
```

#### Шаг 2: Авторизация

```powershell
vercel login
```

#### Шаг 3: Сборка проекта

```powershell
cd packages/mobile

# Установить переменные окружения для production
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend-domain.com/api"
$env:NODE_ENV="production"

# Собрать web версию
npm run build:web
```

#### Шаг 4: Деплой

```powershell
cd web-build
vercel --prod
```

Или через веб-интерфейс:

1. Зайдите на [vercel.com](https://vercel.com)
2. Импортируйте ваш GitHub репозиторий
3. Настройте проект:
   - **Root Directory:** `packages/mobile`
   - **Build Command:** `npm run build:web`
   - **Output Directory:** `web-build`
   - **Install Command:** `npm install`

#### Шаг 5: Переменные окружения

В Vercel Dashboard добавьте:
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NODE_ENV=production
```

#### Шаг 6: Автоматический деплой

После настройки, каждый push в `main` ветку автоматически запустит деплой.

---

### Вариант 2: Netlify

#### Шаг 1: Установка Netlify CLI

```powershell
npm install -g netlify-cli
```

#### Шаг 2: Авторизация

```powershell
netlify login
```

#### Шаг 3: Сборка проекта

```powershell
cd packages/mobile

# Установить переменные окружения
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend-domain.com/api"
$env:NODE_ENV="production"

# Собрать web версию
npm run build:web
```

#### Шаг 4: Деплой

```powershell
cd web-build
netlify deploy --prod --dir=.
```

Или через веб-интерфейс:

1. Зайдите на [netlify.com](https://netlify.com)
2. Добавьте новый сайт из Git
3. Настройте:
   - **Base directory:** `packages/mobile`
   - **Build command:** `npm run build:web`
   - **Publish directory:** `packages/mobile/web-build`

#### Шаг 5: Переменные окружения

В Netlify Dashboard → Site settings → Environment variables:
```
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NODE_ENV=production
```

#### Шаг 6: Netlify.toml (опционально)

Создайте `netlify.toml` в `packages/mobile/`:

```toml
[build]
  base = "packages/mobile"
  command = "npm run build:web"
  publish = "web-build"

[build.environment]
  NODE_VERSION = "18"
  EXPO_PUBLIC_API_BASE_URL = "https://your-backend-domain.com/api"
  NODE_ENV = "production"
```

---

### Вариант 3: Любой статический хостинг

Вы можете загрузить собранные файлы на любой статический хостинг:

1. **GitHub Pages**
2. **Cloudflare Pages**
3. **AWS S3 + CloudFront**
4. **Firebase Hosting**
5. **Любой VPS с Nginx**

**Процесс:**

```powershell
cd packages/mobile

# Собрать проект
npm run build:web

# Загрузить содержимое web-build/ на ваш хостинг
```

---

## 📱 Mobile версии (App Stores)

### Android (Google Play Store)

#### Шаг 1: Подготовка

1. Создайте аккаунт разработчика в [Google Play Console](https://play.google.com/console)
   - Стоимость: $25 единоразово

2. Установите EAS CLI (если еще не установлен):
   ```powershell
   npm install -g eas-cli
   ```

3. Авторизуйтесь:
   ```powershell
   eas login
   ```

#### Шаг 2: Настройка EAS Build

Убедитесь, что `eas.json` настроен для production:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

#### Шаг 3: Сборка AAB

```powershell
cd packages/mobile

# Установить переменные окружения для production
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend-domain.com/api"
$env:NODE_ENV="production"

# Собрать AAB
eas build --platform android --profile production
```

**Процесс:**
- EAS загрузит ваш код
- Соберет Android App Bundle
- Предоставит ссылку для скачивания

#### Шаг 4: Загрузка в Google Play Console

1. Зайдите в [Google Play Console](https://play.google.com/console)
2. Создайте новое приложение
3. Заполните информацию:
   - Название приложения
   - Краткое описание
   - Полное описание
   - Скриншоты
   - Иконка приложения
   - Графический ресурс (feature graphic)

#### Шаг 5: Загрузка AAB

1. Перейдите в раздел "Production" → "Create new release"
2. Загрузите скачанный AAB файл
3. Заполните "Release notes"
4. Сохраните и отправьте на ревью

#### Шаг 6: Автоматическая загрузка (опционально)

EAS может автоматически загрузить AAB в Google Play:

```powershell
eas submit --platform android
```

Требуется настроить Google Play API credentials в EAS.

---

### iOS (App Store)

#### Шаг 1: Подготовка

1. Создайте [Apple Developer Account](https://developer.apple.com)
   - Стоимость: $99/год

2. Установите EAS CLI:
   ```powershell
   npm install -g eas-cli
   ```

3. Авторизуйтесь:
   ```powershell
   eas login
   ```

#### Шаг 2: Настройка Apple Developer

1. В [Apple Developer Portal](https://developer.apple.com/account):
   - Создайте App ID: `com.quicknotes.app`
   - Создайте Provisioning Profile
   - Настройте Certificates

2. Или позвольте EAS сделать это автоматически:
   ```powershell
   eas build --platform ios --profile production
   ```
   EAS запросит учетные данные и настроит все автоматически.

#### Шаг 3: Сборка IPA

```powershell
cd packages/mobile

# Установить переменные окружения для production
$env:EXPO_PUBLIC_API_BASE_URL="https://your-backend-domain.com/api"
$env:NODE_ENV="production"

# Собрать IPA
eas build --platform ios --profile production
```

**Процесс:**
- EAS запросит Apple Developer учетные данные
- Загрузит код
- Соберет iOS приложение
- Загрузит в App Store Connect (если настроено)

#### Шаг 4: Настройка App Store Connect

1. Зайдите в [App Store Connect](https://appstoreconnect.apple.com)
2. Создайте новое приложение:
   - Bundle ID: `com.quicknotes.app`
   - Название приложения
   - Основной язык

#### Шаг 5: Загрузка через EAS Submit

```powershell
eas submit --platform ios
```

EAS автоматически:
- Загрузит IPA в App Store Connect
- Создаст новую версию (если нужно)

#### Шаг 6: Заполнение информации в App Store Connect

1. Перейдите в раздел "App Information"
2. Заполните:
   - Описание приложения
   - Ключевые слова
   - Скриншоты для разных размеров экранов
   - Иконка приложения
   - Privacy Policy URL

#### Шаг 7: Отправка на ревью

1. Перейдите в раздел "TestFlight" для тестирования
2. Или сразу в "App Store" → "Submit for Review"
3. Заполните информацию для ревью
4. Отправьте на ревью

---

## 🔐 Переменные окружения для Production

### Backend

```env
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters
NODE_ENV=production
PORT=4000
```

### Frontend (Mobile/Web)

```env
EXPO_PUBLIC_API_BASE_URL=https://your-backend-domain.com/api
NODE_ENV=production
```

**Важно:** Для EAS Build используйте EAS Secrets:

```powershell
eas secret:create --scope project --name EXPO_PUBLIC_API_BASE_URL --value "https://your-backend-domain.com/api"
```

---

## 📝 Чек-лист деплоя

### Backend

- [ ] База данных настроена и миграции применены
- [ ] Переменные окружения настроены
- [ ] Backend доступен по публичному URL
- [ ] CORS настроен правильно
- [ ] SSL сертификат установлен (HTTPS)

### Web

- [ ] Переменные окружения настроены
- [ ] `EXPO_PUBLIC_API_BASE_URL` указывает на production backend
- [ ] Сборка прошла успешно
- [ ] Домен настроен (опционально)
- [ ] SSL сертификат установлен

### Mobile

- [ ] Переменные окружения настроены через EAS Secrets
- [ ] `EXPO_PUBLIC_API_BASE_URL` указывает на production backend
- [ ] Иконки и splash screen настроены
- [ ] Bundle ID / Package name уникальны
- [ ] Версия приложения обновлена
- [ ] Тестирование на реальных устройствах пройдено

---

## 🆘 Troubleshooting

### Backend не доступен

1. Проверьте логи: `railway logs` или в Dashboard хостинга
2. Убедитесь, что порт настроен правильно
3. Проверьте переменные окружения
4. Убедитесь, что база данных доступна

### Web версия не работает

1. Проверьте консоль браузера на ошибки
2. Убедитесь, что `EXPO_PUBLIC_API_BASE_URL` правильный
3. Проверьте CORS настройки backend
4. Убедитесь, что сборка прошла успешно

### Mobile сборка не работает

1. Проверьте логи: `eas build:list`
2. Убедитесь, что EAS Secrets настроены
3. Проверьте `eas.json` конфигурацию
4. Убедитесь, что Apple Developer / Google Play аккаунты настроены

---

## 📚 Дополнительные ресурсы

- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Railway Documentation](https://docs.railway.app)
- [Google Play Console](https://support.google.com/googleplay/android-developer)
- [App Store Connect](https://developer.apple.com/app-store-connect/)

