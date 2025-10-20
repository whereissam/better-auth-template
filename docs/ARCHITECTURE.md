# Architecture Overview

Detailed explanation of the authentication architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React App (http://localhost:3000)                    │  │
│  │  ┌─────────────────┐  ┌──────────────────┐           │  │
│  │  │ useTwitterAuth  │  │    useSIWE       │           │  │
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
│                    /api/* proxy                             │
│                         │                                   │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │ HTTP + Cookies
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                       Backend                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express Server (http://localhost:3005)               │  │
│  │                                                        │  │
│  │  ┌────────────────────┐  ┌──────────────────────┐    │  │
│  │  │ Better Auth Router │  │  SIWE Router         │    │  │
│  │  │ /api/auth/*        │  │  /api/siwe/*         │    │  │
│  │  └─────────┬──────────┘  └──────────┬───────────┘    │  │
│  │            │                         │                │  │
│  │            └──────────┬──────────────┘                │  │
│  │                       │                               │  │
│  │               ┌───────▼────────┐                      │  │
│  │               │  PostgreSQL    │                      │  │
│  │               │   Connection   │                      │  │
│  │               └───────┬────────┘                      │  │
│  └───────────────────────┼────────────────────────────────┘  │
└─────────────────────────┼───────────────────────────────────┘
                          │
                          │
                    ┌─────▼──────┐
                    │ PostgreSQL │
                    │  Database  │
                    └────────────┘
```

## Authentication Flows

### 1. Twitter OAuth Flow

```
User                Frontend              Backend              Twitter
  │                    │                     │                    │
  │  Click "Login"     │                     │                    │
  ├───────────────────►│                     │                    │
  │                    │  POST /api/auth/    │                    │
  │                    │  signin/social/     │                    │
  │                    │  twitter            │                    │
  │                    ├────────────────────►│                    │
  │                    │                     │  OAuth redirect    │
  │                    │                     ├───────────────────►│
  │                    │                     │                    │
  │◄───────────────────┴─────────────────────┴────────────────────┤
  │                    Twitter Login Page                         │
  ├──────────────────────────────────────────────────────────────►│
  │                    User authorizes                            │
  │                                                                │
  │                                          Twitter redirects    │
  │                                          to callback          │
  │◄───────────────────────────────────────────────────────────────┤
  │                    │                     │                    │
  │  Redirect to       │  GET /api/auth/     │                    │
  │  callback          │  callback/twitter   │                    │
  │                    │  ?code=xxx          │                    │
  ├───────────────────►├────────────────────►│                    │
  │                    │                     │                    │
  │                    │                     │  Exchange code     │
  │                    │                     │  for token         │
  │                    │                     ├───────────────────►│
  │                    │                     │◄───────────────────┤
  │                    │                     │  Access token      │
  │                    │                     │                    │
  │                    │                     │  Create user       │
  │                    │                     │  & session         │
  │                    │                     │  in database       │
  │                    │                     │                    │
  │                    │  Set-Cookie:        │                    │
  │                    │  session_token      │                    │
  │◄───────────────────┴─────────────────────┤                    │
  │                    │                     │                    │
  │  Logged in ✅      │                     │                    │
```

### 2. SIWE (Sign-In With Ethereum) Flow

```
User                Frontend              Backend            Blockchain
  │                    │                     │                    │
  │  Connect Wallet    │                     │                    │
  ├───────────────────►│                     │                    │
  │                    │                     │                    │
  │  Click "Sign In    │                     │                    │
  │  with Ethereum"    │                     │                    │
  ├───────────────────►│                     │                    │
  │                    │                     │                    │
  │                    │ Generate SIWE       │                    │
  │                    │ message             │                    │
  │                    │                     │                    │
  │  Sign message      │                     │                    │
  │◄───────────────────┤                     │                    │
  ├───────────────────►│                     │                    │
  │  Signature         │                     │                    │
  │                    │                     │                    │
  │                    │ POST /api/siwe/sign │                    │
  │                    │ { address, message, │                    │
  │                    │   signature }       │                    │
  │                    ├────────────────────►│                    │
  │                    │                     │                    │
  │                    │                     │ Verify signature   │
  │                    │                     │ (cryptographic)    │
  │                    │                     │                    │
  │                    │                     │ Create user        │
  │                    │                     │ & session          │
  │                    │                     │ in database        │
  │                    │                     │                    │
  │                    │ Set-Cookie:         │                    │
  │                    │ session_token       │                    │
  │◄───────────────────┴─────────────────────┤                    │
  │                    │                     │                    │
  │  Logged in ✅      │                     │                    │
```

## Key Components

### Frontend

#### 1. **authClient** (`frontend/src/lib/auth.client.ts`)
- Created using Better Auth React
- Configured with `baseURL: window.location.origin`
- Uses proxy in development (`/api/*` → `localhost:3005`)
- Handles OAuth redirects and session management

#### 2. **useTwitterAuth** (`frontend/src/hooks/useTwitterAuth.ts`)
- Custom React hook for Twitter authentication
- Features:
  - Session caching (reduces API calls)
  - Auto-refresh on window focus
  - Rate limiting protection
  - Filters wallet addresses from usernames
- Methods: `login()`, `logout()`
- State: `user`, `isLoading`

#### 3. **useSIWE** (`frontend/src/hooks/useSIWE.ts`)
- Custom React hook for SIWE
- Integrates with wagmi for wallet connection
- Generates SIWE message following EIP-4361
- Sends signature to backend for verification
- Compatible with Better Auth sessions

### Backend

#### 1. **Better Auth Handler** (`backend/server.ts`)
- Mounted at `/api/auth/*`
- Handles all Better Auth routes automatically:
  - `/api/auth/signin/social/twitter` - Start OAuth
  - `/api/auth/callback/twitter` - OAuth callback
  - `/api/auth/session` - Get session
  - `/api/auth/signout` - Logout
  - `/api/auth/list-accounts` - List linked accounts
- Manages proxy headers (`x-forwarded-host`, `x-forwarded-proto`)
- Sets cookies correctly for same-domain requests

#### 2. **SIWE Router** (`backend/routes/siwe.ts`)
- Custom implementation of SIWE authentication
- Routes:
  - `POST /api/siwe/sign` - Verify signature & create session
  - `GET /api/siwe/verify` - Check session validity
- Creates Better Auth compatible sessions
- Stores wallet address as username

#### 3. **Database Layer** (`backend/lib/db.ts`)
- PostgreSQL connection pool
- Better Auth manages schema automatically
- Tables created on first run:
  - `user` - User profiles
  - `session` - Sessions with tokens
  - `account` - Linked social accounts

## Security Features

### 1. **Secure Cookies**
```typescript
{
  httpOnly: true,              // Not accessible via JavaScript
  secure: true,                // HTTPS only in production
  sameSite: 'lax',            // CSRF protection
  maxAge: 30 * 24 * 60 * 60 * 1000  // 30 days
}
```

### 2. **CORS Configuration**
```typescript
cors({
  origin: allowedOrigins,     // Whitelist specific origins
  credentials: true,          // Allow cookies
})
```

### 3. **Rate Limiting**
```typescript
rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,                   // 100 requests per window
})
```

### 4. **Security Headers** (Helmet)
- X-Frame-Options
- X-Content-Type-Options
- X-XSS-Protection
- Content-Security-Policy (configurable)

### 5. **Input Validation**
- SIWE message verification
- Signature cryptographic verification
- Address format validation

## Session Management

### Session Creation
1. User authenticates (Twitter OAuth or SIWE)
2. Backend creates record in `session` table
3. Backend generates random session token (UUID)
4. Token stored in HTTP-only cookie
5. Cookie sent with all requests via `credentials: "include"`

### Session Validation
1. Browser sends cookie automatically
2. Backend extracts token from cookie
3. Query database for session
4. Check expiration date
5. Return user data if valid

### Session Caching (Frontend)
```typescript
// Cache in memory for 60 seconds
sessionCache = {
  data: session,
  timestamp: Date.now()
}
```

Benefits:
- Reduces API calls
- Faster UI updates
- Less backend load

## Proxy Configuration

### Development
Vite proxy forwards `/api/*` to backend:
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:3005',
    changeOrigin: true,
  }
}
```

Frontend requests `http://localhost:3000/api/auth/session` → Backend at `http://localhost:3005/api/auth/session`

### Production
Reverse proxy (Nginx, Vercel, etc.) handles routing:
```nginx
location /api/ {
    proxy_pass http://backend:3005/api/;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
}
```

## Database Schema Details

### Better Auth Tables

**user**
- Stores user profiles
- Can be linked to multiple accounts (Twitter, wallet, etc.)
- `name` field used for display name or wallet address

**session**
- Stores active sessions
- Token is the cookie value
- Auto-expires based on `expiresAt`

**account**
- Links users to OAuth providers
- Stores provider-specific data (Twitter user ID, access tokens)
- Multiple accounts can link to same user

### Custom Extensions

You can extend with custom tables:
```sql
CREATE TABLE user_preferences (
  user_id VARCHAR(36) REFERENCES "user"("id"),
  theme VARCHAR(20),
  notifications BOOLEAN
);
```

## Error Handling

### Frontend
```typescript
try {
  await authClient.signIn.social({ provider: 'twitter' });
} catch (error) {
  // Handle rate limiting
  if (error.status === 429) {
    console.warn('Rate limited');
  }
  // Handle network errors
  else if (error.message.includes('Network')) {
    console.error('Network error');
  }
}
```

### Backend
```typescript
// Express error handler
app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});
```

## Performance Optimizations

1. **Session Caching** - Reduces API calls by 60 seconds
2. **Connection Pooling** - Reuses database connections
3. **Debouncing** - Prevents rapid re-auth checks
4. **Focus Detection** - Only re-checks auth when needed
5. **Account Caching** - Caches linked accounts for 60 seconds

## Deployment Considerations

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment guides.

Key points:
- Set `NODE_ENV=production`
- Use HTTPS for secure cookies
- Configure reverse proxy correctly
- Set strong `BETTER_AUTH_SECRET`
- Use managed PostgreSQL in production
- Enable connection pooling
- Set up monitoring and logging
