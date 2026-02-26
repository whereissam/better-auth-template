/**
 * Email Service Configuration
 *
 * Using Resend for email delivery
 */

import { Resend } from 'resend';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Sending email via Resend`);
    console.log(`To: ${options.to}`);
    console.log(`From: ${fromEmail}`);
    console.log(`Subject: ${options.subject}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Send email with Resend
  if (resend) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });
      console.log(`✅ Email sent successfully to ${options.to}`);
    } catch (error) {
      console.error('❌ Failed to send email:', error);
      throw error;
    }
  } else {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Email service not configured: RESEND_API_KEY is missing');
    }
    console.warn('⚠️  Resend not configured. Email not sent. Set RESEND_API_KEY to enable.');
  }
}

export interface OTPOptions {
  email: string;
  otp: string;
  type: 'sign-in' | 'email-verification' | 'forget-password';
}

/**
 * Send an OTP email
 * In development, logs to console. In production, use a real email service.
 */
export async function sendOTP(options: OTPOptions): Promise<void> {
  const { email, otp, type } = options;

  const subjects = {
    'sign-in': 'Your sign-in code',
    'email-verification': 'Verify your email address',
    'forget-password': 'Reset your password',
  };

  const messages = {
    'sign-in': `Your sign-in code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    'email-verification': `Your email verification code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
    'forget-password': `Your password reset code is: ${otp}\n\nThis code will expire in 10 minutes.\n\nIf you didn't request this code, please ignore this email.`,
  };

  const htmlMessages = {
    'sign-in': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Sign In Code</h2>
        <p>Your sign-in code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    'email-verification': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Verify Your Email</h2>
        <p>Your email verification code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
    'forget-password': `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Reset Your Password</h2>
        <p>Your password reset code is:</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
        </div>
        <p style="color: #666; font-size: 14px;">This code will expire in 10 minutes.</p>
        <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this code, please ignore this email.</p>
      </div>
    `,
  };

  // Log OTP code in development for easy testing
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 OTP Email (${type})`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subjects[type]}`);
    console.log(`\n🔐 OTP CODE: ${otp}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Send email via Resend
  await sendEmail({
    to: email,
    subject: subjects[type],
    text: messages[type],
    html: htmlMessages[type],
  });
}

export interface MagicLinkOptions {
  email: string;
  url: string;
  token: string;
}

/**
 * Send a magic link email
 */
export async function sendMagicLinkEmail(options: MagicLinkOptions): Promise<void> {
  const { email, url, token } = options;

  const subject = 'Sign in to your account';

  const text = `Click the link below to sign in to your account:\n\n${url}\n\nThis link will expire in 5 minutes.\n\nIf you didn't request this link, please ignore this email.`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2>Sign In to Your Account</h2>
      <p>Click the button below to sign in:</p>
      <div style="margin: 30px 0;">
        <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
          Sign In
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">Or copy this link:</p>
      <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #1f2937;">
        ${url}
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">This link will expire in 5 minutes.</p>
      <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this link, please ignore this email.</p>
    </div>
  `;

  // Log magic link in development for easy testing
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🔗 Magic Link Email`);
    console.log(`To: ${email}`);
    console.log(`\n🔐 MAGIC LINK:\n${url}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Send email via Resend
  await sendEmail({
    to: email,
    subject,
    text,
    html,
  });
}

/**
 * Example configuration for auth.ts:
 *
 * import { sendEmail } from './email';
 *
 * emailAndPassword: {
 *   enabled: true,
 *   minPasswordLength: 8,
 *   maxPasswordLength: 128,
 *   sendResetPassword: async ({ user, url, token }, request) => {
 *     await sendEmail({
 *       to: user.email,
 *       subject: 'Reset your password',
 *       text: `Click the link to reset your password: ${url}`,
 *       html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
 *     });
 *   },
 *   resetPasswordTokenExpiresIn: 3600, // 1 hour
 * },
 *
 * emailVerification: {
 *   sendVerificationEmail: async ({ user, url, token }, request) => {
 *     await sendEmail({
 *       to: user.email,
 *       subject: 'Verify your email',
 *       text: `Click the link to verify your email: ${url}`,
 *       html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
 *     });
 *   },
 * },
 */
