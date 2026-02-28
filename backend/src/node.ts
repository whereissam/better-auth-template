/**
 * Node.js / Bun entry point
 *
 * Uses better-sqlite3 for local SQLite (same schema as D1).
 * Install first: bun add better-sqlite3 @types/better-sqlite3
 *
 * Run: bun run src/node.ts
 *
 * To use PostgreSQL instead, replace the database config:
 *   import pg from "pg";
 *   const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
 *   Pass `pool` as the database value in authConfig.
 */
import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import Database from "better-sqlite3";
import { readFileSync, mkdirSync } from "fs";
import { createAuth } from "./lib/auth";
import { rateLimiter } from "./lib/rate-limit";

const PORT = Number(process.env.PORT) || 3005;

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error("BETTER_AUTH_SECRET is required. Generate one with: openssl rand -base64 32");
}

// SQLite database (same schema as D1)
mkdirSync("./data", { recursive: true });
const sqlite = new Database(process.env.DB_PATH || "./data/local.db");
sqlite.pragma("journal_mode = WAL");

// Apply migrations
const migration = readFileSync("./migrations/0001_init.sql", "utf-8");
sqlite.run(migration);

const origins = (process.env.TRUSTED_ORIGINS || "http://localhost:3000")
  .split(",")
  .map((o) => o.trim());

const authConfig = {
  database: sqlite,
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL || `http://localhost:${PORT}`,
  trustedOrigins: origins,
  appURL: process.env.APP_URL || "http://localhost:3000",
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET,
  twitterClientId: process.env.TWITTER_CLIENT_ID,
  twitterClientSecret: process.env.TWITTER_CLIENT_SECRET,
  resendApiKey: process.env.RESEND_API_KEY,
  resendFromEmail: process.env.RESEND_FROM_EMAIL,
  siweDomain: process.env.SIWE_DOMAIN,
  siweEmailDomain: process.env.SIWE_EMAIL_DOMAIN,
  passkeyRpId: process.env.PASSKEY_RP_ID,
  passkeyRpName: process.env.PASSKEY_RP_NAME,
  passkeyOrigin: process.env.PASSKEY_ORIGIN,
};

const app = new Hono();

app.use("*", logger());
app.use("*", cors({ origin: origins, credentials: true }));

// Rate limiting on /api/* routes
app.use(
  "/api/*",
  rateLimiter({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900_000,
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  }),
);

// Better Auth handler
app.on(["POST", "GET"], "/api/auth/**", (c) => {
  const auth = createAuth(authConfig);
  return auth.handler(c.req.raw);
});

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Server running on http://localhost:${info.port}`);
  console.log(`Allowed origins: ${origins.join(", ")}`);
});
