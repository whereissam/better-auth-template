# Docker Setup Guide

Run the entire Better Auth stack (frontend, backend, database) in Docker containers.

## Quick Start

### 1. Start Docker Desktop
Open Docker Desktop and wait for it to be ready.

### 2. Run Everything with Docker

```bash
cd better-auth-template
bun run start
```

This will:
- ✅ Build Docker images for frontend and backend
- ✅ Start PostgreSQL database
- ✅ Start backend on port 3005
- ✅ Start frontend on port 3000
- ✅ Start PgAdmin on port 5051

---

## Available Docker Commands

### Start Services
```bash
# Build and start (recommended for first time)
bun run start
# or
docker-compose up --build

# Start in background
bun run docker:up
# or
docker-compose up -d

# Start with live logs
bun run docker:dev
```

### Stop Services
```bash
# Stop all containers
bun run docker:down

# Stop and remove volumes (⚠️ deletes database data)
docker-compose down -v
```

### View Logs
```bash
# All services
bun run docker:logs

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Check Status
```bash
bun run docker:ps
# or
docker-compose ps
```

### Rebuild
```bash
# Rebuild all containers
bun run docker:build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Restart Services
```bash
# Restart all
bun run docker:restart

# Restart specific service
docker-compose restart backend
docker-compose restart frontend
```

---

## Access Your Application

Once running, access:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3005
- **PgAdmin**: http://localhost:5051
  - Email: `admin@example.com`
  - Password: `admin`

---

## Architecture

```
┌─────────────────────────────────────────┐
│          Docker Network                  │
│                                          │
│  ┌──────────┐      ┌──────────┐        │
│  │ Frontend │─────▶│ Backend  │        │
│  │  :3000   │      │  :3005   │        │
│  └──────────┘      └────┬─────┘        │
│                          │              │
│                    ┌─────▼─────┐       │
│                    │ PostgreSQL│       │
│                    │   :5432   │       │
│                    └───────────┘       │
│                                         │
│  ┌──────────┐                          │
│  │ PgAdmin  │                          │
│  │  :5051   │                          │
│  └──────────┘                          │
└─────────────────────────────────────────┘
```

---

## Environment Variables

Environment variables are set in `docker-compose.yml`:

### Backend
- `DB_HOST=postgres` (container name)
- `DB_PORT=5432` (internal port)
- `DB_USER=postgres`
- `DB_PASSWORD=postgres`
- `DB_NAME=auth_db`
- `BETTER_AUTH_URL=http://localhost:3005`

### Frontend
- `VITE_API_URL=http://localhost:3005`
- `VITE_APP_URL=http://localhost:3000`

---

## Development Workflow

### With Docker (Containers)
```bash
# Start everything
bun run start

# Make code changes (auto-reload enabled)
# Frontend and backend will auto-reload on file changes

# View logs
bun run docker:logs

# Stop when done
bun run docker:down
```

### Without Docker (Local)
```bash
# Start database only
bun run db:up

# Run backend locally
bun run dev:backend

# Run frontend locally
bun run dev:frontend
```

---

## Hot Reload / Live Development

Both frontend and backend have **volume mounts** for live development:

```yaml
volumes:
  - ./backend:/app      # Backend code sync
  - ./frontend:/app     # Frontend code sync
  - /app/node_modules   # Persist node_modules
```

**Changes to your code will automatically reload!**

---

## Troubleshooting

### Port Conflicts

If ports are already in use:

**Option 1**: Change ports in `docker-compose.yml`
```yaml
ports:
  - "3001:3000"  # Frontend
  - "3006:3005"  # Backend
  - "5434:5432"  # PostgreSQL
```

**Option 2**: Kill processes using those ports
```bash
lsof -ti:3000 | xargs kill -9
lsof -ti:3005 | xargs kill -9
lsof -ti:5433 | xargs kill -9
```

### Container Won't Start

Check logs:
```bash
docker-compose logs backend
docker-compose logs frontend
```

Rebuild:
```bash
docker-compose down
docker-compose up --build
```

### Database Connection Failed

Ensure PostgreSQL is healthy:
```bash
docker exec better-auth-postgres pg_isready -U postgres
```

Check backend environment variables in `docker-compose.yml`.

### Changes Not Reflecting

1. Check volume mounts are correct
2. Restart the service:
   ```bash
   docker-compose restart backend
   ```
3. Rebuild if needed:
   ```bash
   docker-compose up --build
   ```

---

## Production Deployment

For production, create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    environment:
      - NODE_ENV=production
      - BETTER_AUTH_URL=https://yourdomain.com
      # Add production env vars
    restart: always

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
    environment:
      - VITE_API_URL=https://api.yourdomain.com
    restart: always
```

Then run:
```bash
bun run docker:prod
```

---

## Cleanup

### Remove Containers
```bash
docker-compose down
```

### Remove Containers + Volumes (⚠️ Deletes data)
```bash
docker-compose down -v
```

### Remove Images
```bash
docker rmi better-auth-template-backend
docker rmi better-auth-template-frontend
```

### Full Cleanup
```bash
docker-compose down -v --rmi all
```

---

## Comparison: Docker vs Local

| Feature | Docker | Local |
|---------|--------|-------|
| Setup | One command | Multiple steps |
| Consistency | ✅ Same everywhere | May vary by OS |
| Performance | Slight overhead | Native speed |
| Isolation | ✅ Fully isolated | Shared system |
| Hot Reload | ✅ Yes | ✅ Yes |
| Best For | Team dev, CI/CD | Quick iterations |

---

## Next Steps

1. Start the stack: `bun run start`
2. Configure OAuth providers (see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
3. Test authentication flows
4. Deploy to production

Happy Dockerizing! 🐳
