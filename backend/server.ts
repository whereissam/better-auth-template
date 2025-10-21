import 'dotenv/config';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger as honoLogger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { rateLimiter } from 'hono-rate-limiter';
import { auth } from './lib/auth';
import { testConnection } from './lib/db';
import { logger } from './lib/logger';
import siweRouter from './routes/siwe.hono';

const app = new Hono();

// Security headers
app.use('*', secureHeaders());

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(',');
app.use('*', cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Logging middleware
app.use('*', honoLogger((message) => {
  logger.info(message);
}));

// Rate limiting
app.use('/api/*', rateLimiter({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  limit: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  standardHeaders: 'draft-6',
  keyGenerator: (c) => c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || 'unknown',
}));

// SIWE routes
app.route('/api/siwe', siweRouter);

/**
 * Better Auth Handler
 *
 * Handles all auth routes: /api/auth/*
 * - Direct Web API integration (no Express conversion needed!)
 * - Works natively on Cloudflare Workers
 */
app.all('/api/auth/**', async (c) => {
  try {
    logger.info(`🔍 Auth request: ${c.req.method} ${c.req.url}`);

    // Better Auth uses Web Standard Request/Response
    // Hono's c.req.raw is already a Web API Request!
    const response = await auth.handler(c.req.raw);

    return response;
  } catch (error) {
    logger.error('❌ Better Auth handler error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    runtime: typeof globalThis.EdgeRuntime !== 'undefined' ? 'edge' : 'node'
  });
});

// Error handling
app.onError((err, c) => {
  logger.error('Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

// Export for Cloudflare Workers
export default app;

// For local development with Node.js
if (import.meta.url === `file://${process.argv[1]}`) {
  const { serve } = await import('@hono/node-server');
  const PORT = parseInt(process.env.PORT || '3005');

  // Test database connection
  await testConnection();

  serve({
    fetch: app.fetch,
    port: PORT,
  });

  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔐 Allowed origins: ${allowedOrigins.join(', ')}`);
  logger.info(`⚡ Runtime: Hono + Node.js (local dev)`);
}
