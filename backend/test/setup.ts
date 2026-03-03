import { vi } from 'vitest';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.PORT = '4200';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '4400';
process.env.DB_USER = 'postgres';
process.env.DB_PASSWORD = 'postgres';
process.env.DB_NAME = 'auth_db';
process.env.BETTER_AUTH_SECRET = 'test-secret';
process.env.BETTER_AUTH_URL = 'http://localhost:4200';
process.env.TRUSTED_ORIGIN = 'http://localhost:4000';
process.env.APP_URL = 'http://localhost:4000';
process.env.ALLOWED_ORIGINS = 'http://localhost:4000';

// Mock console to reduce noise
vi.spyOn(console, 'log').mockImplementation(() => {});
vi.spyOn(console, 'info').mockImplementation(() => {});
