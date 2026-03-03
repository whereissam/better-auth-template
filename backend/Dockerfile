FROM oven/bun:1
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN mkdir -p data
EXPOSE 4200
CMD ["bun", "run", "src/node.ts"]
