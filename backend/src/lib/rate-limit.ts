import type { Context, Next } from "hono";

/**
 * Simple in-memory rate limiter middleware for Hono.
 * Same behaviour as the old express-rate-limit setup.
 *
 * Env vars (Node.js) / Cloudflare vars:
 *   RATE_LIMIT_WINDOW_MS   – window in ms (default 900 000 = 15 min)
 *   RATE_LIMIT_MAX_REQUESTS – max hits per window (default 1000)
 */

interface RateLimitOptions {
  windowMs: number;
  max: number;
}

const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimiter(opts: RateLimitOptions) {
  return async (c: Context, next: Next) => {
    const now = Date.now();
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    let entry = hits.get(ip);

    if (!entry || now >= entry.resetAt) {
      entry = { count: 0, resetAt: now + opts.windowMs };
      hits.set(ip, entry);
    }

    entry.count++;

    if (entry.count > opts.max) {
      return c.json(
        { error: "Too many requests from this IP, please try again later." },
        429,
      );
    }

    await next();
  };
}
