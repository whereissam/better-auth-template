# Starting the Database

This guide will help you start the PostgreSQL database for the Better Auth Template backend.

## Configuration

The docker-compose.yml has been configured with **unique names and ports** to avoid conflicts with other Docker containers:

- **Container Name**: `better-auth-template-postgres` (unique, won't conflict)
- **Port**: `5433:5432` (using 5433 instead of default 5432)
- **Volume**: `better_auth_postgres_data` (unique volume name)
- **PgAdmin Port**: `5051:80` (using 5051 instead of default 5050)

## Prerequisites

1. **Start Docker Desktop**
   - Open Docker Desktop application
   - Wait for it to fully start (you'll see the Docker icon in the menu bar)

## Steps to Start the Database

### Option 1: Using docker-compose (Recommended)

```bash
# Navigate to the backend directory
cd backend

# Start the database in detached mode
docker-compose up -d

# Check if containers are running
docker-compose ps

# View logs (optional)
docker-compose logs -f postgres
```

### Option 2: Start only PostgreSQL (without PgAdmin)

```bash
cd backend
docker-compose up -d postgres
```

## Verify Database is Running

```bash
# Check container status
docker ps | grep better-auth-template

# Test database connection
docker exec -it better-auth-template-postgres psql -U postgres -d auth_db -c "SELECT 1;"
```

## Accessing the Database

### Via PgAdmin (Web Interface)

1. Open browser: http://localhost:5051
2. Login:
   - Email: `admin@example.com`
   - Password: `admin`
3. Add server connection:
   - Host: `better-auth-template-postgres` (or `host.docker.internal`)
   - Port: `5432`
   - Username: `postgres`
   - Password: `postgres`
   - Database: `auth_db`

### Via psql (Command Line)

```bash
docker exec -it better-auth-template-postgres psql -U postgres -d auth_db
```

### Via Local psql Client

```bash
psql -h localhost -p 5433 -U postgres -d auth_db
# Password: postgres
```

## Stop the Database

```bash
# Stop containers (keeps data)
cd backend
docker-compose stop

# Stop and remove containers (keeps data in volumes)
docker-compose down

# Stop and remove everything including data (⚠️ DESTRUCTIVE)
docker-compose down -v
```

## Troubleshooting

### Docker Daemon Not Running

```
Error: Cannot connect to the Docker daemon
```

**Solution**: Start Docker Desktop application

### Port Already in Use

```
Error: Bind for 0.0.0.0:5433 failed: port is already allocated
```

**Solution**: Change the port in `docker-compose.yml`:
```yaml
ports:
  - "5434:5432"  # Use a different port
```

Then update `backend/.env`:
```
DB_PORT=5434
```

### Container Name Already Exists

```
Error: The container name "/better-auth-template-postgres" is already in use
```

**Solution**: Remove the old container:
```bash
docker rm -f better-auth-template-postgres
```

### Database Connection Failed

1. Check if container is running:
   ```bash
   docker ps | grep postgres
   ```

2. Check container logs:
   ```bash
   docker-compose logs postgres
   ```

3. Verify environment variables in `.env` match docker-compose.yml

## Database Schema

Better Auth will **automatically create** the required tables on first run:
- `user` - User profiles
- `session` - Active sessions
- `account` - Linked social accounts (Twitter, Google, etc.)
- `verification` - Email/phone verification codes

No manual migration needed!

## Next Steps

After the database is running, start the backend:

```bash
# From the root directory
bun run dev

# Or just the backend
bun run dev:backend
```
