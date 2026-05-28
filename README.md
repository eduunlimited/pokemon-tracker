# Pokemon Business Tracker

Track business spend, mileage, and your Collectr portfolio value in one place.

## Features

- **Expenses** — store purchases, parking, entry tickets, supplies, shipping (with receipt scan)
- **Mileage** — route-based or manual trips with month/YTD summaries
- **Collectr value** — one manual portfolio number from your Collectr app
- **Dashboard** — net position = Collectr value − (total spend + mileage deduction)

## Local development

```bash
npm install
cp .env.example .env
npx prisma migrate deploy
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Daily workflow

1. Log store runs, parking, and tickets under **Expenses**
2. Log trips under **Mileage**
3. Copy your total value from **Collectr** into the dashboard or **Settings**

## Deploy to Vercel

See [DEPLOY.md](./DEPLOY.md).
