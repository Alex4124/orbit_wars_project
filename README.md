# Orbit Wars — PixiJS Arcade

Элегантный аркадный шутер на PixiJS с плавной графикой, партиклами и удобным управлением мышью/тачем. После второго поражения игра ненавязчиво предлагает скачать приложение (кнопка Download).

## Демо
- GitHub Pages: https://alex4124.github.io/orbit_wars_project/
  
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


## Developed by Alim Kamavov