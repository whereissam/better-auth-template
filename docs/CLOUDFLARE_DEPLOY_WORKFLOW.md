# Cloudflare Deploy Workflow

This guide is a repeatable workflow for deploying this project to Cloudflare with minimal manual edits.

## Goal

- Keep config in one place
- Avoid leaking personal URLs/IDs in repo
- Let AI run deployment and verification steps reliably

## 1. Pin Tool Versions

Create `.bun-version` at repo root:

```txt
1.3.10
```

Use the same version locally and in CI.

## 2. Prepare Deploy Config Template

Create `backend/.env.deploy.example` (do not commit real values):

```env
WORKER_NAME=your-worker-name
API_URL=https://api.yourdomain.com
APP_URL=https://app.yourdomain.com
TRUSTED_ORIGINS=https://app.yourdomain.com
D1_DATABASE_NAME=your-d1-database-name
D1_DATABASE_ID=your-d1-database-id
```

Copy to `backend/.env.deploy` and fill your real values locally.

## 3. One-Time Cloudflare Setup

### Create D1 database

```bash
cd backend
wrangler d1 create your-d1-database-name
```

Copy returned `database_name` and `database_id` into:
- `backend/.env.deploy` (local)
- `backend/wrangler.toml` placeholders when deploying

### Set secrets

```bash
cd backend
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put TWITTER_CLIENT_ID
wrangler secret put TWITTER_CLIENT_SECRET
wrangler secret put TELEGRAM_CLIENT_ID
wrangler secret put TELEGRAM_CLIENT_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
```

## 4. Per-Deploy Steps

1. Update `backend/wrangler.toml` from your deploy config:
- `name`
- `vars.BETTER_AUTH_URL`
- `vars.APP_URL`
- `vars.TRUSTED_ORIGINS`
- `d1_databases[].database_name`
- `d1_databases[].database_id`

2. Deploy backend:

```bash
cd backend
bun run db:migrate
bun run deploy
```

3. Verify:

```bash
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/api/auth/providers
```

Expected:
- `/health` returns `200` and JSON status
- `/api/auth/providers` returns JSON provider flags

## 5. Telegram Requirement

Telegram OAuth requires public HTTPS URLs.

- Do not use `localhost` callback URLs for Telegram OAuth
- Use Cloudflare Tunnel or ngrok in development
- Set:
  - `BETTER_AUTH_URL` = backend public HTTPS URL
  - `APP_URL` = frontend public HTTPS URL
  - `TRUSTED_ORIGINS` = frontend HTTPS origin(s)

## 6. Prompt to Reuse with AI

Use this prompt when you want AI to do everything in one pass:

```txt
Use backend/.env.deploy values to update backend/wrangler.toml and related docs placeholders.
Then run Cloudflare deployment end-to-end:
1) bun run db:migrate
2) bun run deploy
3) verify /health and /api/auth/providers.
If anything is missing (secrets, D1 ID, auth vars), stop and print exactly what is missing.
Do not commit personal URLs/IDs to files.
```
