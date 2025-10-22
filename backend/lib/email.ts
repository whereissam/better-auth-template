/**
 * Email Service Configuration
 *
 * This file contains email sending utilities for Better Auth.
 *
 * To enable email verification and password reset:
 * 1. Configure an email service (e.g., SendGrid, AWS SES, Resend, etc.)
 * 2. Implement the sendEmail function below
 * 3. Uncomment and configure the email options in auth.ts
 *
 * Example with Resend:
 * ```
 * import { Resend } from 'resend';
 * const resend = new Resend(process.env.RESEND_API_KEY);
 *
 * export async function sendEmail({ to, subject, text, html }: EmailOptions) {
 *   await resend.emails.send({
 *     from: 'noreply@yourdomain.com',
 *     to,
 *     subject,
 *     text,
 *     html,
 *   });
 * }
 * ```
 */

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

/**
 * Send an email (placeholder implementation)
 * Replace this with your actual email service
 */
export async function sendEmail(options: EmailOptions): Promise<void> {
  // TODO: Implement with your email service
  console.log('📧 Email would be sent:', options);

  // For development, you can log the email to console
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`To: ${options.to}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Body:\n${options.text}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // Uncomment when you have an email service configured
  // throw new Error('Email service not configured. Please implement sendEmail in backend/lib/email.ts');
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

  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📨 OTP Email (${type})`);
    console.log(`To: ${email}`);
    console.log(`Subject: ${subjects[type]}`);
    console.log(`\n🔐 OTP CODE: ${otp}\n`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }

  // TODO: In production, send via email service
  // await sendEmail({
  //   to: email,
  //   subject: subjects[type],
  //   text: messages[type],
  //   html: htmlMessages[type],
  // });
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
