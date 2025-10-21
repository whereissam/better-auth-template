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
