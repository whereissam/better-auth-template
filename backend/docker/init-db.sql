-- Initialize the database for Better Auth
-- This script runs automatically when PostgreSQL container starts for the first time

-- Better Auth will create its own tables, but we can add any custom setup here
-- For example, enable extensions if needed

-- Enable UUID extension (useful for Better Auth)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create a placeholder to track initialization
CREATE TABLE IF NOT EXISTS _db_init (
  initialized_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO _db_init (initialized_at) VALUES (CURRENT_TIMESTAMP);

-- Log successful initialization
DO $$
BEGIN
  RAISE NOTICE '✅ Database initialized successfully for Better Auth';
END $$;
