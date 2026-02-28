# Database Setup Guide

This project uses **SQLite** for the database — either Cloudflare D1 (production) or better-sqlite3 (local Node.js).

## Cloudflare D1

### Create Database

```bash
cd backend
bun run db:create
# or: npx wrangler d1 create auth-db
```

Copy the `database_id` from the output and update `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "auth-db"
database_id = "your-database-id-here"
```

### Apply Migrations

```bash
# Local development
bun run db:migrate:local

# Production
bun run db:migrate
```

### Check Migration Status

```bash
npx wrangler d1 migrations list DB --local
npx wrangler d1 migrations list DB --remote
```

### Query Database

```bash
# Local
npx wrangler d1 execute DB --local --command "SELECT * FROM user"

# Production
npx wrangler d1 execute DB --remote --command "SELECT * FROM user"
```

---

## Local SQLite (Node.js / Bun)

When using `bun run dev:node`, the database is created automatically at `./data/local.db`. Migrations run on startup.

### Access with CLI

```bash
# Install sqlite3 CLI if needed
brew install sqlite3  # macOS

# Open database
sqlite3 ./backend/data/local.db

# Common queries
.tables
SELECT * FROM user;
SELECT * FROM session;
.quit
```

---

## What Gets Created

Better Auth creates these tables:

| Table | Purpose |
|-------|---------|
| `user` | User profiles (id, name, email, image) |
| `session` | Active sessions with tokens |
| `account` | Linked accounts (OAuth, credentials) |
| `verification` | Email verification & OTP tokens |

---

## Adding Migrations

### 1. Create a new migration file

```bash
# D1 way
npx wrangler d1 migrations create DB add-custom-table
```

This creates `migrations/0002_add-custom-table.sql`.

### 2. Write the SQL

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id TEXT NOT NULL REFERENCES user(id),
  theme TEXT DEFAULT 'light',
  notifications INTEGER DEFAULT 1,
  PRIMARY KEY (user_id)
);
```

### 3. Apply

```bash
bun run db:migrate:local   # local
bun run db:migrate          # production
```

---

## Troubleshooting

### Migration fails

```bash
# Check current state
npx wrangler d1 migrations list DB --local

# Check what's in the database
npx wrangler d1 execute DB --local --command ".tables"
```

### Reset local database

```bash
# D1 local — delete wrangler state
rm -rf .wrangler/state

# Re-apply migrations
bun run db:migrate:local

# SQLite local — delete the file
rm ./data/local.db
bun run dev:node  # recreates on startup
```

### D1 database not found

Ensure `database_id` in `wrangler.toml` matches your actual D1 database. Run `npx wrangler d1 list` to see available databases.

---

## Backup

### D1 (Cloudflare)

D1 has automatic point-in-time recovery via Cloudflare dashboard.

Export manually:
```bash
npx wrangler d1 export DB --remote --output backup.sql
```

### SQLite (local)

```bash
cp ./data/local.db ./data/local.db.backup
```
