# Setup Guide

Complete guide to set up the Better Auth template with Twitter OAuth and SIWE.

## Prerequisites

- **Node.js** 18+ or **Bun** (recommended)
- **PostgreSQL** 14+
- **Twitter Developer Account** (for OAuth)
- **Wallet** (MetaMask, etc.) for SIWE testing

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url> my-auth-app
cd my-auth-app
```

### 2. Set Up PostgreSQL Database

#### Option A: Using Docker (Recommended)

```bash
# Start PostgreSQL and PgAdmin
docker-compose up -d

# Check if running
docker-compose ps
```

Access PgAdmin at `http://localhost:5050`:
- Email: `admin@example.com`
- Password: `admin`

#### Option B: Local PostgreSQL

```bash
# Create database
createdb auth_db

# Or using psql
psql -U postgres
CREATE DATABASE auth_db;
\q
```

### 3. Configure Twitter OAuth

1. Go to [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. Create a new App (or use existing)
3. Navigate to "User authentication settings"
4. Enable **OAuth 2.0**
5. Set permissions: **Read** (minimum)
6. Add Callback URL:
   - Development: `http://localhost:3000/api/auth/callback/twitter`
   - Production: `https://yourdomain.com/api/auth/callback/twitter`
7. Copy **Client ID** and **Client Secret**

### 4. Set Up Environment Variables

#### Backend

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres  # Change in production!
DB_NAME=auth_db

# Twitter OAuth
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here

# Better Auth Secret (generate new one!)
# Generate: openssl rand -base64 32
BETTER_AUTH_SECRET=generated_secret_here

# Server
PORT=3005
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000
TRUSTED_ORIGIN=http://localhost:3000
APP_URL=http://localhost:3000
```

#### Frontend

```bash
cd ../frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3005
VITE_APP_URL=http://localhost:3000
```

### 5. Install Dependencies

#### Using npm

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### Using Bun (Faster)

```bash
# Backend
cd backend
bun install

# Frontend
cd ../frontend
bun install
```

### 6. Start Development Servers

Open two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev  # or: bun run dev
```

You should see:
```
✅ Database connected successfully
🚀 Server running on port 3005
📍 Environment: development
🔐 Allowed origins: http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev  # or: bun run dev
```

Visit `http://localhost:3000`

### 7. Test Authentication

#### Test Twitter OAuth

1. Click "Connect with Twitter" button
2. Authorize the app on Twitter
3. You'll be redirected back with session created
4. Your Twitter username and avatar should display

#### Test SIWE (Sign-In With Ethereum)

1. Connect your wallet (MetaMask, WalletConnect, etc.)
2. Click "Sign In with Ethereum"
3. Sign the message in your wallet
4. Session created with wallet address

## Database Schema

Better Auth automatically creates these tables:

```sql
-- User profiles
CREATE TABLE "user" (
  "id" VARCHAR(36) PRIMARY KEY,
  "name" VARCHAR(255),
  "email" VARCHAR(255),
  "emailVerified" BOOLEAN,
  "image" TEXT,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Sessions
CREATE TABLE "session" (
  "id" VARCHAR(36) PRIMARY KEY,
  "userId" VARCHAR(36) REFERENCES "user"("id"),
  "expiresAt" TIMESTAMP,
  "token" VARCHAR(255) UNIQUE,
  "ipAddress" VARCHAR(45),
  "userAgent" TEXT,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);

-- Linked social accounts
CREATE TABLE "account" (
  "id" VARCHAR(36) PRIMARY KEY,
  "userId" VARCHAR(36) REFERENCES "user"("id"),
  "accountId" VARCHAR(255),
  "providerId" VARCHAR(255),
  "accessToken" TEXT,
  "refreshToken" TEXT,
  "expiresAt" TIMESTAMP,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

## Troubleshooting

### Database Connection Failed

```bash
# Check if PostgreSQL is running
docker-compose ps

# Or for local installation
pg_isready -U postgres
```

### Twitter OAuth Fails

**Error: "Callback URL mismatch"**
- Ensure callback URL in Twitter Dev Portal exactly matches: `http://localhost:3000/api/auth/callback/twitter`
- Check that `APP_URL` in `.env` matches your frontend URL

**Error: "Invalid credentials"**
- Verify `TWITTER_CLIENT_ID` and `TWITTER_CLIENT_SECRET` are correct
- Ensure no extra spaces in `.env` file

### Cookies Not Working

**Symptoms:**
- Login works but session not persisted
- Always logged out on refresh

**Solutions:**
- Check Vite proxy configuration in `vite.config.ts`
- Ensure `credentials: "include"` in auth client
- Verify CORS `credentials: true` in backend
- For localhost, domain should be `undefined` or `localhost`

### SIWE Signature Verification Fails

- Check that wallet is connected before signing
- Verify `chainId` matches wallet network
- Ensure message format matches SIWE spec

## Next Steps

- Add more OAuth providers (GitHub, Google, etc.)
- Implement email/password authentication
- Add user profile management
- Set up protected routes
- Deploy to production (see DEPLOYMENT.md)

## Resources

- [Better Auth Documentation](https://www.better-auth.com/docs)
- [SIWE Documentation](https://docs.login.xyz/)
- [wagmi Documentation](https://wagmi.sh/)
- [Viem Documentation](https://viem.sh/)
