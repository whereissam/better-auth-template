# Docker Setup Guide

Run the Better Auth stack in Docker containers using the Node.js entry point with SQLite.

## Quick Start

```bash
cd better-auth-template

# Configure environment
cd backend && cp .env.example .env
# Edit .env with your BETTER_AUTH_SECRET

# Start everything
cd ..
docker compose up --build
```

Access:
- **Frontend**: http://localhost:4000
- **Backend API**: http://localhost:4200
- **Health check**: http://localhost:4200/health

---

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                  │
│                                          │
│  ┌──────────┐      ┌──────────┐        │
│  │ Frontend │─────►│ Backend  │        │
│  │  :4000   │      │  :4200   │        │
│  └──────────┘      └────┬─────┘        │
│                          │              │
│                    ┌─────▼─────┐       │
│                    │  SQLite   │       │
│                    │ (volume)  │       │
│                    └───────────┘       │
└─────────────────────────────────────────┘
```

---

## Commands

```bash
# Start
docker compose up -d

# Start with rebuild
docker compose up --build -d

# View logs
docker compose logs -f
docker compose logs -f backend

# Stop
docker compose down

# Stop and remove volumes (deletes database)
docker compose down -v

# Restart
docker compose restart backend
```

---

## Environment Variables

Set in `backend/.env` (mounted into container):

```env
PORT=4200
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:4200
TRUSTED_ORIGINS=http://localhost:4000
APP_URL=http://localhost:4000

# Optional
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
```

---

## Production Docker

For production, update `docker-compose.yml` environment:

```yaml
environment:
  - BETTER_AUTH_URL=https://api.yourdomain.com
  - TRUSTED_ORIGINS=https://yourdomain.com
  - APP_URL=https://yourdomain.com
```

Add Nginx or Caddy as a reverse proxy with HTTPS.

---

## Troubleshooting

### Backend restarts but app does not boot

If logs show missing module errors (for example `Cannot find module '@hono/node-server'`), recreate backend with fresh anonymous volumes:

```bash
docker compose up -d --build --force-recreate --renew-anon-volumes backend
```

### Cloudflare Tunnel + OAuth callback errors

If Better Auth logs `Invalid callbackURL` for a `*.trycloudflare.com` URL:

1. Update `APP_URL` and `TRUSTED_ORIGINS` in `backend/.env` to the current tunnel domain
2. Keep `BETTER_AUTH_URL` pointed at backend (`http://localhost:4200` for local Node.js)
3. Restart backend: `docker compose restart backend`

---

## Cloudflare vs Docker

| | Cloudflare Workers | Docker |
|---|---|---|
| Database | D1 (managed) | SQLite (local file) |
| Scaling | Auto (edge) | Manual |
| Cost | Free tier | VPS cost |
| Setup | `wrangler deploy` | `docker compose up` |
| Best for | Production | Self-hosted / VPS |

For most use cases, **Cloudflare Workers** is recommended for production. Docker is great for self-hosted deployments or when you need full control.
