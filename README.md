# Better Auth Template

A production-ready authentication starter kit built with [Better Auth](https://better-auth.com), featuring multiple authentication methods, account linking, and a modern tech stack. Deploy to **Cloudflare Workers** or any **Node.js / Bun** host.

## Features

### Authentication Methods
- **Email & Password** - Sign up/sign in with email verification
- **Password Reset** - Secure reset via email link
- **Email OTP** - 6-digit one-time password verification
- **Magic Link** - Passwordless email sign-in
- **Social OAuth** - Twitter/X and Google integration
- **Web3 (SIWE)** - Sign-In With Ethereum wallet authentication
- **Passkey (WebAuthn)** - Passwordless auth with biometrics or device PIN
- **Account Linking** - Connect multiple auth methods to one account

### Deployment Options
- **Cloudflare Workers + D1** - Serverless, globally distributed (default)
- **Node.js / Bun + SQLite** - Self-hosted on any VPS or Docker
- Same codebase, same auth logic — just a different entry point

## Quick Start

### Prerequisites
- [Bun](https://bun.sh) runtime
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/) (for Cloudflare deployment)

### Option A: Cloudflare Workers (Recommended)

```bash
# Clone the repository
git clone https://github.com/whereissam/better-auth-template.git
cd better-auth-template

# Install dependencies
cd backend && bun install && cd ../frontend && bun install && cd ..

# Set up local D1 database
cd backend
cp .dev.vars.example .dev.vars   # edit with your secrets
bun run db:migrate:local

# Start backend (Wrangler dev server)
bun run dev
```

In a new terminal:
```bash
cd frontend && bun run dev
```

### Option B: Node.js / Bun + SQLite

```bash
git clone https://github.com/whereissam/better-auth-template.git
cd better-auth-template

cd backend && bun install && cd ../frontend && bun install && cd ..

# Configure environment
cd backend
cp .env.example .env   # edit with your secrets

# Start backend (auto-creates SQLite DB and runs migrations)
bun run dev:node
```

In a new terminal:
```bash
cd frontend && bun run dev
```

### Option C: Docker

```bash
git clone https://github.com/whereissam/better-auth-template.git
cd better-auth-template

cp backend/.env.example backend/.env   # edit with your secrets
docker-compose up -d
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | React application |
| Backend (Wrangler) | http://localhost:8787 | Cloudflare Workers dev |
| Backend (Node.js) | http://localhost:3005 | Node.js / Bun server |

## Available Commands

### Root Directory

| Command | Description |
|---------|-------------|
| `bun run dev:local` | Start backend + frontend concurrently |
| `docker-compose up -d` | Start all services (Docker) |
| `docker-compose down` | Stop all services |
| `bun run test` | Run all tests |

### Backend (`cd backend`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Wrangler dev server (D1) |
| `bun run dev:node` | Start Node.js/Bun server (SQLite) |
| `bun run deploy` | Deploy to Cloudflare Workers |
| `bun run db:migrate:local` | Apply D1 migrations locally |
| `bun run db:migrate` | Apply D1 migrations (remote) |
| `bun run db:create` | Create D1 database |
| `bun run test` | Run tests |

### Frontend (`cd frontend`)

| Command | Description |
|---------|-------------|
| `bun run dev` | Start Vite dev server |
| `bun run build` | Build for production |
| `bun run test` | Run tests |

## Configuration

### Environment Variables

**Cloudflare Workers** — copy `backend/.dev.vars.example` to `backend/.dev.vars`:

```env
BETTER_AUTH_SECRET=your_random_secret_key_here_min_32_chars
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=noreply@yourdomain.com
SIWE_DOMAIN=localhost:3000
PASSKEY_RP_ID=localhost
PASSKEY_RP_NAME=Better Auth Template
PASSKEY_ORIGIN=http://localhost:3000
```

**Node.js / Bun** — copy `backend/.env.example` to `backend/.env`:

```env
PORT=3005
DB_PATH=./data/local.db
BETTER_AUTH_SECRET=your_random_secret_key_here_min_32_chars
BETTER_AUTH_URL=http://localhost:3005
TRUSTED_ORIGINS=http://localhost:3000
APP_URL=http://localhost:3000
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=noreply@yourdomain.com
SIWE_DOMAIN=localhost:3000
SIWE_EMAIL_DOMAIN=localhost
PASSKEY_RP_ID=localhost
PASSKEY_RP_NAME=Better Auth Template
PASSKEY_ORIGIN=http://localhost:3000
```

### Email Setup (Resend)

1. Create an account at [resend.com](https://resend.com)
2. Generate an API key from [resend.com/api-keys](https://resend.com/api-keys)
3. Add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to your environment

**Note:** In development, emails are logged to console when `RESEND_API_KEY` is not set.

### OAuth Setup

#### Twitter/X
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create an app with OAuth 2.0
3. Set callback URL: `http://localhost:8787/api/auth/callback/twitter` (Wrangler) or `http://localhost:3005/api/auth/callback/twitter` (Node.js)
4. Add credentials to your environment

#### Google
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Set callback URL: `http://localhost:8787/api/auth/callback/google` (Wrangler) or `http://localhost:3005/api/auth/callback/google` (Node.js)
4. Add credentials to your environment

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
├── backend/                 # Hono + Better Auth
│   ├── src/
│   │   ├── index.ts         # Cloudflare Workers entry point
│   │   ├── node.ts          # Node.js / Bun entry point
│   │   └── lib/
│   │       ├── auth.ts      # Auth factory (portable)
│   │       └── email.ts     # Email via Resend API
│   ├── migrations/          # D1 / SQLite migrations
│   ├── wrangler.toml        # Cloudflare Workers config
│   └── package.json
├── docs/                    # Documentation
├── docker-compose.yml       # Docker (Node.js + SQLite)
└── package.json             # Root scripts
```

## Tech Stack

### Frontend
| Technology | Description |
|------------|-------------|
| [React](https://react.dev) 19 | UI library |
| [TypeScript](https://www.typescriptlang.org) 5.8 | Type-safe JavaScript |
| [Vite](https://vitejs.dev) 7 | Build tool & dev server |
| [Tailwind CSS](https://tailwindcss.com) 4 | Utility-first CSS |
| [React Router](https://reactrouter.com) 7 | Client-side routing |
| [TanStack Query](https://tanstack.com/query) 5 | Server state management |
| [Wagmi](https://wagmi.sh) 2 | React hooks for Ethereum |
| [Viem](https://viem.sh) 2 | TypeScript Ethereum library |
| [RainbowKit](https://www.rainbowkit.com) 2 | Wallet connection UI |

### Backend
| Technology | Description |
|------------|-------------|
| [Hono](https://hono.dev) 4 | Lightweight web framework (Workers, Node.js, Bun) |
| [Better Auth](https://better-auth.com) 1.4 | Authentication framework |
| [Kysely](https://kysely.dev) + D1Dialect | Query builder for Cloudflare D1 |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | SQLite for Node.js/Bun |
| [Resend](https://resend.com) | Email delivery (raw fetch) |

### Web3 / Auth
| Technology | Description |
|------------|-------------|
| [SIWE](https://login.xyz) | Sign-In With Ethereum (EIP-4361) |
| [WebAuthn](https://webauthn.io) | Passkey / biometric authentication |

### Infrastructure
| Technology | Description |
|------------|-------------|
| [Cloudflare Workers](https://workers.cloudflare.com) | Serverless edge deployment |
| [Cloudflare D1](https://developers.cloudflare.com/d1) | Serverless SQLite database |
| [Docker](https://www.docker.com) | Container platform (for self-hosted) |

## Troubleshooting

### View Logs
```bash
# Wrangler dev logs (shown in terminal)
bun run dev

# Docker logs
docker logs better-auth-backend -f
docker-compose logs -f
```

### Common Issues

**Port already in use:**
```bash
lsof -i :8787   # or :3005
kill -9 <PID>
```

**D1 migration errors:**
```bash
# Re-run migrations locally
bun run db:migrate:local
```

**Email verification not working:**
- Check backend console for email logs
- In development without `RESEND_API_KEY`, verification links are printed to console

**SIWE not working:**
- Ensure `SIWE_DOMAIN` matches your frontend origin
- Check that the `walletAddress` table exists in your database

## Documentation

- [Quick Start](docs/QUICKSTART.md)
- [Setup Guide](docs/SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Database Setup](docs/SETUP_DATABASE.md)
- [Docker Setup](docs/DOCKER_SETUP.md)
- [Auth Usage](docs/AUTH_USAGE.md)
- [Email & Password Auth](docs/EMAIL_PASSWORD_AUTH.md)
- [Forgot Password](docs/FORGOT_PASSWORD.md)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)

## License

MIT

## Credits

Built with [Better Auth](https://better-auth.com)
