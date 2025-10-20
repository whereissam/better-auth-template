import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { auth } from './lib/auth';
import { testConnection } from './lib/db';
import { logger } from './lib/logger';
import siweRouter from './routes/siwe';

const app = express();
const PORT = process.env.PORT || 3005;

// Trust proxy - required when behind Nginx/load balancer
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(hpp());

// CORS configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
});

app.use('/api/', limiter);

// SIWE routes
app.use('/api/siwe', siweRouter);

/**
 * Better Auth Handler
 *
 * Handles all auth routes: /api/auth/*
 * - /api/auth/signin/social/twitter - Twitter OAuth
 * - /api/auth/callback/twitter - OAuth callback
 * - /api/auth/session - Get current session
 * - /api/auth/signout - Logout
 * - /api/auth/list-accounts - List linked accounts
 */
app.use('/api/auth', async (req, res, next) => {
  try {
    // Build the public URL (prefer Origin host → x-forwarded-host → host)
    const proto = req.get('x-forwarded-proto') || req.protocol;
    const originHost = (() => {
      const o = req.get('origin');
      try { return o ? new URL(o).host : null; } catch { return null; }
    })();
    const host =
      originHost ||
      req.get('x-forwarded-host') ||
      req.get('host') ||
      'localhost:3005';

    const url = `${proto}://${host}${req.originalUrl}`;

    logger.info(`🔍 Auth request: ${req.method} ${url}`);
    logger.debug(`🔍 Headers: x-forwarded-host=${req.get('x-forwarded-host')}, host=${req.get('host')}`);
    logger.debug(`🍪 Incoming Cookie: ${req.get('cookie') || 'none'}`);

    // Build Web API Headers
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (!value) continue;
      headers.set(key, Array.isArray(value) ? value[0] : value);
    }

    // Force host to public host for Better Auth
    headers.set('host', host);
    headers.set('x-forwarded-host', host);
    headers.set('x-forwarded-proto', proto);

    // Create Web API Request
    const webRequest = new Request(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined,
    });

    // Call Better Auth
    const response = await auth.handler(webRequest);

    // Handle Set-Cookie properly (as an array)
    const raw = (response.headers as any).raw?.() ?? {};
    const setCookieArr: string[] =
      raw['set-cookie'] ??
      ((response.headers as any).getSetCookie?.() ?? []);

    if (setCookieArr.length) {
      logger.debug(`🍪 Outgoing Set-Cookie (${setCookieArr.length}):\n${setCookieArr.join('\n')}`);
      res.setHeader('Set-Cookie', setCookieArr);
    }

    // Log redirect target if any
    const location = response.headers.get('location');
    if (location && [301,302,303,307,308].includes(response.status)) {
      logger.info(`🔀 Redirect: ${response.status} -> ${location}`);
    }

    // Copy other headers (skip ones we set or that Node manages)
    for (const [key, value] of response.headers.entries()) {
      const k = key.toLowerCase();
      if (k === 'set-cookie') continue;
      if (k === 'content-length' || k === 'transfer-encoding' || k === 'content-encoding') continue;
      res.setHeader(key, value);
    }

    // Status + body / redirect passthrough
    res.status(response.status);

    if (location && [301,302,303,307,308].includes(response.status)) {
      res.setHeader('Location', location);
      return res.end();
    }

    const bodyText = await response.text();
    return res.send(bodyText);
  } catch (error) {
    logger.error('❌ Better Auth handler error:', error);
    return next(error);
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔐 Allowed origins: ${allowedOrigins.join(', ')}`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});
