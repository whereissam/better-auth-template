# Cloudflare Workers Deployment Guide

Complete guide to deploy your Better Auth backend to Cloudflare Workers using Hono.

## Why Cloudflare Workers?

### Advantages over Traditional Hosting

**Performance:**
- ⚡ 0ms cold starts (vs. seconds for containers)
- 🌍 Global edge network (275+ cities worldwide)
- 🚀 Faster response times for users globally
- 📊 Automatic scaling (0 to millions of requests)

**Cost:**
- 💰 100,000 free requests/day
- 📈 $5 per 10 million requests (vs. $15-50/month for VPS)
- 🎯 Pay only for what you use
- 💵 No infrastructure costs

**Developer Experience:**
- 🔧 Simple deployment (`wrangler deploy`)
- 📝 Built-in logging and analytics
- 🔄 Instant rollbacks
- 🛠️ No server management

## Architecture Changes

### Express (Before)
```typescript
// Express → Web API conversion needed
app.use('/api/auth', async (req, res) => {
  const webRequest = new Request(url, { ... }); // Convert Express → Web API
  const response = await auth.handler(webRequest);
  // Convert Web API → Express response
  res.status(response.status).send(await response.text());
});
```

### Hono (After - Cloudflare Workers)
```typescript
// Direct Web API - no conversion needed!
app.all('/api/auth/**', async (c) => {
  return auth.handler(c.req.raw); // Native Web API
});
```

**Benefits:**
- ✅ 50% less code
- ✅ No Express → Web API conversion overhead
- ✅ Native Cloudflare Workers compatibility
- ✅ Better Auth works out of the box

## Prerequisites

1. **Cloudflare Account** (free tier works)
   - Sign up at https://dash.cloudflare.com/sign-up

2. **Wrangler CLI** (already installed in this branch)
   ```bash
   npm install -g wrangler
   # or use the local version: npx wrangler
   ```

3. **PostgreSQL Database** (serverless recommended)
   - **Neon** (recommended): https://neon.tech
   - **Supabase**: https://supabase.com
   - **Railway**: https://railway.app

## Step 1: Set Up PostgreSQL with Cloudflare

### Option A: Neon (Recommended)

1. **Create Neon Account**: https://neon.tech
2. **Create Database**:
   - Name: `better-auth-db`
   - Region: Choose closest to your users
3. **Get Connection String**:
   ```
   postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/better-auth-db?sslmode=require
   ```

### Option B: Supabase

1. **Create Project**: https://app.supabase.com
2. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" (URI format)

### Set Up Hyperdrive (Cloudflare's PostgreSQL Connection Pooling)

```bash
cd backend

# Login to Cloudflare
npx wrangler login

# Create Hyperdrive connection
npx wrangler hyperdrive create better-auth-db \
  --connection-string="postgresql://user:password@host:5432/dbname"
```

This will output a Hyperdrive ID. Copy it!

```
Created Hyperdrive 'better-auth-db'
ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

Update `wrangler.toml`:
```toml
[[hyperdrive]]
binding = "DB"
id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # Your Hyperdrive ID
```

## Step 2: Configure Environment Variables

### Set Cloudflare Secrets

```bash
cd backend

# Better Auth secret (generate new one!)
npx wrangler secret put BETTER_AUTH_SECRET
# Enter: <output of: openssl rand -base64 32>

# Database credentials (if not using Hyperdrive)
npx wrangler secret put DB_HOST
npx wrangler secret put DB_PORT
npx wrangler secret put DB_USER
npx wrangler secret put DB_PASSWORD
npx wrangler secret put DB_NAME

# OAuth credentials
npx wrangler secret put TWITTER_CLIENT_ID
npx wrangler secret put TWITTER_CLIENT_SECRET
npx wrangler secret put GOOGLE_CLIENT_ID
npx wrangler secret put GOOGLE_CLIENT_SECRET
```

### Update wrangler.toml

Edit `backend/wrangler.toml`:

```toml
[vars]
NODE_ENV = "production"
ALLOWED_ORIGINS = "https://yourdomain.com"
TRUSTED_ORIGIN = "https://yourdomain.com"
APP_URL = "https://yourdomain.com"
BETTER_AUTH_URL = "https://api.yourdomain.com"
```

## Step 3: Update Database Connection for Cloudflare

### Option A: Using Hyperdrive (Recommended)

Update `backend/lib/db.ts`:

```typescript
import { Pool } from 'pg';

let pool: Pool;

export const getPool = (): Pool => {
  if (!pool) {
    // Check if running on Cloudflare Workers
    const isCloudflare = typeof globalThis.HYPERDRIVE !== 'undefined';

    if (isCloudflare) {
      // Use Hyperdrive on Cloudflare Workers
      pool = new Pool({
        connectionString: (globalThis as any).HYPERDRIVE.connectionString,
      });
    } else {
      // Local development - use environment variables
      pool = new Pool({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5433'),
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'auth_db',
        ssl: process.env.NODE_ENV === 'production',
      });
    }
  }
  return pool;
};
```

### Option B: Direct Connection (Without Hyperdrive)

If you prefer not to use Hyperdrive:

```typescript
export const getPool = (): Pool => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
};
```

## Step 4: Run Database Migrations

Before deploying, ensure your database schema is up-to-date:

```bash
cd backend

# Run Better Auth migrations
bun run db:migrate

# Or manually run SQL
psql $DATABASE_URL -f migrations/001_initial.sql
```

## Step 5: Test Locally with Wrangler

```bash
cd backend

# Start local Cloudflare Workers dev server
bun run cf:dev

# This starts Wrangler on http://localhost:8787
```

Test endpoints:
```bash
# Health check
curl http://localhost:8787/health

# Session check
curl http://localhost:8787/api/auth/get-session
```

## Step 6: Deploy to Cloudflare

### Deploy to Staging (Development Environment)

```bash
cd backend

# Deploy to dev environment
npx wrangler deploy --env development
```

### Deploy to Production

```bash
# Deploy to production
bun run cf:deploy:prod
```

You'll see output like:
```
Uploaded better-auth-backend (x.xx sec)
Published better-auth-backend (x.xx sec)
  https://better-auth-backend.yourname.workers.dev
```

## Step 7: Set Up Custom Domain (Optional)

### Using Cloudflare Dashboard

1. **Go to Workers & Pages** → Your worker
2. **Triggers** → **Add Custom Domain**
3. **Enter domain**: `api.yourdomain.com`
4. **Add domain** (Cloudflare will handle DNS automatically)

### Update wrangler.toml

```toml
[env.production]
name = "better-auth-backend"
routes = [
  { pattern = "api.yourdomain.com", custom_domain = true }
]
```

Redeploy:
```bash
bun run cf:deploy:prod
```

## Step 8: Update Frontend Configuration

Update `frontend/.env`:

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

Deploy frontend to Vercel/Netlify/Cloudflare Pages.

## Step 9: Update OAuth Redirect URLs

### Twitter OAuth

Go to https://developer.twitter.com/en/portal/dashboard
- Update callback URL: `https://yourdomain.com/api/auth/callback/twitter`

### Google OAuth

Go to https://console.cloud.google.com
- Update authorized origins: `https://yourdomain.com`
- Update redirect URIs: `https://yourdomain.com/api/auth/callback/google`

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
bun run cf:tail

# Or
npx wrangler tail
```

### View Analytics

1. Go to Cloudflare Dashboard
2. Workers & Pages → Your worker
3. View metrics, requests, errors

### Debug Issues

```bash
# View recent deployments
npx wrangler deployments list

# Rollback to previous version
npx wrangler rollback
```

## Cost Estimation

### Cloudflare Workers Pricing

**Free Tier:**
- 100,000 requests/day
- 10ms CPU time per request
- Perfect for side projects & MVPs

**Paid Plan ($5/month):**
- 10 million requests included
- $0.50 per additional million requests
- 50ms CPU time per request

**Example Costs:**
- 1 million requests/month: **FREE**
- 5 million requests/month: **FREE**
- 20 million requests/month: **$5/month** (base) + $0.50 = **$5.50/month**
- 100 million requests/month: **$5** + ($40) = **$45/month**

### Database Costs (Neon)

**Free Tier:**
- 0.5 GB storage
- 1 compute unit
- Perfect for development

**Pro Plan ($19/month):**
- 10 GB storage included
- Autoscaling compute
- Higher connection limits

## Performance Optimization

### 1. Enable Edge Caching

Add caching headers for static responses:

```typescript
app.get('/api/auth/providers', (c) => {
  return c.json(providers, {
    headers: {
      'Cache-Control': 'public, max-age=3600', // 1 hour
    }
  });
});
```

### 2. Use Cloudflare KV for Sessions (Optional)

For faster session lookups, use Cloudflare KV:

```toml
[[kv_namespaces]]
binding = "SESSIONS"
id = "your-kv-namespace-id"
```

### 3. Enable Compression

Hono automatically handles compression for Cloudflare Workers.

## Troubleshooting

### Error: "Database connection failed"

**Solution:**
- Verify Hyperdrive ID in `wrangler.toml`
- Check database credentials with `npx wrangler secret list`
- Ensure database allows external connections

### Error: "CPU time limit exceeded"

**Solution:**
- Optimize database queries
- Use connection pooling (Hyperdrive)
- Upgrade to paid plan (50ms limit)

### Error: "Module not found"

**Solution:**
- Ensure all imports use `.ts` or `.js` extensions
- Check `node_modules` are compatible with Workers
- Some Node.js packages don't work on Workers (use alternatives)

### CORS Issues

**Solution:**
- Verify `ALLOWED_ORIGINS` in wrangler.toml
- Check CORS middleware in `server.ts`
- Ensure credentials are properly configured

## Migration Checklist

- [ ] Create Cloudflare account
- [ ] Set up PostgreSQL (Neon/Supabase)
- [ ] Create Hyperdrive connection
- [ ] Set Cloudflare secrets
- [ ] Update wrangler.toml
- [ ] Run database migrations
- [ ] Test locally with `wrangler dev`
- [ ] Deploy to development
- [ ] Test all auth flows
- [ ] Deploy to production
- [ ] Set up custom domain
- [ ] Update OAuth redirect URLs
- [ ] Update frontend .env
- [ ] Monitor logs and errors

## Local Development vs. Production

### Local (Current Setup)
```bash
# Uses Node.js + Hono
bun run dev
# Runs on http://localhost:3005
```

### Cloudflare Workers (Production)
```bash
# Uses Cloudflare Workers runtime
bun run cf:dev
# Runs on http://localhost:8787
```

Both use the **same Hono server code** (`server.ts`)!

## Comparison: Express vs. Hono on Cloudflare

| Feature | Express + Containers | Hono + Workers |
|---------|---------------------|----------------|
| **Cold Start** | 2-5 seconds | 0ms |
| **Global Latency** | Single region | 275+ edge locations |
| **Cost (1M req)** | $15-50/month | FREE |
| **Cost (100M req)** | $100-200/month | $45/month |
| **Scaling** | Manual | Automatic |
| **Deployment** | Complex (Docker) | Simple (`wrangler deploy`) |
| **Code Changes** | Significant | Minimal (this branch!) |

## Next Steps

1. **Test the Hono server locally**: `bun run dev`
2. **Deploy to Cloudflare staging**: `bun run cf:dev`
3. **Run production deployment**: `bun run cf:deploy:prod`
4. **Monitor performance**: Cloudflare Dashboard → Analytics

## Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Hono Documentation](https://hono.dev/)
- [Hyperdrive Docs](https://developers.cloudflare.com/hyperdrive/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [Better Auth + Hono](https://www.better-auth.com/docs/integrations/hono)

## Support

If you encounter issues:
1. Check Cloudflare Workers logs: `npx wrangler tail`
2. Review this guide's troubleshooting section
3. Check Better Auth Discord: https://discord.gg/better-auth
4. Open an issue on GitHub

---

**Congratulations!** You're now ready to deploy your Better Auth backend to Cloudflare Workers with global edge performance! 🚀
