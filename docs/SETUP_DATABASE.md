# Database Setup Guide

This guide explains how to set up and initialize the PostgreSQL database for Better Auth.

## Quick Start (Recommended)

### 1. Start Docker Desktop
Open Docker Desktop and wait for it to be ready.

### 2. Start Database
```bash
cd backend
docker-compose up -d
```

This will:
- ✅ Start PostgreSQL on port `5433`
- ✅ Create `auth_db` database
- ✅ Run initialization script automatically
- ✅ Start PgAdmin on port `5051`

### 3. Run Migrations
```bash
# Option A: Using npm script
bun run db:migrate

# Option B: Using shell script
./scripts/migrate.sh

# Option C: Direct command
npx @better-auth/cli migrate
```

### 4. Start the Application
```bash
cd ..
bun run dev
```

Done! The database is ready with all tables created.

---

## What Gets Created

Better Auth will automatically create these tables:

- `user` - User profiles and accounts
- `session` - Active user sessions
- `account` - Linked social accounts (Twitter, Google)
- `verification` - Email/phone verification codes
- `walletAddress` - Ethereum wallet addresses (for SIWE)

---

## Database Commands

### Check Database Status
```bash
docker-compose ps
```

### View Database Logs
```bash
docker-compose logs -f postgres
```

### Connect to Database
```bash
# Using psql
docker exec -it better-auth-template-postgres psql -U postgres -d auth_db

# Or from host (if psql is installed)
psql -h localhost -p 5433 -U postgres -d auth_db
```

### Stop Database
```bash
docker-compose stop
```

### Restart Database
```bash
docker-compose restart
```

### Remove Database (⚠️ Deletes all data)
```bash
docker-compose down -v
```

---

## Manual Migration

If you need to manually run migrations:

```bash
cd backend

# Check what will be migrated
npx @better-auth/cli generate

# Apply migrations
npx @better-auth/cli migrate
```

---

## Troubleshooting

### Port Already in Use

If port 5433 is already taken:

1. Edit `docker-compose.yml`:
   ```yaml
   ports:
     - "5434:5432"  # Change to 5434
   ```

2. Edit `backend/.env`:
   ```
   DB_PORT=5434
   ```

3. Restart:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### Database Connection Failed

Check if Docker is running:
```bash
docker ps
```

Check if database is healthy:
```bash
docker-compose ps
```

View logs:
```bash
docker-compose logs postgres
```

### Migration Errors

If migrations fail:

1. Check database connection:
   ```bash
   docker exec -it better-auth-template-postgres psql -U postgres -d auth_db -c "SELECT 1;"
   ```

2. Check Better Auth configuration in `backend/lib/auth.ts`

3. Manually inspect what needs to be migrated:
   ```bash
   npx @better-auth/cli generate
   ```

---

## Database Schema Updates

When you add new Better Auth plugins or features:

1. Generate schema to see changes:
   ```bash
   bun run db:generate
   ```

2. Apply the changes:
   ```bash
   bun run db:migrate
   ```

---

## Production Deployment

For production, use a managed PostgreSQL service:

1. Create a PostgreSQL instance (e.g., AWS RDS, Supabase, Neon)

2. Update environment variables:
   ```env
   DB_HOST=your-prod-db-host
   DB_PORT=5432
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   DB_NAME=your-db-name
   ```

3. Run migrations:
   ```bash
   bun run db:migrate
   ```

4. Deploy your backend application

---

## PgAdmin Access

PgAdmin is available at: http://localhost:5051

**Login:**
- Email: `admin@example.com`
- Password: `admin`

**Add Server:**
1. Right-click "Servers" → Create → Server
2. General tab: Name = "Better Auth"
3. Connection tab:
   - Host: `better-auth-template-postgres`
   - Port: `5432` (internal port)
   - Username: `postgres`
   - Password: `postgres`
   - Database: `auth_db`

---

## File Structure

```
backend/
├── docker-compose.yml          # Docker services configuration
├── docker/
│   └── init-db.sql            # Database initialization SQL
├── scripts/
│   ├── migrate.sh             # Migration script
│   └── init-db.sh             # Initialization script
└── .env                       # Database connection settings
```

---

## Next Steps

After database setup:

1. Configure OAuth providers (Twitter, Google)
2. Start the development server
3. Test authentication flows
4. Deploy to production

See [README.md](../README.md) for full setup instructions.
