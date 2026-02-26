import pg from 'pg';
const { Pool } = pg;

/**
 * PostgreSQL Database Connection Pool
 *
 * Better Auth will automatically create necessary tables:
 * - user: User profiles
 * - session: Active sessions
 * - account: Linked social accounts (Twitter, etc.)
 * - verification: Email/phone verification tokens
 */

let pool: pg.Pool | null = null;

export const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'auth_db',
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    pool.on('error', (err) => {
      console.error('Unexpected database error:', err);
    });
  }
  return pool;
};

/**
 * Test database connection
 * Better Auth will handle table creation automatically
 */
export const testConnection = async () => {
  const pool = getPool();

  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ Database connected successfully');
      return;
    } catch (error) {
      retries--;
      if (retries === 0) {
        console.error('❌ Failed to connect to database:', error);
        await closePool();
        throw error;
      }
      console.log(`⏳ Waiting for database... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
};

export const closePool = async () => {
  if (pool) {
    await pool.end();
    pool = null;
    console.log('Database pool closed');
  }
};
