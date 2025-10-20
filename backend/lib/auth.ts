import { betterAuth } from "better-auth";
import { siwe } from "better-auth/plugins";
import { getPool } from "./db";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "viem";

/**
 * Better Auth Configuration
 *
 * Features:
 * - Twitter OAuth provider
 * - Google OAuth provider
 * - SIWE (Sign in with Ethereum)
 * - PostgreSQL database for user/session storage
 * - Trusted origins for CORS
 * - Secure cookies in production
 * - Debug logging for development
 */
export const auth = betterAuth({
  database: getPool(),

  // BaseURL for Better Auth
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3005",

  trustedOrigins: [
    process.env.TRUSTED_ORIGIN || "http://localhost:3000"
  ],

  plugins: [
    siwe({
      domain: process.env.SIWE_DOMAIN || "localhost:3000",
      emailDomainName: process.env.SIWE_EMAIL_DOMAIN || "localhost",
      anonymous: true, // Allow sign-in without email
      getNonce: async () => {
        // Generate a cryptographically secure random nonce
        return generateRandomString(32);
      },
      verifyMessage: async ({ message, signature, address }) => {
        try {
          // Verify the signature using viem
          const isValid = await verifyMessage({
            address: address as `0x${string}`,
            message,
            signature: signature as `0x${string}`,
          });
          return isValid;
        } catch (error) {
          console.error("SIWE verification failed:", error);
          return false;
        }
      },
    }),
  ],

  logger: {
    level: process.env.NODE_ENV === "production" ? "error" : "debug",
    logger: {
      error: (message: any, data?: any) => {
        console.error("❌ Better Auth Error:", message);
        if (data) console.error("Error details:", JSON.stringify(data, null, 2));
      },
      warn: (message: any) => console.warn("⚠️", message),
      info: (message: any) => console.info("ℹ️", message),
    },
  },

  socialProviders: {
    twitter: {
      clientId: process.env.TWITTER_CLIENT_ID || "",
      clientSecret: process.env.TWITTER_CLIENT_SECRET || "",
      redirectURI: `${process.env.APP_URL || "http://localhost:3000"}/api/auth/callback/twitter`,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      redirectURI: `${process.env.APP_URL || "http://localhost:3000"}/api/auth/callback/google`,
    },
  },

  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: true,
    },
  },
});
