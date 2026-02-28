-- Better Auth core tables (SQLite / D1)

CREATE TABLE IF NOT EXISTS `user` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `name` TEXT NOT NULL,
  `email` TEXT NOT NULL UNIQUE,
  `emailVerified` INTEGER NOT NULL DEFAULT 0,
  `image` TEXT,
  `createdAt` TEXT NOT NULL,
  `updatedAt` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `session` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `expiresAt` TEXT NOT NULL,
  `token` TEXT NOT NULL UNIQUE,
  `createdAt` TEXT NOT NULL,
  `updatedAt` TEXT NOT NULL,
  `ipAddress` TEXT,
  `userAgent` TEXT,
  `userId` TEXT NOT NULL REFERENCES `user`(`id`)
);

CREATE TABLE IF NOT EXISTS `account` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `accountId` TEXT NOT NULL,
  `providerId` TEXT NOT NULL,
  `userId` TEXT NOT NULL REFERENCES `user`(`id`),
  `accessToken` TEXT,
  `refreshToken` TEXT,
  `idToken` TEXT,
  `accessTokenExpiresAt` TEXT,
  `refreshTokenExpiresAt` TEXT,
  `scope` TEXT,
  `password` TEXT,
  `createdAt` TEXT NOT NULL,
  `updatedAt` TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS `verification` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `identifier` TEXT NOT NULL,
  `value` TEXT NOT NULL,
  `expiresAt` TEXT NOT NULL,
  `createdAt` TEXT,
  `updatedAt` TEXT
);

-- SIWE (Sign in with Ethereum) table
CREATE TABLE IF NOT EXISTS `walletAddress` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `userId` TEXT NOT NULL REFERENCES `user`(`id`),
  `address` TEXT NOT NULL,
  `chainId` INTEGER NOT NULL DEFAULT 1,
  `isPrimary` INTEGER NOT NULL DEFAULT 0,
  `createdAt` TEXT NOT NULL
);

-- Passkey (WebAuthn) table
CREATE TABLE IF NOT EXISTS `passkey` (
  `id` TEXT NOT NULL PRIMARY KEY,
  `name` TEXT,
  `publicKey` TEXT NOT NULL,
  `userId` TEXT NOT NULL REFERENCES `user`(`id`),
  `credentialID` TEXT NOT NULL UNIQUE,
  `counter` INTEGER NOT NULL DEFAULT 0,
  `deviceType` TEXT NOT NULL,
  `backedUp` INTEGER NOT NULL DEFAULT 0,
  `transports` TEXT,
  `createdAt` TEXT
);
