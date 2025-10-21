import { Hono } from 'hono';
import { getCookie, setCookie } from 'hono/cookie';
import { SiweMessage } from 'siwe';
import { getPool } from '../lib/db';
import { logger } from '../lib/logger';

/**
 * SIWE (Sign-In With Ethereum) Routes - Hono Version
 *
 * Endpoints:
 * - POST /api/siwe/sign - Verify signature and create session
 * - GET /api/siwe/verify - Verify current session
 */

const router = new Hono();

/**
 * POST /api/siwe/sign
 * Verify SIWE signature and create Better Auth session
 */
router.post('/sign', async (c) => {
  try {
    const { address, message, signature } = await c.req.json();

    if (!address || !message || !signature) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // 1. Verify SIWE signature
    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (fields.data.address.toLowerCase() !== address.toLowerCase()) {
        return c.json({ error: 'Address mismatch' }, 400);
      }

      logger.info(`✅ SIWE signature verified for ${address}`);
    } catch (err) {
      logger.error('❌ SIWE verification failed:', err);
      return c.json({ error: 'Invalid signature' }, 400);
    }

    // 2. Create or update Better Auth user and session
    const pool = getPool();
    try {
      // Check if user exists
      const existingUser = await pool.query(
        'SELECT "id" FROM "user" WHERE LOWER("name") = LOWER($1)',
        [address]
      );

      let userId: string;

      if (existingUser.rows.length > 0) {
        userId = existingUser.rows[0].id;
        logger.info(`✅ Found existing user: ${userId}`);
      } else {
        // Create new user
        const newUser = await pool.query(
          `INSERT INTO "user" ("id", "name", "email", "emailVerified", "image", "createdAt", "updatedAt")
           VALUES (gen_random_uuid()::VARCHAR(36), $1, NULL, false, NULL, NOW(), NOW())
           RETURNING "id"`,
          [address]
        );
        userId = newUser.rows[0].id;
        logger.info(`✅ Created new user: ${userId}`);
      }

      // Create session
      const sessionToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const ip = c.req.header('cf-connecting-ip') || c.req.header('x-forwarded-for') || '';
      const userAgent = c.req.header('user-agent') || '';

      await pool.query(
        `INSERT INTO "session" ("id", "userId", "expiresAt", "token", "ipAddress", "userAgent", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::VARCHAR(36), $1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, expiresAt, sessionToken, ip, userAgent]
      );

      logger.info(`✅ Created session for user ${userId}`);

      // Set session cookie (compatible with Better Auth)
      setCookie(c, 'better-auth.session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
        maxAge: 30 * 24 * 60 * 60, // 30 days (in seconds for Hono)
        path: '/',
      });

      logger.info(`✅ Set session cookie: ${sessionToken}`);

      return c.json({
        success: true,
        userId,
        sessionToken
      });
    } catch (authErr) {
      logger.error('❌ Failed to create session:', authErr);
      return c.json({ error: 'Failed to create session' }, 500);
    }
  } catch (error) {
    logger.error('❌ SIWE sign error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * GET /api/siwe/verify
 * Verify current session (check if user is authenticated)
 */
router.get('/verify', async (c) => {
  try {
    const sessionToken = getCookie(c, 'better-auth.session_token');

    if (!sessionToken) {
      return c.json({ authenticated: false }, 401);
    }

    const pool = getPool();
    const result = await pool.query(
      `SELECT s.*, u.name as address
       FROM "session" s
       JOIN "user" u ON s."userId" = u.id
       WHERE s.token = $1 AND s."expiresAt" > NOW()`,
      [sessionToken]
    );

    if (result.rows.length === 0) {
      return c.json({ authenticated: false }, 401);
    }

    const session = result.rows[0];
    return c.json({
      authenticated: true,
      address: session.address,
      userId: session.userId,
    });
  } catch (error) {
    logger.error('❌ Session verification error:', error);
    return c.json({ error: 'Failed to verify session' }, 500);
  }
});

export default router;
