import { betterAuth } from "better-auth";
import { siwe, emailOTP, magicLink } from "better-auth/plugins";
import { passkey } from "@better-auth/passkey";
import { generateRandomString } from "better-auth/crypto";
import { verifyMessage } from "viem";
import { sendEmail, sendOTP, sendMagicLinkEmail } from "./email";

export interface AuthConfig {
  /** Better Auth database config (Kysely instance, better-sqlite3 Database, pg Pool, etc.) */
  database: any;
  secret: string;
  baseURL: string;
  trustedOrigins: string[];
  appURL: string;
  googleClientId?: string;
  googleClientSecret?: string;
  twitterClientId?: string;
  twitterClientSecret?: string;
  resendApiKey?: string;
  resendFromEmail?: string;
  /** SIWE config */
  siweDomain?: string;
  siweEmailDomain?: string;
  /** Passkey config */
  passkeyRpId?: string;
  passkeyRpName?: string;
  passkeyOrigin?: string;
}

export function createAuth(config: AuthConfig) {
  const emailEnv = {
    RESEND_API_KEY: config.resendApiKey,
    RESEND_FROM_EMAIL: config.resendFromEmail,
  };

  return betterAuth({
    database: config.database,
    secret: config.secret,
    baseURL: config.baseURL,
    trustedOrigins: config.trustedOrigins,

    emailAndPassword: {
      enabled: true,
      requireEmailVerification: true,
      minPasswordLength: 8,
      maxPasswordLength: 128,
      sendResetPassword: async ({ user, url }) => {
        await sendEmail(
          {
            to: user.email,
            subject: "Reset your password",
            text: `Hello ${user.name || "there"},\n\nYou requested to reset your password:\n\n${url}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, ignore this email.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Reset Your Password</h2>
                <p>Hello ${user.name || "there"},</p>
                <p>You requested to reset your password. Click the button below:</p>
                <p style="margin: 30px 0;">
                  <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
                </p>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${url}</p>
                <p style="color: #666; font-size: 14px;">This link expires in 1 hour.</p>
                <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this, ignore this email.</p>
              </div>
            `,
          },
          emailEnv,
        );
      },
      resetPasswordTokenExpiresIn: 3600,
    },

    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        const callbackUrl = `${config.appURL}/verify-email?verified=true`;
        const verificationUrl = `${url}&callbackURL=${encodeURIComponent(callbackUrl)}`;

        await sendEmail(
          {
            to: user.email,
            subject: "Verify your email address",
            text: `Hello ${user.name || "there"},\n\nWelcome! Please verify your email:\n\n${verificationUrl}\n\nThis link expires in 24 hours.`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Verify Your Email Address</h2>
                <p>Hello ${user.name || "there"},</p>
                <p>Welcome! Please verify your email by clicking the button below:</p>
                <p style="margin: 30px 0;">
                  <a href="${verificationUrl}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
                </p>
                <p style="color: #666; font-size: 14px;">Or copy this link: ${verificationUrl}</p>
                <p style="color: #666; font-size: 14px;">This link expires in 24 hours.</p>
                <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't create an account, ignore this email.</p>
              </div>
            `,
          },
          emailEnv,
        );
      },
    },

    plugins: [
      magicLink({
        async sendMagicLink({ email, token, url }) {
          await sendMagicLinkEmail({ email, url, token }, emailEnv);
        },
        expiresIn: 300,
      }),
      emailOTP({
        async sendVerificationOTP({ email, otp, type }) {
          await sendOTP({ email, otp, type }, emailEnv);
        },
        otpLength: 6,
        expiresIn: 600,
        allowedAttempts: 3,
      }),
      siwe({
        domain: config.siweDomain || "localhost:3000",
        emailDomainName: config.siweEmailDomain || "localhost",
        anonymous: true,
        getNonce: async () => {
          return generateRandomString(32);
        },
        verifyMessage: async ({ message, signature, address }) => {
          try {
            return await verifyMessage({
              address: address as `0x${string}`,
              message,
              signature: signature as `0x${string}`,
            });
          } catch (error) {
            console.error("SIWE verification failed:", error);
            return false;
          }
        },
      }),
      passkey({
        rpID: config.passkeyRpId || "localhost",
        rpName: config.passkeyRpName || "Better Auth Template",
        origin: config.passkeyOrigin || config.appURL || "http://localhost:3000",
        authenticatorSelection: {
          authenticatorAttachment: undefined,
          residentKey: "preferred",
          userVerification: "preferred",
        },
      }),
    ],

    socialProviders: {
      ...(config.twitterClientId && config.twitterClientSecret
        ? {
            twitter: {
              clientId: config.twitterClientId,
              clientSecret: config.twitterClientSecret,
            },
          }
        : {}),
      ...(config.googleClientId && config.googleClientSecret
        ? {
            google: {
              clientId: config.googleClientId,
              clientSecret: config.googleClientSecret,
            },
          }
        : {}),
    },

    advanced: {
      useSecureCookies: config.baseURL.startsWith("https"),
      crossSubDomainCookies: { enabled: true },
    },
  });
}
