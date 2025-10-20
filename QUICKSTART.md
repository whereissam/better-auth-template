# Quick Start Guide

Get up and running in 3 steps!

## Prerequisites

- ✅ **Docker Desktop** - [Download here](https://www.docker.com/products/docker-desktop/)
- ✅ **Bun** (recommended) or Node.js 18+

## Step 1: Start Docker Desktop

1. Open **Docker Desktop** application
2. Wait for it to be fully ready (whale icon in menu bar)
3. You should see the whale icon stop animating

## Step 2: Run Setup

```bash
cd better-auth-template
bun run setup
```

This will:
- ✅ Check Docker is running
- ✅ Start PostgreSQL database
- ✅ Run database migrations
- ✅ Create all necessary tables

## Step 3: Start Development

```bash
bun run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3005
- **PgAdmin**: http://localhost:5051

---

## Alternative: One Command Setup

```bash
bun run start
```

This runs both setup and dev in one command!

---

## Common Issues

### ❌ "Docker is not running"

**Solution**: Start Docker Desktop and wait for it to be ready, then try again.

### ❌ "ECONNREFUSED" on frontend

**Problem**: Backend is not running (usually because database is not started)

**Solution**:
```bash
# Stop everything
Ctrl+C

# Start database
bun run db:up

# Wait 5 seconds, then start dev
bun run dev
```

### ❌ "Port already in use"

**Solution**:
```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 3005 (backend)
lsof -ti:3005 | xargs kill -9

# Try again
bun run dev
```

---

## Useful Commands

```bash
# Database management
bun run db:up        # Start database
bun run db:down      # Stop database
bun run db:status    # Check database status
bun run db:logs      # View database logs
bun run db:migrate   # Run migrations

# Development
bun run dev          # Start both frontend & backend
bun run dev:frontend # Start only frontend
bun run dev:backend  # Start only backend

# Complete setup
bun run setup        # Setup database
bun run start        # Setup + start dev
```

---

## Next Steps

1. **Configure OAuth Providers** (optional)
   - See [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)
   - Twitter/X OAuth setup in README.md

2. **Test Authentication**
   - Click "Sign in" button
   - Try connecting Ethereum wallet (SIWE)
   - Try Google/Twitter OAuth (after configuring)

3. **Customize**
   - Edit frontend components in `frontend/src/`
   - Add API endpoints in `backend/routes/`
   - Modify auth configuration in `backend/lib/auth.ts`

---

## Project Structure

```
better-auth-template/
├── frontend/           # React + Vite (deploy to Vercel)
├── backend/           # Express + Better Auth
│   ├── scripts/       # Setup and migration scripts
│   └── docker-compose.yml
├── docs/              # Documentation
└── package.json       # Root commands
```

---

## Troubleshooting

See [docs/SETUP_DATABASE.md](docs/SETUP_DATABASE.md) for detailed troubleshooting.

---

**Happy coding!** 🚀
