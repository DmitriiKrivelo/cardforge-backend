# CardForge Backend

Серверная часть (REST API) веб-приложения для создания электронных визиток. Разработана на Node.js с использованием Express.js, PostgreSQL и JWT-аутентификации.

## Возможности

- Регистрация и аутентификация пользователей (JWT)
- Система ролей (пользователь/администратор)
- CRUD операции для управления визитками
- Генерация коротких ссылок (slug) и QR-кодов
- Автоматический учёт просмотров визиток
- Загрузка аватаров (multer)
- Административная панель (управление пользователями, просмотр статистики)
- Управление шаблонами визиток

## Структура проекта

```text
cardforge-backend
server.js              # Главный файл приложения (все эндпоинты)
db.js                  # Подключение к PostgreSQL
auth.js                # JWT-аутентификация и проверка прав
create-tables.js       # Скрипт создания таблиц
seed-data.js           # Скрипт наполнения тестовыми данными
docker-compose.yml     # Конфигурация Docker для PostgreSQL
.env                   # Переменные окружения (не в Git)
.env.example           # Пример переменных окружения
package.json           # Зависимости проекта
uploads/               # Папка для загруженных аватаров
```

## Технологии

- **Node.js** — серверная платформа
- **Express.js** — веб-фреймворк
- **PostgreSQL** — база данных
- **JWT** — аутентификация
- **bcryptjs** — хеширование паролей
- **Docker/Docker Compose** — контейнеризация БД
- **Multer** — загрузка файлов

## Требования для запуска

- Node.js 20+
- Docker Desktop
- Git (опционально)

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone https://github.com/ТВОЙ_НИК/cardforge-backend.git
cd cardforge-backend
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка переменных окружения

```env
PORT=3000
JWT_SECRET='cardforge-secret-key-change-me'
```

### 4. Запуск базы данных (Docker)

```bash
docker-compose up -d
```

### 5. Создание таблиц в базе данных

```bash
node create-table.js
```

### 6. Заполнение тестовыми данными (опционально)

```bash
node seed-data.js
```

### 7. Запуск сервера

```bash
npm run dev
```
Сервер будет доступен по адресу: http://localhost:3000

## Проверка работоспособности
Откройте в браузере http://localhost:3000/health, должен вернуться ответ:

```json
{"status":"ok","db":"connected","time":"2026-..."}
```

## Примеры запросов

### Регистрация

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Тестовый Пользователь"}'
```

### Вход

```bash
curl -X POST http://localhost:3000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456"}'
```

### Создание визитки

```bash
curl -X POST http://localhost:3000/api/cards \
  -H "Authorization: Bearer ТВОЙ_ТОКЕН" \
  -H "Content-Type: application/json" \
  -d '{"title":"Моя визитка","templateId":1,"data":{"name":"Иван","phone":"+7 999 123-45-67","email":"ivan@test.com"}}'
```

### Публичный просмотр визитки

```bash
curl -X GET http://localhost:3000/api/cards/моя-визитка-1234567890
```
