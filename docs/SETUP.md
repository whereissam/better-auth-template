# Setup Guide

Complete guide to set up the Better Auth template.

## Prerequisites

- **Bun** (recommended) or Node.js 18+
- **Wrangler** (installed automatically via `bun install`)

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url> my-auth-app
cd my-auth-app
```

### 2. Install Dependencies

```bash
# Backend
cd backend && bun install

# Frontend
cd ../frontend && bun install
```

### 3. Configure Environment Variables

#### Backend (Cloudflare Workers)

```bash
cd backend
cp .dev.vars.example .dev.vars
```

Edit `.dev.vars`:
```env
BETTER_AUTH_SECRET=your_secret_here_min_32_chars
```

Optional (for OAuth and email):
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
RESEND_API_KEY=re_your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Backend (Node.js / Bun)

```bash
cd backend
cp .env.example .env
```

Edit `.env` with the same variables above, plus:
```env
PORT=3005
DB_PATH=./data/local.db
BETTER_AUTH_URL=http://localhost:3005
TRUSTED_ORIGINS=http://localhost:3000
APP_URL=http://localhost:3000
```

#### Frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:8787
VITE_APP_URL=http://localhost:3000
```

### 4. Set Up Database

#### Cloudflare D1

```bash
cd backend

# Apply migrations locally
bun run db:migrate:local
```

#### Node.js / Bun (SQLite)

Database is created automatically when you run `bun run dev:node`. Migrations are applied on startup.

### 5. Start Development Servers

**Terminal 1 — Backend:**
```bash
cd backend
bun run dev        # Cloudflare Workers (port 8787)
# or
bun run dev:node   # Node.js / Bun (port 3005)
```

**Terminal 2 — Frontend:**
```bash
cd frontend
bun run dev
```

Visit http://localhost:3000

### 6. Test Authentication

#### Email/Password
1. Click "Sign in"
2. Switch to "Sign up" mode
3. Enter name, email, password (8+ chars)
4. Create account

#### Email OTP
1. Enter email address
2. Check backend console for OTP code (in dev)
3. Enter the 6-digit code

#### Magic Link
1. Enter email address
2. Check backend console for magic link URL (in dev)
3. Click or paste the link

#### OAuth (requires configuration)
1. Set up credentials (see [GOOGLE_OAUTH_SETUP.md](./GOOGLE_OAUTH_SETUP.md))
2. Click "Sign in with Google" or "Sign in with Twitter"

## Database Schema

Better Auth creates these tables (SQLite/D1):

```sql
-- User profiles
CREATE TABLE user (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  emailVerified INTEGER DEFAULT 0,
  image TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Sessions
CREATE TABLE session (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES user(id),
  expiresAt TEXT NOT NULL,
  token TEXT UNIQUE,
  ipAddress TEXT,
  userAgent TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Linked accounts (OAuth, credentials)
CREATE TABLE account (
  id TEXT PRIMARY KEY,
  userId TEXT REFERENCES user(id),
  accountId TEXT NOT NULL,
  providerId TEXT NOT NULL,
  accessToken TEXT,
  refreshToken TEXT,
  password TEXT,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);

-- Verification tokens (OTP, magic link, email verify)
CREATE TABLE verification (
  id TEXT PRIMARY KEY,
  identifier TEXT NOT NULL,
  value TEXT NOT NULL,
  expiresAt TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);
```

## Troubleshooting

### Cookies not working
- Check Vite proxy points to correct backend port
- Ensure `credentials: "include"` in auth client
- Verify CORS origins match frontend URL

### OAuth callback fails
- Ensure callback URL in provider dashboard matches `BETTER_AUTH_URL`
- Check that `BETTER_AUTH_URL` is set correctly (not `APP_URL`)
- Verify no extra spaces in env values

### D1 migration errors
```bash
# Check migration status
npx wrangler d1 migrations list DB --local

# Re-apply
bun run db:migrate:local
```

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [Hono Documentation](https://hono.dev/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler Documentation](https://developers.cloudflare.com/workers/wrangler/)
