# Better Auth Template

Production-ready authentication template with Better Auth, featuring Twitter/Google OAuth and SIWE (Sign-In with Ethereum).

## ⚡ Quick Start

### Prerequisites
- **Bun** runtime installed ([https://bun.sh](https://bun.sh))
- **Docker Desktop** installed and running

### One-Command Start (Easiest)

```bash
# From root directory - starts everything!
bun run docker:build && bun run dev:local
```

This will:
1. Start PostgreSQL database in Docker
2. Start backend API (locally with hot-reload)
3. Start frontend dev server (locally with hot-reload)

Visit: **http://localhost:3000** 🚀

---

### Alternative: Step-by-Step Setup

**Option 1: Backend + Frontend Locally (Best for Development)**
```bash
# Terminal 1: Start database only
bun run db:only

# Terminal 2: Start backend
cd backend && bun install && bun run dev

# Terminal 3: Start frontend
cd frontend && bun install && bun run dev
```

**Option 2: Backend in Docker, Frontend Locally**
```bash
# Terminal 1: Start backend + database in Docker
bun run docker:build

# Terminal 2: Start frontend locally
cd frontend && bun install && bun run dev
```

---

## 🎯 Available Commands

### Root Directory Commands (Recommended)

| Command | Description |
|---------|-------------|
| `bun run docker:build` | Build & start Docker services (backend + DB) |
| `bun run docker:up` | Start Docker services (backend + DB) |
| `bun run docker:down` | Stop all Docker services |
| `bun run docker:logs` | View Docker logs |
| `bun run docker:clean` | Stop & remove all containers + volumes |
| `bun run db:only` | Start PostgreSQL database only |
| `bun run dev:local` | Start backend + frontend locally (hot-reload) |

### Direct Docker Commands (Alternative)

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start backend + database |
| `docker-compose up -d postgres` | Start database only |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | Follow logs |
| `docker-compose ps` | Check status |

### From Backend Directory

| Command | Description |
|---------|-------------|
| `bun run dev` | Start DB + run migrations + start server |
| `bun run dev:server` | Start server only (DB must be running) |
| `bun run db:migrate` | Run Better Auth migrations |

### From Frontend Directory

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Build for production |

---

## 📦 What's Included

- ✅ **Frontend**: React + Vite (runs on port 3000)
- ✅ **Backend**: Express + Better Auth (runs on port 3005)
- ✅ **Database**: PostgreSQL (runs on port 5433)
- ✅ **PgAdmin**: Database management UI (runs on port 5051)

### Authentication Methods
- Twitter/X OAuth
- Google OAuth
- Sign-In With Ethereum (SIWE)
- Account linking (wallet + social)

---

## 🚀 Deployment

### Development
```bash
bun run dev
```

### Production
```bash
bun run prod
```

Everything is containerized - same setup everywhere! 🐳

---

## 🔧 Configuration

### OAuth Setup (Optional)

**Twitter OAuth:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create app, enable OAuth 2.0
3. Add callback: `http://localhost:3000/api/auth/callback/twitter`
4. Add credentials to `backend/.env`:
   ```
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

**Google OAuth:**
1. See [docs/GOOGLE_OAUTH_SETUP.md](docs/GOOGLE_OAUTH_SETUP.md)

### Environment Variables

All environment variables are configured in `docker-compose.yml`. No manual setup needed!

For production, create `.env.production` or update `docker-compose.prod.yml`.

---

## 📁 Project Structure

```
better-auth-template/
├── frontend/              # React app
├── backend/               # Express API
├── docs/                  # Documentation
├── docker-compose.yml     # Development setup
└── package.json           # One-command scripts
```

---

## 🐛 Troubleshooting

### Docker not running?
Start Docker Desktop and try again.

### Port conflicts?
Edit ports in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Change 3000 to 3001
```

### View logs:
```bash
bun run logs
```

### Clean restart:
```bash
bun run clean
bun run dev
```

---

## 📚 Documentation

- [Docker Setup Guide](docs/DOCKER_SETUP.md)
- [Database Setup](docs/SETUP_DATABASE.md)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🎨 Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Wagmi
- **Backend**: Express, Better Auth, TypeScript
- **Database**: PostgreSQL 14
- **Auth**: Better Auth with social providers + SIWE
- **Container**: Docker + Docker Compose

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch
3. Make changes
4. Test with `bun run dev`
5. Submit a pull request

---

## 📄 License

MIT

---

## 🙏 Credits

Built with [Better Auth](https://better-auth.com)

---

**Happy coding!** 🎉

For questions, see the docs or open an issue.
