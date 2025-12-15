import { betterAuth } from "better-auth";
import { siwe, emailOTP, magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { getPool } from "./db";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "viem";
import { sendEmail, sendOTP, sendMagicLinkEmail } from "./email";

/**
 * Better Auth Configuration
 *
 * Features:
 * - Email & Password authentication
 * - Twitter OAuth provider
 * - Google OAuth provider
 * - SIWE (Sign in with Ethereum)
 * - Passkey (WebAuthn) authentication
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

  // Enable email and password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // Require email verification before login
    minPasswordLength: 8,
    maxPasswordLength: 128,
    // Password reset functionality
    sendResetPassword: async ({ user, url, token }, request) => {
      await sendEmail({
        to: user.email,
        subject: 'Reset your password',
        text: `Hello ${user.name || 'there'},

You requested to reset your password. Click the link below to reset it:

${url}

This link will expire in 1 hour.

If you didn't request this, you can safely ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Reset Your Password</h2>
            <p>Hello ${user.name || 'there'},</p>
            <p>You requested to reset your password. Click the button below to reset it:</p>
            <p style="margin: 30px 0;">
              <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reset Password
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">Or copy this link: ${url}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      });
    },
    resetPasswordTokenExpiresIn: 3600, // 1 hour
  },

  // Email verification
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      // Modify the URL to redirect to our custom verify-email page
      const callbackUrl = `${process.env.APP_URL || "http://localhost:3000"}/verify-email?verified=true`;
      const verificationUrl = `${url}&callbackURL=${encodeURIComponent(callbackUrl)}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify your email address',
        text: `Hello ${user.name || 'there'},

Welcome! Please verify your email address by clicking the link below:

${verificationUrl}

This link will expire in 24 hours.

If you didn't create an account, you can safely ignore this email.`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Verify Your Email Address</h2>
            <p>Hello ${user.name || 'there'},</p>
            <p>Welcome! Please verify your email address by clicking the button below:</p>
            <p style="margin: 30px 0;">
              <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Verify Email
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">Or copy this link: ${verificationUrl}</p>
            <p style="color: #666; font-size: 14px;">This link will expire in 24 hours.</p>
            <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't create an account, you can safely ignore this email.</p>
          </div>
        `,
      });
    },
  },

  plugins: [
    // Magic Link for passwordless authentication
    magicLink({
      async sendMagicLink({ email, token, url }, request) {
        await sendMagicLinkEmail({ email, url, token });
      },
      expiresIn: 300, // 5 minutes
    }),

    // Email OTP for password reset and email verification
    emailOTP({
      async sendVerificationOTP({ email, otp, type }) {
        await sendOTP({ email, otp, type });
      },
      otpLength: 6,
      expiresIn: 600, // 10 minutes
      allowedAttempts: 3,
    }),

    // SIWE (Sign in with Ethereum)
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

    // Passkey (WebAuthn) authentication
    passkey({
      rpID: process.env.PASSKEY_RP_ID || "localhost",
      rpName: process.env.PASSKEY_RP_NAME || "Better Auth Template",
      origin: process.env.PASSKEY_ORIGIN || "http://localhost:3000",
      // Allow platform or cross-platform authenticators
      authenticatorSelection: {
        // Allow both platform (TouchID, FaceID) and cross-platform (security keys)
        authenticatorAttachment: undefined,
        // Discoverable credential (passkey) preferred but not required
        residentKey: "preferred",
        // User verification preferred but allow fallback if not available (e.g., clamshell mode)
        userVerification: "preferred",
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
