# Backend Dockerfile
FROM oven/bun:1 AS base

WORKDIR /app

# Install Python and build dependencies for native modules
RUN apt-get update && \
    apt-get install -y python3 python3-pip build-essential && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies
COPY package.json ./
RUN bun install

# Copy source code
COPY . .

# Expose port
EXPOSE 3005

# Start the server
CMD ["bun", "run", "dev"]
