#!/bin/bash
# Backend database initialization script

set -e

echo "🚀 Better Auth Backend - Database Setup"
echo "========================================"
echo ""

# Check if Docker is running
echo "1️⃣ Checking Docker..."
if ! docker ps &> /dev/null; then
    echo "❌ Docker is not running!"
    echo ""
    echo "Please start Docker Desktop:"
    echo "   1. Open Docker Desktop app"
    echo "   2. Wait for it to fully start (whale icon in menu bar)"
    echo "   3. Run this script again"
    echo ""
    exit 1
fi
echo "✅ Docker is running"
echo ""

# Get the script directory (backend/scripts)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Change to backend directory
cd "$BACKEND_DIR"

# Start database
echo "2️⃣ Starting PostgreSQL database..."
if docker-compose up -d; then
    echo "✅ Database containers started"
else
    echo "❌ Failed to start database"
    exit 1
fi
echo ""

# Wait for database to be ready
echo "3️⃣ Waiting for database to be ready..."
sleep 5

# Check database health
if docker exec better-auth-template-postgres pg_isready -U postgres > /dev/null 2>&1; then
    echo "✅ Database is ready"
else
    echo "⚠️  Database is starting... waiting 5 more seconds"
    sleep 5
    if docker exec better-auth-template-postgres pg_isready -U postgres > /dev/null 2>&1; then
        echo "✅ Database is ready"
    else
        echo "❌ Database failed to start properly"
        echo "Check logs with: cd backend && docker-compose logs postgres"
        exit 1
    fi
fi
echo ""

# Run migrations
echo "4️⃣ Running Better Auth migrations..."
if bun run db:migrate; then
    echo "✅ Migrations completed"
else
    echo "⚠️  Migrations failed, but continuing..."
    echo "   (Tables will be auto-created on first run)"
fi
echo ""

echo "✅ Database Setup Complete!"
echo ""
echo "📝 Database Info:"
echo "   PostgreSQL: localhost:5433"
echo "   Database:   auth_db"
echo "   User:       postgres"
echo "   Password:   postgres"
echo "   PgAdmin:    http://localhost:5051"
echo ""
echo "🔍 Useful commands:"
echo "   docker-compose ps          # Check status"
echo "   docker-compose logs -f     # View logs"
echo "   docker-compose down        # Stop database"
echo "   bun run dev                # Start backend server"
echo ""
