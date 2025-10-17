# Orbit Wars — PixiJS Arcade

Элегантный аркадный шутер на PixiJS с плавной графикой, партиклами и удобным управлением мышью/тачем. После второго поражения игра ненавязчиво предлагает скачать приложение (кнопка Download).

## Демо
- GitHub Pages: https://<your-username>.github.io/<your-repo>/
  
(После первого пуша в `main` деплой запустится автоматически через GitHub Actions.)

## Фичи
- Динамический звездный фон и частицы (взрывы, свечение)
- Управление мышью и тачем с корректным маппингом координат под любой экран
- Астероиды/кристаллы, счет, уровни, здоровье (сердечки)
- Экран Game Over с красивыми кнопками: Restart и Download (после 2 поражений)
- Адаптивная верстка шаблона (центрирование канваса, тени, safe‑area на мобильных)

## Технологии
- TypeScript + PixiJS 7
- Webpack 5, `ts-loader`, `html-webpack-plugin`, `copy-webpack-plugin`
- NPM scripts для дев‑сервера и сборки

## Быстрый старт
Предпосылки: Node.js 18+ (рекомендуется 20 LTS)

```bash
# Установка зависимостей
npm ci

# Дев-сервер (http://localhost:5173)
npm run dev

# Продакшн-сборка (в папку dist)
npm run build
```

## Структура
- `src/main.ts` — игровая логика, цикл, UI-оверлей
- `index.ejs` — HTML‑шаблон (инъекция бандла и базовые стили)
- `public/` — статические ресурсы (favicon, стили, ассеты)
- `webpack.config.mjs` — конфиг сборки
- `tsconfig.json` — TypeScript
- `.gitignore` — исключает `node_modules`, `dist` и артефакты IDE

## Деплой на GitHub Pages (без мусора)
В репозиторий не попадают `node_modules` и `dist` — публикация автоматическая, через GitHub Actions.

### Уже настроено в репозитории
- Workflow `.github/workflows/deploy.yml`:
  - Собирает проект на CI
  - Публикует содержимое `dist` на GitHub Pages

### Как запустить
1) Создайте пустой репозиторий на GitHub и привяжите его к локальному:
```bash
git init -b main
git add .
git commit -m "init: orbit wars"
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```
2) В настройках репозитория включите Pages и установите Source = GitHub Actions.
3) Дождитесь прохождения workflow “Deploy to GitHub Pages”.
4) Демо будет доступно по адресу вида `https://<your-username>.github.io/<your-repo>/`.

### Альтернатива (ручной деплой ветки gh-pages)
Если не хотите Actions:
```bash
npm run build
# Опубликовать только содержимое dist как gh-pages
git subtree push --prefix dist origin gh-pages
```
Затем в настройках Pages выберите ветку `gh-pages` (root).

## Заметки
- В шаблоне используются относительные пути к ассетам (например, `favicon.png`), чтобы корректно работать под подкаталогом Pages.
- Если нужен собственный домен — добавьте `CNAME` в папку `public/`.

---
Если нужно — могу прикрутить линтинг/форматтер и базовые юнит‑тесты, а также добавить автоматическую прогонку линтера в CI.
