-- Add provider-specific profile fields to account table
-- This allows storing profile pictures and names from each provider

ALTER TABLE account
ADD COLUMN IF NOT EXISTS "providerAccountName" TEXT,
ADD COLUMN IF NOT EXISTS "providerAccountImage" TEXT,
ADD COLUMN IF NOT EXISTS "providerAccountEmail" TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS "account_userId_providerId_idx" ON account("userId", "providerId");

COMMENT ON COLUMN account."providerAccountName" IS 'Display name from the OAuth provider';
COMMENT ON COLUMN account."providerAccountImage" IS 'Profile picture URL from the OAuth provider';
COMMENT ON COLUMN account."providerAccountEmail" IS 'Email from the OAuth provider';
