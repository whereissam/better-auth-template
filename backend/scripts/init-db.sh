#!/bin/bash
set -e

echo "🔧 Initializing database for Better Auth..."

# Wait for database to be ready
echo "⏳ Waiting for database to be ready..."
until PGPASSWORD=$DB_PASSWORD psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q'; do
  >&2 echo "Database is unavailable - sleeping"
  sleep 1
done

echo "✅ Database is ready!"

# Run Better Auth migrations
echo "🔄 Running Better Auth migrations..."
cd /app
npx @better-auth/cli migrate

echo "✅ Database initialization complete!"
