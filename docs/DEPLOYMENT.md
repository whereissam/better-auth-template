# Deployment Guide

Production deployment guide for Better Auth template.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Database Setup](#database-setup)
3. [Vercel Deployment](#vercel-deployment)
4. [Docker Deployment](#docker-deployment)
5. [Nginx Configuration](#nginx-configuration)
6. [Security Checklist](#security-checklist)

## Environment Variables

### Production Backend Environment

```env
# Database (use managed service in production)
DB_HOST=your-postgres-host.com
DB_PORT=5432
DB_USER=your_db_user
DB_PASSWORD=strong_password_here
DB_NAME=auth_db

# Server
PORT=3005
NODE_ENV=production

# Twitter OAuth
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret

# Better Auth (generate new secret!)
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>

# CORS & Origins
ALLOWED_ORIGINS=https://yourdomain.com
TRUSTED_ORIGIN=https://yourdomain.com
APP_URL=https://yourdomain.com

# Logging
LOG_LEVEL=error

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Production Frontend Environment

```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_URL=https://yourdomain.com
```

## Database Setup

### Option 1: Managed PostgreSQL (Recommended)

**Popular Providers:**
- [Neon](https://neon.tech/) - Serverless Postgres
- [Supabase](https://supabase.com/) - Free tier available
- [Railway](https://railway.app/) - Easy deployment
- [AWS RDS](https://aws.amazon.com/rds/) - Enterprise-grade

**Steps:**
1. Create database instance
2. Note connection string
3. Update `DB_*` environment variables
4. Better Auth will auto-create tables on first run

### Option 2: Self-Hosted PostgreSQL

```bash
# Using Docker
docker run -d \
  --name auth-postgres \
  -e POSTGRES_PASSWORD=strong_password \
  -e POSTGRES_DB=auth_db \
  -v postgres_data:/var/lib/postgresql/data \
  -p 5432:5432 \
  postgres:14-alpine
```

## Vercel Deployment

### Frontend Deployment

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-repo>
   git push -u origin main
   ```

2. **Deploy on Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import your repository
   - Set root directory to `frontend/`
   - Add environment variables:
     ```
     VITE_API_URL=https://api.yourdomain.com
     VITE_APP_URL=https://yourdomain.com
     ```
   - Deploy

3. **Configure Rewrites** (vercel.json in frontend/)
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://api.yourdomain.com/api/:path*"
       }
     ]
   }
   ```

### Backend Deployment

**Option 1: Vercel Serverless**

Create `vercel.json` in backend/:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.ts"
    }
  ]
}
```

**Option 2: Railway**
1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Select `backend/` directory
4. Add environment variables
5. Deploy

## Docker Deployment

### 1. Create Dockerfiles

**Backend Dockerfile:**
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3005

CMD ["node", "--loader", "tsx", "server.ts"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose (Production)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: auth_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  backend:
    build: ./backend
    environment:
      - NODE_ENV=production
      - DB_HOST=postgres
      - DB_PASSWORD=${DB_PASSWORD}
      - TWITTER_CLIENT_ID=${TWITTER_CLIENT_ID}
      - TWITTER_CLIENT_SECRET=${TWITTER_CLIENT_SECRET}
      - BETTER_AUTH_SECRET=${BETTER_AUTH_SECRET}
    depends_on:
      - postgres
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### 3. Deploy

```bash
# Set environment variables
export DB_PASSWORD="strong_password"
export TWITTER_CLIENT_ID="your_client_id"
export TWITTER_CLIENT_SECRET="your_client_secret"
export BETTER_AUTH_SECRET="$(openssl rand -base64 32)"

# Start services
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose logs -f
```

## Nginx Configuration

### Reverse Proxy for API

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://frontend:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API
    location /api/ {
        proxy_pass http://backend:3005/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $host;

        # Cookie passthrough
        proxy_cookie_path / /;
        proxy_cookie_domain backend $host;
    }
}
```

### HTTPS with Let's Encrypt

```bash
# Install certbot
sudo apt-get install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

## Security Checklist

### Before Deployment

- [ ] Generate new `BETTER_AUTH_SECRET` (never reuse dev secret)
- [ ] Use strong database password
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (required for secure cookies)
- [ ] Configure CORS with specific origins (no wildcards)
- [ ] Set up rate limiting
- [ ] Enable security headers (Helmet)
- [ ] Review Twitter OAuth callback URLs
- [ ] Set up database backups
- [ ] Configure logging and monitoring
- [ ] Test authentication flows in staging
- [ ] Set up error tracking (Sentry, etc.)

### Database Security

```sql
-- Create read-only user for monitoring
CREATE USER auth_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE auth_db TO auth_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO auth_readonly;

-- Create app user with limited permissions
CREATE USER auth_app WITH PASSWORD 'app_password';
GRANT CONNECT ON DATABASE auth_db TO auth_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO auth_app;
```

### Cookie Security

Ensure production cookies are configured correctly:

```typescript
{
  httpOnly: true,      // ✅ Prevents XSS
  secure: true,        // ✅ HTTPS only
  sameSite: 'lax',    // ✅ CSRF protection
  domain: undefined,   // ✅ Same origin only
}
```

### Environment Variables

**Never commit:**
- `.env` files
- Secrets or API keys
- Database credentials

**Use:**
- Environment variable management (Vercel/Railway/etc.)
- Secret managers (AWS Secrets Manager, etc.)
- `.env.example` for documentation

## Monitoring

### Health Checks

```bash
# Check backend
curl https://api.yourdomain.com/health

# Expected response
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

### Database Monitoring

```sql
-- Active connections
SELECT count(*) FROM pg_stat_activity;

-- Long-running queries
SELECT pid, now() - query_start as duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;
```

### Application Logs

Using PM2:
```bash
# Install PM2
npm install -g pm2

# Start with PM2
pm2 start server.ts --name auth-backend

# View logs
pm2 logs auth-backend

# Monitor
pm2 monit
```

## Scaling

### Horizontal Scaling

1. **Stateless Backend**
   - Sessions stored in database (not memory)
   - Multiple backend instances can share load

2. **Load Balancer**
   ```nginx
   upstream backend {
       server backend1:3005;
       server backend2:3005;
       server backend3:3005;
   }
   ```

3. **Database Connection Pooling**
   ```typescript
   new Pool({
       max: 20,  // Max connections per instance
       // ...
   })
   ```

### Caching

Add Redis for session caching:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Cache session lookups
const cachedSession = await redis.get(`session:${token}`);
if (cachedSession) return JSON.parse(cachedSession);

// Cache for 5 minutes
await redis.setex(`session:${token}`, 300, JSON.stringify(session));
```

## Backup & Recovery

### Database Backups

```bash
# Automated daily backups
0 2 * * * pg_dump -U postgres auth_db > /backups/auth_db_$(date +\%Y\%m\%d).sql

# Restore from backup
psql -U postgres auth_db < /backups/auth_db_20240101.sql
```

### Disaster Recovery Plan

1. Database backups stored in S3/Google Cloud Storage
2. Environment variables documented in password manager
3. Infrastructure as Code (Terraform, etc.)
4. Recovery Time Objective (RTO): < 1 hour
5. Recovery Point Objective (RPO): < 24 hours

## Cost Optimization

### Free Tier Options

- **Database**: Neon (500MB), Supabase (500MB)
- **Backend**: Railway (500 hours/month), Render (750 hours/month)
- **Frontend**: Vercel (unlimited), Netlify (100GB)
- **Monitoring**: Sentry (5k errors/month)

### Estimated Costs (Production)

- Database (Managed): $10-50/month
- Backend Hosting: $5-20/month
- Frontend (CDN): $0-5/month
- **Total**: $15-75/month for small-medium traffic

## Troubleshooting

### Cookies Not Working in Production

1. Ensure HTTPS is enabled
2. Check `secure: true` in cookie config
3. Verify `sameSite` is set correctly
4. Check CORS origin matches exactly
5. Review reverse proxy cookie passthrough

### Twitter OAuth Callback Fails

1. Update callback URL in Twitter Dev Portal
2. Ensure it matches production URL exactly
3. Check `APP_URL` environment variable
4. Verify DNS is properly configured

### Database Connection Errors

1. Check connection string format
2. Verify firewall allows connections
3. Check database user permissions
4. Review connection pool settings

## Support

- [Better Auth Discord](https://discord.gg/better-auth)
- [GitHub Issues](https://github.com/yourusername/better-auth-template/issues)
- [Documentation](https://www.better-auth.com/docs)
