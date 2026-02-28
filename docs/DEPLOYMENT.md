# Deployment Guide

Production deployment guide for Better Auth template.

## Table of Contents

1. [Cloudflare Deployment](#cloudflare-deployment) (recommended)
2. [Docker Deployment](#docker-deployment)
3. [VPS / Cloud Deployment](#vps--cloud-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Environment Variables](#environment-variables)
6. [Security Checklist](#security-checklist)

## Cloudflare Deployment

### 1. Create D1 Database

```bash
cd backend
bun run db:create
```

Copy the `database_id` from the output.

### 2. Update wrangler.toml

```toml
[[d1_databases]]
binding = "DB"
database_name = "auth-db"
database_id = "your-actual-database-id"
```

Update `[vars]` for production:
```toml
[vars]
BETTER_AUTH_URL = "https://api.yourdomain.com"
APP_URL = "https://yourdomain.com"
TRUSTED_ORIGINS = "https://yourdomain.com"
```

### 3. Set Secrets

```bash
wrangler secret put BETTER_AUTH_SECRET
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put RESEND_FROM_EMAIL
```

### 4. Apply Migrations & Deploy

```bash
bun run db:migrate     # Apply migrations to production D1
bun run deploy         # Deploy Worker
```

### 5. Custom Domain (optional)

In Cloudflare dashboard:
1. Workers & Pages → your worker → Settings → Domains & Routes
2. Add custom domain (e.g., `api.yourdomain.com`)

---

## Docker Deployment

Uses the Node.js entry point with SQLite.

### 1. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env` with production values:
```env
PORT=3005
BETTER_AUTH_SECRET=<openssl rand -base64 32>
BETTER_AUTH_URL=https://api.yourdomain.com
TRUSTED_ORIGINS=https://yourdomain.com
APP_URL=https://yourdomain.com
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

### 2. Docker Compose

```bash
# From project root
docker-compose up -d
```

This starts:
- Backend (Hono + SQLite) on port 3005
- Frontend on port 3000

### 3. Nginx Reverse Proxy

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://localhost:3005/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;
        proxy_cookie_path / /;
    }
}
```

### 4. HTTPS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## VPS / Cloud Deployment

### Direct Node.js / Bun

```bash
cd backend

# Install dependencies
bun install
bun add better-sqlite3

# Set environment
export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"
export BETTER_AUTH_URL="https://api.yourdomain.com"
export TRUSTED_ORIGINS="https://yourdomain.com"
export APP_URL="https://yourdomain.com"

# Start server
bun run src/node.ts
```

### With PostgreSQL

Edit `src/node.ts` to use PostgreSQL instead of SQLite:
```typescript
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
// Pass `pool` as the database in authConfig
```

Install `pg`:
```bash
bun add pg @types/pg
```

### Process Manager (PM2)

```bash
# Install PM2
npm install -g pm2

# Start
pm2 start "bun run src/node.ts" --name auth-backend

# Auto-restart on reboot
pm2 startup
pm2 save
```

---

## Frontend Deployment

### Vercel

1. Import repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Add environment variables:
   ```
   VITE_API_URL=https://api.yourdomain.com
   VITE_APP_URL=https://yourdomain.com
   ```
4. Deploy

### Cloudflare Pages

```bash
cd frontend
bun run build
npx wrangler pages deploy dist --project-name=my-auth-app
```

### Static Hosting

```bash
cd frontend
bun run build
# Upload `dist/` to any static host (S3, Nginx, etc.)
```

---

## Environment Variables

### Backend (Cloudflare Workers)

Set via `wrangler secret put` or `wrangler.toml [vars]`:

| Variable | Required | Description |
|----------|----------|-------------|
| `BETTER_AUTH_SECRET` | Yes | Session encryption key (min 32 chars) |
| `BETTER_AUTH_URL` | Yes | Backend public URL |
| `APP_URL` | Yes | Frontend public URL |
| `TRUSTED_ORIGINS` | Yes | Comma-separated allowed origins |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret |
| `TWITTER_CLIENT_ID` | No | Twitter OAuth client ID |
| `TWITTER_CLIENT_SECRET` | No | Twitter OAuth client secret |
| `RESEND_API_KEY` | No | Resend API key for emails |
| `RESEND_FROM_EMAIL` | No | Sender email address |

### Backend (Node.js / Bun)

Same as above, plus:

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3005) |
| `DB_PATH` | No | SQLite path (default: ./data/local.db) |

### Frontend

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_APP_URL` | Yes | Frontend URL |

---

## Security Checklist

### Before Deployment

- [ ] Generate new `BETTER_AUTH_SECRET` (`openssl rand -base64 32`)
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Set `TRUSTED_ORIGINS` to exact production URLs (no wildcards)
- [ ] Configure OAuth callback URLs in provider dashboards
- [ ] Set up Resend with verified sender domain
- [ ] Test all auth flows in staging
- [ ] Set up error tracking (Sentry, etc.)

### Cookie Security

Better Auth automatically configures cookies:
```typescript
{
  httpOnly: true,      // Prevents XSS
  secure: true,        // HTTPS only (when baseURL is https)
  sameSite: 'lax',     // CSRF protection
}
```

### Environment Variables

**Never commit:**
- `.env` / `.dev.vars` files
- API keys or secrets
- Database credentials

**Use:**
- `wrangler secret put` for Cloudflare
- Environment variable management for VPS (systemd, PM2, etc.)
- `.env.example` / `.dev.vars.example` for documentation only

---

## Monitoring

### Health Checks

```bash
curl https://api.yourdomain.com/health
# {"status":"ok","timestamp":"2026-01-01T00:00:00.000Z"}
```

### Cloudflare Analytics

Workers analytics available in Cloudflare dashboard — request counts, errors, latency.

### D1 Analytics

D1 query metrics available in Cloudflare dashboard — reads, writes, storage.

---

## Cost Comparison

| | Cloudflare | Docker/VPS | Vercel + DB |
|---|---|---|---|
| Backend | Free (100k req/day) | $5-20/mo | $0-20/mo |
| Database | Free (5GB D1) | Free (SQLite) | $10-50/mo |
| Frontend | Free (Pages) | Included | Free (Vercel) |
| **Total** | **Free** | **$5-20/mo** | **$10-70/mo** |

---

## Support

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
