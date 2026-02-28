# Quick Start Guide

Get up and running in 3 steps!

## Prerequisites

- **Bun** (recommended) or Node.js 18+

## Step 1: Install Dependencies

```bash
cd better-auth-template
bun install

cd backend && bun install
cd ../frontend && bun install
```

## Step 2: Set Up Backend

### Option A: Cloudflare Workers (D1)

```bash
cd backend

# Copy secrets template
cp .dev.vars.example .dev.vars
# Edit .dev.vars and set BETTER_AUTH_SECRET

# Apply database migrations
bun run db:migrate:local

# Start dev server
bun run dev
```

### Option B: Node.js / Bun (SQLite)

```bash
cd backend

# Copy env template
cp .env.example .env
# Edit .env and set BETTER_AUTH_SECRET

# Start dev server (auto-creates SQLite DB + runs migrations)
bun run dev:node
```

## Step 3: Start Frontend

```bash
cd frontend
bun run dev
```

Access:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:8787 (Cloudflare) or http://localhost:3005 (Node.js)

---

## Common Issues

### "Port already in use"

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8787 (wrangler)
lsof -ti:8787 | xargs kill -9
```

### Cookies not persisting

- Check Vite proxy in `vite.config.ts` points to correct backend port
- Ensure `credentials: "include"` in auth client
- Verify CORS `credentials: true` on backend

---

## Useful Commands

```bash
# Cloudflare Workers
bun run dev              # Start wrangler dev server
bun run deploy           # Deploy to Cloudflare
bun run db:migrate:local # Apply D1 migrations locally
bun run db:migrate       # Apply D1 migrations to production

# Node.js / Bun
bun run dev:node         # Start Node.js dev server (SQLite)

# Frontend
cd frontend && bun run dev  # Start frontend
```

---

## Next Steps

1. **Configure OAuth Providers** (optional)
   - See [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md)

2. **Test Authentication**
   - Sign up with email/password
   - Try Email OTP or Magic Link
   - Try Google/Twitter OAuth (after configuring)

3. **Customize**
   - Edit frontend components in `frontend/src/`
   - Modify auth configuration in `backend/src/lib/auth.ts`

---

## Project Structure

```
better-auth-template/
├── frontend/              # React + Vite
├── backend/
│   ├── src/
│   │   ├── index.ts       # Cloudflare Workers entry
│   │   ├── node.ts        # Node.js / Bun entry
│   │   └── lib/
│   │       ├── auth.ts    # Better Auth config
│   │       └── email.ts   # Resend email service
│   ├── migrations/        # D1 / SQLite migrations
│   └── wrangler.toml      # Cloudflare config
└── docs/                  # Documentation
```

---

See [SETUP.md](./SETUP.md) for detailed setup instructions.
