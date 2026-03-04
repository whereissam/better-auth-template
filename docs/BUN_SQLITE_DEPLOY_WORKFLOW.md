# Bun + SQLite Deploy Workflow

This is the self-hosted deployment path (no Cloudflare Workers/D1).  
Use this when you want to run backend with Bun and SQLite directly (VM, Docker, or bare server).

## When To Choose This

- You want full infrastructure control
- You prefer simple Bun runtime + local SQLite file
- You do not need Cloudflare-specific services

## 1. Pin Bun Version

Create `.bun-version` at repo root:

```txt
1.3.10
```

## 2. Configure Backend Env

Copy and fill:

```bash
cp backend/.env.example backend/.env
```

Required core values:

```env
PORT=4200
DB_PATH=./data/local.db
BETTER_AUTH_SECRET=your_secret
BETTER_AUTH_URL=https://api.yourdomain.com
APP_URL=https://app.yourdomain.com
TRUSTED_ORIGINS=https://app.yourdomain.com
```

Notes:
- `BETTER_AUTH_URL` = backend public URL
- `APP_URL` = frontend public URL
- `TRUSTED_ORIGINS` = allowed frontend origin(s), comma-separated

## 3. Run Backend

```bash
cd backend
bun install
bun run src/node.ts
```

Or via Docker:

```bash
docker compose up -d --build
```

## 4. Verify

```bash
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/auth/providers
```

Expected:
- `/health` returns `200` JSON
- `/api/auth/providers` returns provider flags

## 5. Telegram Requirement

Telegram OAuth needs public HTTPS URLs.

- Do not use localhost callback URLs for Telegram OAuth
- For development, use Cloudflare Tunnel or ngrok
- Keep URL mapping correct:
  - `BETTER_AUTH_URL` = backend HTTPS URL
  - `APP_URL` = frontend HTTPS URL
  - `TRUSTED_ORIGINS` includes frontend HTTPS URL

## 6. Prompt To Reuse With AI

```txt
Deploy using Bun + SQLite (not Cloudflare Workers).
Use backend/.env values and ensure URL mapping is correct:
BETTER_AUTH_URL=backend URL, APP_URL=frontend URL, TRUSTED_ORIGINS=frontend origins.
Start/restart backend, then verify /health and /api/auth/providers.
If any variable is missing, list exactly what is missing.
Do not write personal URLs/IDs into tracked files.
```
