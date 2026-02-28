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
docker-compose up --build
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3005
- **Health check**: http://localhost:3005/health

---

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                  │
│                                          │
│  ┌──────────┐      ┌──────────┐        │
│  │ Frontend │─────►│ Backend  │        │
│  │  :3000   │      │  :3005   │        │
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
docker-compose up -d

# Start with rebuild
docker-compose up --build -d

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Stop
docker-compose down

# Stop and remove volumes (deletes database)
docker-compose down -v

# Restart
docker-compose restart backend
```

---

## Environment Variables

Set in `backend/.env` (mounted into container):

```env
PORT=3005
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3005
TRUSTED_ORIGINS=http://localhost:3000
APP_URL=http://localhost:3000

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

## Cloudflare vs Docker

| | Cloudflare Workers | Docker |
|---|---|---|
| Database | D1 (managed) | SQLite (local file) |
| Scaling | Auto (edge) | Manual |
| Cost | Free tier | VPS cost |
| Setup | `wrangler deploy` | `docker-compose up` |
| Best for | Production | Self-hosted / VPS |

For most use cases, **Cloudflare Workers** is recommended for production. Docker is great for self-hosted deployments or when you need full control.
