# REST API для заметок - QuickNotes Backend

## Формат ответов

Все ответы API используют единый формат:

**Успешный ответ:**
```json
{
  "data": {
    // данные ответа
  }
}
```

**Ошибка:**
```json
{
  "error": "Описание ошибки",
  "details": {
    // дополнительные детали (опционально)
  }
}
```

## Аутентификация

Все маршруты заметок требуют авторизации через JWT токен.

**Заголовок:**
```
Authorization: Bearer <accessToken>
```

## API Endpoints

### GET /api/notes

Получить список заметок текущего пользователя.

**Параметры запроса:**
- `includeArchived` (query, опционально) - если `true`, включает архивные заметки. По умолчанию возвращаются только неархивированные заметки.

**Заголовки:**
```
Authorization: Bearer <accessToken>
```

**Ответ (200):**
```json
{
  "data": {
    "notes": [
      {
        "id": "clx...",
        "userId": "clx...",
        "title": "Заголовок заметки",
        "content": "Содержимое заметки",
        "isArchived": false,
        "deletedAt": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Примеры:**
```powershell
# Получить только неархивированные заметки
Invoke-RestMethod -Uri "http://localhost:3000/api/notes" -Method GET -Headers @{Authorization="Bearer $token"}

# Получить все заметки (включая архивные)
Invoke-RestMethod -Uri "http://localhost:3000/api/notes?includeArchived=true" -Method GET -Headers @{Authorization="Bearer $token"}
```

---

### GET /api/notes/:id

Получить одну заметку по ID.

**Параметры:**
- `id` (path) - ID заметки

**Заголовки:**
```
Authorization: Bearer <accessToken>
```

**Ответ (200):**
```json
{
  "data": {
    "note": {
      "id": "clx...",
      "userId": "clx...",
      "title": "Заголовок заметки",
      "content": "Содержимое заметки",
      "isArchived": false,
      "deletedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Ошибка (404):**
```json
{
  "error": "Заметка не найдена"
}
```

**Пример:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notes/clx123" -Method GET -Headers @{Authorization="Bearer $token"}
```

---

### POST /api/notes

Создать новую заметку.

**Заголовки:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Тело запроса:**
```json
{
  "title": "Заголовок заметки",
  "content": "Содержимое заметки"
}
```

**Ответ (201):**
```json
{
  "data": {
    "note": {
      "id": "clx...",
      "userId": "clx...",
      "title": "Заголовок заметки",
      "content": "Содержимое заметки",
      "isArchived": false,
      "deletedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

**Ошибка валидации (400):**
```json
{
  "error": "Ошибка валидации",
  "details": [
    {
      "path": "title",
      "message": "Заголовок обязателен"
    }
  ]
}
```

**Пример:**
```powershell
$body = @{
    title = "Моя заметка"
    content = "Текст заметки"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/notes" -Method POST -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
```

---

### PUT /api/notes/:id

Обновить заметку.

**Параметры:**
- `id` (path) - ID заметки

**Заголовки:**
```
Authorization: Bearer <accessToken>
Content-Type: application/json
```

**Тело запроса (все поля опциональны):**
```json
{
  "title": "Новый заголовок",
  "content": "Новое содержимое",
  "isArchived": true
}
```

**Ответ (200):**
```json
{
  "data": {
    "note": {
      "id": "clx...",
      "userId": "clx...",
      "title": "Новый заголовок",
      "content": "Новое содержимое",
      "isArchived": true,
      "deletedAt": null,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

**Ошибка (404):**
```json
{
  "error": "Заметка не найдена"
}
```

**Пример:**
```powershell
$body = @{
    title = "Обновленный заголовок"
    isArchived = $true
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/notes/clx123" -Method PUT -Body $body -ContentType "application/json" -Headers @{Authorization="Bearer $token"}
```

---

### DELETE /api/notes/:id

Мягкое удаление заметки (устанавливает `deletedAt`).

**Параметры:**
- `id` (path) - ID заметки

**Заголовки:**
```
Authorization: Bearer <accessToken>
```

**Ответ (200):**
```json
{
  "data": {
    "note": {
      "id": "clx...",
      "userId": "clx...",
      "title": "Заголовок заметки",
      "content": "Содержимое заметки",
      "isArchived": false,
      "deletedAt": "2024-01-01T01:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T01:00:00.000Z"
    }
  }
}
```

**Ошибка (404):**
```json
{
  "error": "Заметка не найдена"
}
```

**Пример:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/notes/clx123" -Method DELETE -Headers @{Authorization="Bearer $token"}
```

## Особенности

### Мягкое удаление

При удалении заметки (`DELETE /api/notes/:id`) она не удаляется физически из базы данных. Вместо этого устанавливается поле `deletedAt`. Удаленные заметки не возвращаются в списке заметок.

### Фильтрация архивных заметок

По умолчанию `GET /api/notes` возвращает только неархивированные заметки (`isArchived: false`). Для получения всех заметок, включая архивные, используйте параметр `includeArchived=true`.

### Обновление архивации

Архивация заметки выполняется через `PUT /api/notes/:id` с полем `isArchived: true/false`.

## Коды статусов

- `200` - Успешный запрос
- `201` - Ресурс создан
- `400` - Ошибка валидации
- `401` - Не авторизован
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

