#!/bin/bash

echo "🚀 Starting Better Auth Template..."
echo ""

# Stop any running containers
echo "📦 Stopping existing containers..."
docker-compose down 2>/dev/null

# Build and start Docker services (backend, database, pgadmin)
echo "🔨 Building and starting Docker services..."
docker-compose up --build -d

# Wait for services to be healthy
echo "⏳ Waiting for backend to be ready..."
sleep 8

# Check service status
echo ""
echo "📊 Docker Service Status:"
docker-compose ps

echo ""
echo "🎨 Starting frontend locally..."
cd frontend && bun run dev --host 0.0.0.0 &
FRONTEND_PID=$!

echo ""
echo "✅ All services started!"
echo ""
echo "📍 Access your services at:"
echo "   Frontend:  http://localhost:3000 (running locally)"
echo "   Backend:   http://localhost:3005 (Docker)"
echo "   PgAdmin:   http://localhost:5051 (Docker)"
echo ""
echo "📝 To view Docker logs, run: docker-compose logs -f"
echo "🛑 To stop Docker services, run: docker-compose down"
echo "🛑 To stop frontend, run: kill $FRONTEND_PID"
