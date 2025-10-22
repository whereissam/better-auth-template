# Better Auth Template

Production-ready authentication template with Better Auth, featuring Email/Password, Twitter/Google OAuth, SIWE (Sign-In with Ethereum), Magic Links, and Email OTP.

## ✨ Features

### Core Authentication
- 🔐 **Email & Password Auth** with required email verification
- 🔑 **Password Reset** via Email OTP (6-digit code) or Magic Link
- 🐦 **Twitter/X OAuth** - One-click social sign-in
- 🔍 **Google OAuth** - One-click social sign-in
- 🦊 **Sign-In With Ethereum (SIWE)** - Web3 wallet authentication
- 🔗 **Account Linking** - Connect wallet + social + email to one account

### User Experience
- ✅ **Auto Sign-In After Verification** - No need to manually sign in after email verification
- 📧 **Smart Resend** - Resend verification email with 60-second cooldown timer
- 🎯 **Context-Aware Error Messages** - Different messages for sign-up vs sign-in failures
- 🧹 **Auto Error Clearing** - Errors clear when navigating between forms
- 🎨 **Beautiful UI** - Polished auth flows with Tailwind CSS
- ⚡ **Instant Feedback** - Loading states, success banners, and error handling

### Developer Experience
- 🚀 **Hot Reload** - Fast development with Vite HMR + Bun watch mode
- 🐳 **Dockerized** - One-command setup with Docker Compose
- 📧 **Dev Email Logs** - See all emails in console during development
- 🔒 **Production Ready** - Security best practices built-in
- 📝 **TypeScript** - Full type safety across frontend and backend

## ⚡ Quick Start

### Prerequisites
- **Bun** runtime installed ([https://bun.sh](https://bun.sh))
- **Docker Desktop** installed and running
- **Resend Account** (optional, for sending emails - [https://resend.com](https://resend.com))

### One-Command Start (Easiest)

```bash
# From root directory - starts everything!
docker-compose up -d
```

This will:
1. Start PostgreSQL database in Docker
2. Start backend API in Docker
3. Frontend runs separately (see below)

Then start the frontend:
```bash
cd frontend && bun install && bun run dev
```

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

- ✅ **Frontend**: React + Vite + TypeScript (runs on port 3000)
- ✅ **Backend**: Express + Better Auth (runs on port 3005)
- ✅ **Database**: PostgreSQL 14 (runs on port 5433)
- ✅ **PgAdmin**: Database management UI (runs on port 5051)
- ✅ **Email Service**: Resend integration for transactional emails

### Authentication Methods

#### Email & Password
- ✅ Sign up with email verification required
- ✅ Sign in with "Remember me" option
- ✅ Email verification with auto-sign-in after verification
- ✅ Resend verification email with 60-second cooldown
- ✅ Different error states for sign-up vs sign-in
- ✅ Password reset via Email OTP (6-digit code)
- ✅ Password reset via Magic Link (alternative method)

#### Social OAuth
- ✅ Twitter/X OAuth with profile sync
- ✅ Google OAuth with profile sync
- ✅ Account linking (connect multiple providers to one account)

#### Web3 Authentication
- ✅ Sign-In With Ethereum (SIWE)
- ✅ Multi-wallet support (MetaMask, WalletConnect, Coinbase, etc.)
- ✅ Wallet address linking to existing accounts
- ✅ Anonymous sign-in option

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

### Email Service Setup (Required for Email/Password Auth)

This template uses **Resend** for sending emails. Set up your account:

1. **Sign up for Resend**: [https://resend.com](https://resend.com)
2. **Get your API key**: Dashboard → API Keys → Create API Key
3. **Verify your domain** (optional for production, not needed for development)
4. **Update `backend/.env`**:
   ```env
   RESEND_API_KEY=re_your_api_key_here
   RESEND_FROM_EMAIL=noreply@yourdomain.com
   ```

**Development Mode:**
- In development, all emails are logged to the backend console
- You can see verification links and OTP codes directly in the logs
- No actual emails are sent unless Resend is configured

### OAuth Setup (Optional)

**Twitter OAuth:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create app, enable OAuth 2.0
3. Add callback: `http://localhost:3005/api/auth/callback/twitter`
4. Add credentials to `backend/.env`:
   ```env
   TWITTER_CLIENT_ID=your_client_id
   TWITTER_CLIENT_SECRET=your_client_secret
   ```

**Google OAuth:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create project → Enable OAuth 2.0
3. Add callback: `http://localhost:3005/api/auth/callback/google`
4. Add credentials to `backend/.env`:
   ```env
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

### Environment Variables

Backend environment variables are in `backend/.env`:

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
BETTER_AUTH_SECRET=dev-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3005

# CORS & Origins
ALLOWED_ORIGINS=http://localhost:3000
TRUSTED_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000

# Email Service (Resend)
RESEND_API_KEY=your_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OAuth (Optional)
TWITTER_CLIENT_ID=
TWITTER_CLIENT_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

**Note:** Docker Compose automatically loads `backend/.env` via the `env_file` directive.

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

### Email Verification Not Working?

**Check backend console logs:**
```bash
docker logs better-auth-backend --tail 50
```

Look for:
- 📧 Email sending confirmation
- 🔐 OTP codes (in development mode)
- 🔗 Magic link URLs

**Development Mode:** All emails are logged to console. Copy the verification link from logs and paste in browser.

### Database Connection Issues?

**Check if PostgreSQL is running:**
```bash
docker ps | grep postgres
```

**View database logs:**
```bash
docker logs better-auth-postgres
```

**Restart database:**
```bash
docker-compose restart postgres
```

### Port Conflicts?

Edit ports in `docker-compose.yml`:
```yaml
ports:
  - "3006:3005"  # Change backend port
  - "5434:5432"  # Change database port
```

### "Cannot GET /" Errors?

Make sure you're visiting the **frontend** URL:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3005

### Docker not running?
Start Docker Desktop and try again.

### Clean Restart:
```bash
docker-compose down
docker system prune -f
docker-compose up -d
```

### View All Logs:
```bash
# Backend logs
docker logs better-auth-backend -f

# Database logs
docker logs better-auth-postgres -f

# All services
docker-compose logs -f
```

---

## 🔐 Authentication Flows

### Email & Password Sign-Up Flow
1. User enters email, password, and name → Click "Create account"
2. Account created → **Email verification required**
3. User sees: "Check your email" message with resend option
4. User clicks verification link in email
5. **Auto-signed in** → Redirected to homepage with success banner ✅

### Email & Password Sign-In Flow
1. User enters email and password → Click "Sign in"
2. **If email not verified:** Yellow warning appears
   - Message: "You already have an account but haven't verified it yet"
   - Big blue "Resend verification email" button
   - 60-second cooldown after resending
3. **If email verified:** Sign in successful ✅

### Password Reset Flow (Email OTP)
1. Click "Forgot password?" → Enter email
2. Receive 6-digit OTP code via email
3. Enter OTP code → Verify
4. Enter new password → Reset successful ✅

### Social OAuth Flow
1. Click Twitter/Google button
2. Redirected to provider → Authorize
3. Redirected back → **Auto-signed in** ✅
4. Profile synced (name, email, avatar)

### SIWE (Web3) Flow
1. Click "Connect Wallet"
2. Select wallet (MetaMask, WalletConnect, etc.)
3. Sign message to prove ownership
4. **Auto-signed in** ✅
5. Wallet address linked to account

### Account Linking
- Sign in with email → Connect wallet → Link accounts
- Sign in with Twitter → Connect Google → Link accounts
- Sign in with wallet → Add email → Link accounts
- **One account, multiple sign-in methods!** 🔗

---

## 📚 Documentation

- [Docker Setup Guide](docs/DOCKER_SETUP.md)
- [Database Setup](docs/SETUP_DATABASE.md)
- [Google OAuth Setup](docs/GOOGLE_OAUTH_SETUP.md)
- [Architecture Overview](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

---

## 🎨 Tech Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite (lightning-fast HMR)
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + Viem + RainbowKit
- **Routing**: React Router v6
- **Auth Client**: Better Auth React

### Backend
- **Runtime**: Bun (faster than Node.js)
- **Framework**: Express with TypeScript
- **Auth**: Better Auth v1.3.28
- **Database ORM**: Kysely (type-safe SQL)
- **Email**: Resend
- **Security**: Helmet, HPP, CORS, Rate Limiting
- **Logging**: Winston + Morgan

### Database
- **PostgreSQL 14** with connection pooling
- **Migrations**: Better Auth CLI
- **Schema**: User, Session, Account, Verification, WalletAddress

### DevOps
- **Container**: Docker + Docker Compose
- **Hot Reload**: Bun watch + Vite HMR
- **Database UI**: PgAdmin 4

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
