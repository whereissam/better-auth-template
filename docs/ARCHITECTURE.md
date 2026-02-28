# Architecture Overview

Detailed explanation of the authentication architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React App (http://localhost:3000)                    │  │
│  │  ┌─────────────────┐  ┌──────────────────┐           │  │
│  │  │  useEmailAuth   │  │    useAuth       │           │  │
│  │  └────────┬────────┘  └────────┬─────────┘           │  │
│  │           │                     │                     │  │
│  │           └──────────┬──────────┘                     │  │
│  │                      │                                │  │
│  │              ┌───────▼────────┐                       │  │
│  │              │  authClient    │                       │  │
│  │              │ (Better Auth)  │                       │  │
│  │              └───────┬────────┘                       │  │
│  └──────────────────────┼────────────────────────────────┘  │
│                         │                                   │
│                    /api/* proxy                              │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTP + Cookies
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       Backend                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Hono Server                                          │  │
│  │  Cloudflare Workers (:8787) or Node.js (:3005)       │  │
│  │                                                       │  │
│  │  ┌────────────────────┐  ┌──────────────────────┐    │  │
│  │  │ Better Auth Router │  │  Email Service       │    │  │
│  │  │ /api/auth/*        │  │  (Resend API)        │    │  │
│  │  └─────────┬──────────┘  └──────────────────────┘    │  │
│  │            │                                          │  │
│  │    ┌───────▼────────┐                                 │  │
│  │    │  D1 (SQLite)   │                                 │  │
│  │    │  Database       │                                 │  │
│  │    └────────────────┘                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Options

```
Option A: Cloudflare                    Option B: Traditional
┌──────────────────────┐               ┌──────────────────────┐
│ Cloudflare Workers   │               │ Node.js / Bun        │
│ + D1 (SQLite)        │               │ + SQLite / PostgreSQL│
│                      │               │                      │
│ Entry: src/index.ts  │               │ Entry: src/node.ts   │
│ DB: Kysely + D1Dialect│              │ DB: better-sqlite3   │
│ Deploy: wrangler     │               │ Deploy: Docker / VPS │
└──────────────────────┘               └──────────────────────┘
```

## Authentication Flows

### 1. Email/Password Flow

```
User                Frontend              Backend
  │                    │                     │
  │  Sign Up           │                     │
  ├───────────────────►│                     │
  │                    │  POST /api/auth/    │
  │                    │  sign-up/email      │
  │                    ├────────────────────►│
  │                    │                     │  Create user
  │                    │                     │  Hash password
  │                    │                     │  Send verify email
  │                    │  Set-Cookie         │
  │◄───────────────────┴─────────────────────┤
  │  Logged in ✅       │                     │
```

### 2. OAuth Flow (Google / Twitter)

```
User                Frontend              Backend              Provider
  │                    │                     │                    │
  │  Click "Login"     │                     │                    │
  ├───────────────────►│                     │                    │
  │                    │  POST /api/auth/    │                    │
  │                    │  signin/social/     │                    │
  │                    │  google             │                    │
  │                    ├────────────────────►│                    │
  │                    │                     │  OAuth redirect    │
  │                    │                     ├───────────────────►│
  │◄───────────────────┴─────────────────────┴────────────────────┤
  │                    Provider Login Page                        │
  ├──────────────────────────────────────────────────────────────►│
  │                    User authorizes                            │
  │◄──────────────────────────────────────────────────────────────┤
  │                    │                     │                    │
  │  Redirect to       │  GET /api/auth/     │                    │
  │  callback          │  callback/google    │                    │
  ├───────────────────►├────────────────────►│                    │
  │                    │                     │  Exchange code     │
  │                    │                     ├───────────────────►│
  │                    │                     │◄───────────────────┤
  │                    │                     │  Create session    │
  │                    │  Set-Cookie         │                    │
  │◄───────────────────┴─────────────────────┤                    │
  │  Logged in ✅       │                     │                    │
```

### 3. Magic Link Flow

```
User                Frontend              Backend
  │                    │                     │
  │  Enter email       │                     │
  ├───────────────────►│                     │
  │                    │  POST /api/auth/    │
  │                    │  magic-link/        │
  │                    │  send               │
  │                    ├────────────────────►│
  │                    │                     │  Generate token
  │                    │                     │  Send email
  │                    │  200 OK             │
  │◄───────────────────┴─────────────────────┤
  │                                          │
  │  Click link in email                     │
  ├─────────────────────────────────────────►│
  │                     Verify token         │
  │                     Create session       │
  │  Set-Cookie + redirect                   │
  │◄─────────────────────────────────────────┤
  │  Logged in ✅                             │
```

## Key Components

### Frontend

#### 1. **authClient** (`frontend/src/lib/auth.client.ts`)
- Created using Better Auth React
- Configured with `baseURL: window.location.origin`
- Uses Vite proxy in development (`/api/*` → backend)
- Handles OAuth redirects and session management

#### 2. **useAuth** (`frontend/src/hooks/useAuth.ts`)
- Centralized auth hook for all methods
- Methods: `loginWithGoogle`, `loginWithTwitter`, `logout`
- State: `user`, `session`, `isLoading`

### Backend

#### 1. **Better Auth Handler** (`backend/src/index.ts`)
- Hono app mounted at `/api/auth/**`
- Routes handled automatically by Better Auth:
  - `/api/auth/sign-up/email` - Email sign up
  - `/api/auth/sign-in/email` - Email sign in
  - `/api/auth/signin/social/google` - Google OAuth
  - `/api/auth/callback/google` - OAuth callback
  - `/api/auth/get-session` - Get session
  - `/api/auth/sign-out` - Logout
  - `/api/auth/magic-link/send` - Send magic link
  - `/api/auth/email-otp/send` - Send OTP

#### 2. **Auth Factory** (`backend/src/lib/auth.ts`)
- `createAuth(config)` — portable factory function
- Accepts any Better Auth-compatible database
- Configures email/password, OAuth, magic link, email OTP
- Conditionally enables OAuth providers based on env vars

#### 3. **Email Service** (`backend/src/lib/email.ts`)
- Raw `fetch` to Resend API (no SDK — works everywhere)
- Functions: `sendEmail`, `sendOTP`, `sendMagicLinkEmail`
- Logs warning in dev when Resend is not configured

## Security Features

### 1. Secure Cookies
```typescript
{
  httpOnly: true,       // Not accessible via JavaScript
  secure: true,         // HTTPS only in production
  sameSite: 'lax',      // CSRF protection
}
```

### 2. CORS Configuration
```typescript
cors({
  origin: trustedOrigins,  // Whitelist specific origins
  credentials: true,       // Allow cookies
})
```

### 3. Rate Limiting
- Cloudflare: Use WAF Rate Limiting Rules (edge-level)
- Node.js: Add Hono rate limiter middleware

### 4. Password Security
- scrypt hashing (OWASP recommended)
- Min 8 chars, max 128 chars
- Email verification required

## Session Management

### Session Creation
1. User authenticates (email, OAuth, magic link, OTP)
2. Backend creates record in `session` table
3. Backend generates random session token
4. Token stored in HTTP-only cookie
5. Cookie sent with all requests via `credentials: "include"`

### Session Validation
1. Browser sends cookie automatically
2. Backend extracts token from cookie
3. Query database for session
4. Check expiration date
5. Return user data if valid

## Proxy Configuration

### Development
Vite proxy forwards `/api/*` to backend:
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8787',  // or :3005 for Node.js
    changeOrigin: true,
  }
}
```

### Production (Cloudflare)
Frontend and backend on same domain via Cloudflare routing — no proxy needed.

### Production (Self-hosted)
Reverse proxy (Nginx, Caddy) handles routing:
```nginx
location /api/ {
    proxy_pass http://backend:3005/api/;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Deployment Considerations

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

Key points:
- Use HTTPS for secure cookies
- Set strong `BETTER_AUTH_SECRET` (min 32 chars)
- Configure CORS with exact origins (no wildcards)
- Set up monitoring (health check at `/health`)
