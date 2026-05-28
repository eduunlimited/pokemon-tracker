# Deploying Pokemon Tracker to Vercel

This guide connects the app so you can use it on your computer, phone, and any other device.

## What you need

- A [GitHub](https://github.com) account
- A [Vercel](https://vercel.com) account (free)
- A [Turso](https://turso.tech) account (free) for the database
- Optional: [OpenAI API key](https://platform.openai.com) for receipt scanning

## Step 1: Push code to GitHub

```bash
git add .
git commit -m "Pokemon business tracker"
git remote add origin https://github.com/YOUR_USERNAME/pokemon-tracker.git
git push -u origin main
```

## Step 2: Import into Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repository
3. Keep the default Next.js settings
4. Do **not** deploy yet — add environment variables first

## Step 3: Create a Turso database

1. Sign up at [turso.tech](https://turso.tech)
2. Create a new database (e.g. `pokemon-tracker`)
3. Copy the **libSQL connection URL** and **auth token**
4. Combine them into one `DATABASE_URL`:

```env
DATABASE_URL="libsql://YOUR-DB-NAME-USER.turso.io?authToken=YOUR_TOKEN"
```

> Turso uses SQLite, so the same Prisma schema works in production.

Run migrations against Turso once from your machine:

```bash
DATABASE_URL="libsql://..." npx prisma migrate deploy
```

## Step 4: Enable Vercel Blob (receipt photos)

1. In your Vercel project, open **Storage**
2. Create a **Blob** store
3. Connect it to the project — Vercel adds `BLOB_READ_WRITE_TOKEN` automatically

## Step 5: Add environment variables in Vercel

In **Project Settings → Environment Variables**, add:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Turso libSQL URL with auth token |
| `BLOB_READ_WRITE_TOKEN` | Auto-added if you connected Blob |
| `OPENAI_API_KEY` | Your OpenAI key (for receipt scanning) |
| `MILEAGE_RATE` | `0.67` |
| `APP_PASSCODE` | Optional secret to protect your app URL |

## Step 6: Deploy

Click **Deploy** (or push to `main` — Vercel redeploys automatically).

Your app will be live at:

```text
https://pokemon-tracker.vercel.app
```

(or a similar Vercel URL)

## Step 7: Use on your phone

1. Open the Vercel URL in Safari (iPhone) or Chrome (Android)
2. **iPhone:** Share → **Add to Home Screen**
3. **Android:** Menu → **Install app** or **Add to Home screen**

The app opens full-screen like a native app and can use the camera for receipt scanning (HTTPS required — Vercel provides this).

## Daily usage

- **Computer:** bookmark the Vercel URL
- **Phone:** use the home screen icon
- Data syncs across all devices via Turso

## Local development

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Receipt images save to `public/uploads/receipts/` locally. In production they save to Vercel Blob.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Vercel | Ensure `postinstall` runs `prisma generate` (already in package.json) |
| Database empty in production | Run `prisma migrate deploy` against Turso |
| Receipt scan fails | Check `OPENAI_API_KEY` is set in Vercel env vars |
| Camera not working on phone | Must use HTTPS (Vercel URL), not `localhost` on cellular |
