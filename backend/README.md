# Backend - Better Auth Template

Express.js backend with Better Auth, featuring Twitter/Google OAuth and SIWE (Sign-In with Ethereum).

## 🚀 Quick Start

### Prerequisites
- Bun runtime installed
- Docker Desktop running (for PostgreSQL)

### Development

```bash
cd backend

# Install dependencies
bun install

# Start database + run migrations + start server
bun run dev

# Server runs on http://localhost:3005
```

---

## 📋 Available Commands

| Command | Description |
|---------|-------------|
| `bun run dev` | Start DB + migrate + run server (all-in-one) |
| `bun run dev:server` | Start server only (DB must be running) |
| `bun run db:migrate` | Run Better Auth database migrations |
| `bun run db:generate` | Generate Better Auth schema |
| `bun run start` | Production server (no watch) |
| `bun run build` | Compile TypeScript |

---

## 🗄️ Database

### PostgreSQL Configuration

**Connection Details:**
- Host: `localhost`
- Port: `5433` (mapped from Docker container's 5432)
- Database: `auth_db`
- User: `postgres`
- Password: `postgres`

### Database Management

**Start Database:**
```bash
cd .. && docker-compose up -d postgres
```

**Stop Database:**
```bash
cd .. && docker-compose down
```

**Access PgAdmin:**
- URL: http://localhost:5051
- Email: `admin@example.com`
- Password: `admin`

**Direct Database Access:**
```bash
docker exec -it better-auth-postgres psql -U postgres -d auth_db
```

### Migrations

Better Auth automatically creates tables when you run:
```bash
bun run db:migrate
```

**Tables Created:**
- `user` - User accounts
- `session` - Active sessions
- `account` - Linked OAuth accounts (Twitter, Google)
- `verification` - Email/phone verification tokens
- `walletAddress` - SIWE wallet addresses

---

## 🔐 Authentication

### Supported Methods

1. **Twitter/X OAuth**
2. **Google OAuth**
3. **SIWE (Sign-In with Ethereum)**

### Configuration

Environment variables are in `backend/.env`:

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

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Better Auth
BETTER_AUTH_SECRET=dev-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3005

# CORS
ALLOWED_ORIGINS=http://localhost:3000
TRUSTED_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000
```

### OAuth Setup

**Twitter:**
1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create new app
3. Enable OAuth 2.0
4. Add redirect URI: `http://localhost:3000/api/auth/callback/twitter`
5. Copy Client ID and Client Secret to `.env`

**Google:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client ID
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env`

---

## 🏗️ Project Structure

```
backend/
├── lib/
│   ├── auth.ts           # Better Auth configuration
│   ├── db.ts             # PostgreSQL connection pool
│   └── logger.ts         # Winston logger
├── routes/
│   └── siwe.ts           # SIWE-specific routes
├── docker/
│   └── init-db.sql       # Database initialization
├── migrations/           # Custom migrations
├── scripts/              # Utility scripts
├── server.ts             # Express server entry point
├── .env                  # Environment variables
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

---

## 🔧 API Endpoints

### Authentication

**Better Auth Routes** (handled automatically):
- `GET /api/auth/session` - Get current session
- `POST /api/auth/sign-out` - Sign out
- `POST /api/auth/sign-in/social` - OAuth login
- `GET /api/auth/callback/:provider` - OAuth callback

### SIWE Routes

- `POST /api/auth/siwe/nonce` - Get nonce for SIWE
- `POST /api/auth/siwe/verify` - Verify SIWE signature

### Health Check

- `GET /health` - Server health status

---

## 🛡️ Security Features

- **Helmet.js** - Security headers
- **HPP** - HTTP Parameter Pollution protection
- **CORS** - Configured for frontend origin
- **Rate Limiting** - 100 requests per 15 minutes
- **Secure Cookies** - httpOnly, secure (in production)
- **Environment-based Config** - Different settings for dev/prod

---

## 📝 Environment Variables

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DB_HOST` | Database host | `localhost` |
| `DB_PORT` | Database port | `5433` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | `postgres` |
| `DB_NAME` | Database name | `auth_db` |
| `PORT` | Server port | `3005` |
| `BETTER_AUTH_SECRET` | Auth encryption key | Generate with `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Backend URL | `http://localhost:3005` |

### Optional (OAuth)

| Variable | Description |
|----------|-------------|
| `TWITTER_CLIENT_ID` | Twitter OAuth Client ID |
| `TWITTER_CLIENT_SECRET` | Twitter OAuth Client Secret |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret |

---

## 🐛 Troubleshooting

### Database Connection Fails

**Problem:** `error: database "auth_db" does not exist`

**Solution:**
```bash
# Make sure database is running
docker ps | grep postgres

# If not running, start it
cd .. && docker-compose up -d postgres

# Wait 10 seconds for it to be ready
sleep 10

# Try again
bun run dev
```

### Port 3005 Already in Use

**Solution:**
```bash
# Find process using port
lsof -ti:3005

# Kill it
lsof -ti:3005 | xargs kill -9

# Or change PORT in .env
PORT=3006
```

### Migrations Not Running

**Solution:**
```bash
# Run migrations manually
bun run db:migrate

# If that fails, check database connection
docker exec better-auth-postgres psql -U postgres -d auth_db -c "SELECT 1"
```

### OAuth Not Working

**Check:**
1. ✅ Client ID and Secret in `.env`
2. ✅ Redirect URIs configured in OAuth provider
3. ✅ `APP_URL` matches your frontend URL
4. ✅ CORS `ALLOWED_ORIGINS` includes frontend URL

---

## 🚀 Deployment

### Environment Setup

1. Create `.env.production` with production values
2. Set `NODE_ENV=production`
3. Generate secure `BETTER_AUTH_SECRET`
4. Update `BETTER_AUTH_URL` to production URL
5. Update OAuth redirect URIs to production URLs

### Docker Deployment

```bash
# Build production image
docker build -t better-auth-backend .

# Run with production env
docker run -d \
  --env-file .env.production \
  -p 3005:3005 \
  better-auth-backend
```

---

## 📚 Additional Resources

- [Better Auth Docs](https://better-auth.com/docs)
- [Better Auth Plugins](https://better-auth.com/docs/plugins)
- [SIWE Documentation](https://docs.login.xyz/)
- [Express.js Docs](https://expressjs.com/)

---

## 🤝 Contributing

See main [README.md](../README.md) for contribution guidelines.

---

**Built with Better Auth** 🔐
