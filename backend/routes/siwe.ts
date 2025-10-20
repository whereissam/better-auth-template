import { Router } from 'express';
import { SiweMessage } from 'siwe';
import { getPool } from '../lib/db';
import { logger } from '../lib/logger';

/**
 * SIWE (Sign-In With Ethereum) Routes
 *
 * Endpoints:
 * - POST /api/siwe/sign - Verify signature and create session
 * - GET /api/siwe/verify - Verify current session
 */

const router = Router();

/**
 * POST /api/siwe/sign
 * Verify SIWE signature and create Better Auth session
 */
router.post('/sign', async (req, res) => {
  try {
    const { address, message, signature } = req.body;

    if (!address || !message || !signature) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Verify SIWE signature
    let siweMessage: SiweMessage;
    try {
      siweMessage = new SiweMessage(message);
      const fields = await siweMessage.verify({ signature });

      if (fields.data.address.toLowerCase() !== address.toLowerCase()) {
        return res.status(400).json({ error: 'Address mismatch' });
      }

      logger.info(`✅ SIWE signature verified for ${address}`);
    } catch (err) {
      logger.error('❌ SIWE verification failed:', err);
      return res.status(400).json({ error: 'Invalid signature' });
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

      await pool.query(
        `INSERT INTO "session" ("id", "userId", "expiresAt", "token", "ipAddress", "userAgent", "createdAt", "updatedAt")
         VALUES (gen_random_uuid()::VARCHAR(36), $1, $2, $3, $4, $5, NOW(), NOW())`,
        [userId, expiresAt, sessionToken, req.ip || '', req.headers['user-agent'] || '']
      );

      logger.info(`✅ Created session for user ${userId}`);

      // Set session cookie (compatible with Better Auth)
      res.cookie('better-auth.session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        domain: process.env.NODE_ENV === 'production' ? undefined : 'localhost',
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        path: '/',
      });

      logger.info(`✅ Set session cookie: ${sessionToken}`);

      return res.json({
        success: true,
        userId,
        sessionToken
      });
    } catch (authErr) {
      logger.error('❌ Failed to create session:', authErr);
      return res.status(500).json({ error: 'Failed to create session' });
    }
  } catch (error) {
    logger.error('❌ SIWE sign error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET /api/siwe/verify
 * Verify current session (check if user is authenticated)
 */
router.get('/verify', async (req, res) => {
  try {
    const sessionToken = req.cookies['better-auth.session_token'];

    if (!sessionToken) {
      return res.status(401).json({ authenticated: false });
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
      return res.status(401).json({ authenticated: false });
    }

    const session = result.rows[0];
    return res.json({
      authenticated: true,
      address: session.address,
      userId: session.userId,
    });
  } catch (error) {
    logger.error('❌ Session verification error:', error);
    return res.status(500).json({ error: 'Failed to verify session' });
  }
});

export default router;
