# Better Auth Template

A production-ready authentication starter kit built with [Better Auth](https://better-auth.com), featuring multiple authentication methods, account linking, and a modern tech stack.

## Features

### Authentication Methods
- **Email & Password** - Sign up/sign in with email verification
- **Password Reset** - Via 6-digit OTP or Magic Link
- **Social OAuth** - Twitter/X and Google integration
- **Web3 (SIWE)** - Sign-In With Ethereum wallet authentication
- **Passkey (WebAuthn)** - Passwordless auth with biometrics or device PIN
- **Account Linking** - Connect multiple auth methods to one account

### Developer Experience
- Full TypeScript support across frontend and backend
- Hot reload with Vite HMR and Bun watch mode
- Dockerized development environment
- Email logs in console during development
- Security best practices built-in

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) runtime
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

### Installation

```bash
# Clone the repository
git clone https://github.com/whereissam/better-auth-template.git
cd better-auth-template

# Start backend services (PostgreSQL + API)
docker-compose up -d

# Start frontend (in a new terminal)
cd frontend && bun install && bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend API | http://localhost:3005 | Express + Better Auth |
| PostgreSQL | localhost:5433 | Database |
| PgAdmin | http://localhost:5051 | Database management UI |

### PgAdmin Credentials
- **Email:** `admin@example.com`
- **Password:** `admin`

To connect to the database in PgAdmin:
- **Host:** `postgres` (use container name, not localhost)
- **Port:** `5432`
- **Username:** `postgres`
- **Password:** `postgres`
- **Database:** `auth_db`

## Available Commands

### Root Directory

| Command | Description |
|---------|-------------|
| `docker-compose up -d` | Start all services |
| `docker-compose down` | Stop all services |
| `docker-compose logs -f` | View logs |
| `bun run docker:build` | Build and start Docker services |
| `bun run docker:clean` | Remove all containers and volumes |
| `bun run db:only` | Start PostgreSQL only |
| `bun run dev:local` | Run backend + frontend locally |

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start server with database |
| `bun run dev:server` | Start server only |
| `bun run db:migrate` | Run database migrations |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server |
| `bun run build` | Build for production |

## Configuration

### Environment Variables

Copy `backend/.env.example` to `backend/.env` and configure:

```env
# Database
DB_HOST=localhost
DB_PORT=5433
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=auth_db

# Server
PORT=3005
NODE_ENV=development

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-change-in-production
BETTER_AUTH_URL=http://localhost:3005

# CORS
ALLOWED_ORIGINS=http://localhost:3000
TRUSTED_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000

# Email (Resend)
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OAuth (Optional)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

### Email Setup (Resend)

1. Create an account at [resend.com](https://resend.com)
2. Generate an API key
3. Add to `backend/.env`:
   ```env
   RESEND_API_KEY=re_xxxxx
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

**Note:** In development mode, all emails are logged to the console. No Resend account is required for local development.

### OAuth Setup

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app with OAuth 2.0
3. Set callback URL: `http://localhost:3005/api/auth/callback/twitter`
4. Add credentials to `backend/.env`

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create OAuth 2.0 credentials
3. Set callback URL: `http://localhost:3005/api/auth/callback/google`
4. Add credentials to `backend/.env`

## Project Structure

```
better-auth-template/
├── frontend/                # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and auth client
│   │   └── pages/           # Page components
│   └── package.json
├── backend/                 # Express + Better Auth
│   ├── lib/                 # Auth configuration
│   ├── routes/              # API routes
│   ├── docker/              # Database init scripts
│   └── package.json
├── docs/                    # Documentation
├── docker-compose.yml       # Docker configuration
└── package.json             # Root scripts
```

## Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| [React](https://react.dev) | 19 | UI library with latest features |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Type-safe JavaScript |
| [Vite](https://vitejs.dev) | 6 | Fast build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) | 3.4 | Utility-first CSS framework |
| [React Router](https://reactrouter.com) | 7 | Client-side routing |
| [TanStack Query](https://tanstack.com/query) | 5 | Server state management |
| [Wagmi](https://wagmi.sh) | 2 | React hooks for Ethereum |
| [Viem](https://viem.sh) | 2 | TypeScript Ethereum library |
| [RainbowKit](https://www.rainbowkit.com) | 2 | Wallet connection UI |
| [Vitest](https://vitest.dev) | 4 | Unit testing framework |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| [Bun](https://bun.sh) | Latest | Fast JavaScript runtime |
| [Express](https://expressjs.com) | 5 | Web framework |
| [TypeScript](https://www.typescriptlang.org) | 5.8 | Type-safe JavaScript |
| [Better Auth](https://better-auth.com) | 1.4 | Authentication framework |
| [PostgreSQL](https://www.postgresql.org) | 14 | Relational database |
| [Resend](https://resend.com) | 6 | Email delivery service |
| [Winston](https://github.com/winstonjs/winston) | 3 | Logging library |
| [Helmet](https://helmetjs.github.io) | 8 | Security middleware |

### Web3 / Blockchain
| Technology | Description |
|------------|-------------|
| [SIWE](https://login.xyz) | Sign-In With Ethereum standard |
| [WebAuthn](https://webauthn.io) | Passkey/biometric authentication |
| EIP-4361 | Ethereum authentication message format |

### Infrastructure
| Technology | Description |
|------------|-------------|
| [Docker](https://www.docker.com) | Container platform |
| [Docker Compose](https://docs.docker.com/compose) | Multi-container orchestration |
| [PgAdmin](https://www.pgadmin.org) | PostgreSQL admin interface |

## Troubleshooting

### View Logs
```bash
# Backend logs
docker logs better-auth-backend -f

# Database logs
docker logs better-auth-postgres -f

# All services
docker-compose logs -f
```

### Reset Everything
```bash
docker-compose down
docker system prune -f
docker-compose up -d
```

### Common Issues

**Port already in use:**
```bash
# Check what's using a port
lsof -i :3005

# Kill the process
kill -9 <PID>
```

**Database connection failed:**
- Ensure Docker is running
- Check if PostgreSQL container is healthy: `docker ps`
- Verify `backend/.env` has correct database credentials

**Email verification not working:**
- Check backend console for email logs
- In development, verification links are printed to console

## Documentation

- [Docker Setup](docs/DOCKER_SETUP.md)
- [Database Setup](docs/SETUP_DATABASE.md)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

MIT

## Credits

Built with [Better Auth](https://better-auth.com)
