/**
 * Email Service — raw fetch to Resend API (works in Workers, Node.js, Bun)
 */

export interface EmailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export async function sendEmail(
  options: EmailOptions,
  env: EmailEnv,
): Promise<void> {
  const apiKey = env.RESEND_API_KEY;
  const fromEmail = env.RESEND_FROM_EMAIL || "onboarding@resend.dev";

  if (!apiKey) {
    console.warn(
      `[email] Resend not configured — skipping email to ${options.to} (subject: "${options.subject}")`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API error ${res.status}: ${body}`);
  }

  console.log(`[email] Sent to ${options.to}`);
}

export interface OTPOptions {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password";
}

export async function sendOTP(
  options: OTPOptions,
  env: EmailEnv,
): Promise<void> {
  const { email, otp, type } = options;

  const subjects: Record<string, string> = {
    "sign-in": "Your sign-in code",
    "email-verification": "Verify your email address",
    "forget-password": "Reset your password",
  };

  const labels: Record<string, string> = {
    "sign-in": "Sign In Code",
    "email-verification": "Verify Your Email",
    "forget-password": "Reset Your Password",
  };

  await sendEmail(
    {
      to: email,
      subject: subjects[type],
      text: `Your ${type} code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, ignore this email.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>${labels[type]}</h2>
          <p>Your code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #1f2937;">${otp}</span>
          </div>
          <p style="color: #666; font-size: 14px;">This code expires in 10 minutes.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    },
    env,
  );
}

export interface MagicLinkOptions {
  email: string;
  url: string;
  token: string;
}

export async function sendMagicLinkEmail(
  options: MagicLinkOptions,
  env: EmailEnv,
): Promise<void> {
  const { email, url } = options;

  await sendEmail(
    {
      to: email,
      subject: "Sign in to your account",
      text: `Click the link below to sign in:\n\n${url}\n\nThis link expires in 5 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Sign In to Your Account</h2>
          <p>Click the button below to sign in:</p>
          <div style="margin: 30px 0;">
            <a href="${url}" style="background-color: #3b82f6; color: white; padding: 12px 32px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">Sign In</a>
          </div>
          <p style="color: #666; font-size: 14px;">Or copy this link:</p>
          <p style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; word-break: break-all; font-size: 12px; color: #1f2937;">${url}</p>
          <p style="color: #666; font-size: 14px; margin-top: 20px;">This link expires in 5 minutes.</p>
          <p style="color: #999; font-size: 12px; margin-top: 40px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    },
    env,
  );
}
