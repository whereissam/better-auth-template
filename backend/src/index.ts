/**
 * Cloudflare Workers entry point
 *
 * Deploy: wrangler deploy
 * Dev:    wrangler dev
 */
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { createAuth } from "./lib/auth";
import { rateLimiter } from "./lib/rate-limit";

type Env = {
  DB: D1Database;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  TRUSTED_ORIGINS?: string;
  APP_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
  TWITTER_CLIENT_ID?: string;
  TWITTER_CLIENT_SECRET?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  SIWE_DOMAIN?: string;
  SIWE_EMAIL_DOMAIN?: string;
  PASSKEY_RP_ID?: string;
  PASSKEY_RP_NAME?: string;
  PASSKEY_ORIGIN?: string;
  RATE_LIMIT_WINDOW_MS?: string;
  RATE_LIMIT_MAX_REQUESTS?: string;
};

const app = new Hono<{ Bindings: Env }>();

app.use("*", logger());

app.use("*", async (c, next) => {
  const origins = (c.env.TRUSTED_ORIGINS || "http://localhost:3000")
    .split(",")
    .map((o) => o.trim());
  return cors({ origin: origins, credentials: true })(c, next);
});

// Rate limiting on /api/* routes
app.use("/api/*", async (c, next) => {
  const limiter = rateLimiter({
    windowMs: Number(c.env.RATE_LIMIT_WINDOW_MS) || 900_000,
    max: Number(c.env.RATE_LIMIT_MAX_REQUESTS) || 1000,
  });
  return limiter(c, next);
});

// Better Auth handler — use app.all to support all HTTP methods
app.all("/api/auth/*", (c) => {
  const db = new Kysely({ dialect: new D1Dialect({ database: c.env.DB }) });
  const auth = createAuth({
    database: { db, type: "sqlite" },
    secret: c.env.BETTER_AUTH_SECRET,
    baseURL: c.env.BETTER_AUTH_URL,
    trustedOrigins: (c.env.TRUSTED_ORIGINS || "http://localhost:3000")
      .split(",")
      .map((o) => o.trim()),
    appURL: c.env.APP_URL || "http://localhost:3000",
    googleClientId: c.env.GOOGLE_CLIENT_ID,
    googleClientSecret: c.env.GOOGLE_CLIENT_SECRET,
    twitterClientId: c.env.TWITTER_CLIENT_ID,
    twitterClientSecret: c.env.TWITTER_CLIENT_SECRET,
    resendApiKey: c.env.RESEND_API_KEY,
    resendFromEmail: c.env.RESEND_FROM_EMAIL,
    siweDomain: c.env.SIWE_DOMAIN,
    siweEmailDomain: c.env.SIWE_EMAIL_DOMAIN,
    passkeyRpId: c.env.PASSKEY_RP_ID,
    passkeyRpName: c.env.PASSKEY_RP_NAME,
    passkeyOrigin: c.env.PASSKEY_ORIGIN,
  });
  return auth.handler(c.req.raw);
});

app.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
);

export default app;
