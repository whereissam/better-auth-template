#!/bin/bash
# Migration script for Better Auth database

set -e

echo "🔄 Running Better Auth migrations..."

# Load environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Check if database is accessible
echo "🔍 Checking database connection..."
if ! command -v psql &> /dev/null; then
    echo "⚠️  psql not installed, skipping connection check"
else
    if PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' 2>/dev/null; then
        echo "✅ Database connection successful"
    else
        echo "❌ Cannot connect to database"
        echo "   Make sure Docker is running and database is started:"
        echo "   docker-compose up -d"
        exit 1
    fi
fi

# Run migrations
echo "🔄 Applying migrations..."
npx @better-auth/cli migrate

echo "✅ Migrations completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Start the backend: bun run dev"
echo "   2. Or start everything: cd .. && bun run dev"
