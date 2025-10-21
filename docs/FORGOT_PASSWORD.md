# Forgot Password / Password Reset

This template now includes a complete password reset flow using Better Auth.

## How It Works

### User Flow

1. **User clicks "Forgot password?"** on the sign-in form
2. **Enters their email** in the forgot password modal
3. **Receives an email** with a reset link (valid for 1 hour)
4. **Clicks the link** which takes them to `/reset-password?token=...`
5. **Enters new password** (must be 8+ characters)
6. **Password is reset** and they're redirected to the homepage

### Development Mode

In development, emails are **logged to the backend console** instead of being sent. Check your backend terminal to see the reset link.

Example output:
```
📧 ===== EMAIL (Development Mode) =====
To: user@example.com
Subject: Reset your password

Hello John,

You requested to reset your password. Click the link below to reset it:

http://localhost:3000/reset-password?token=abc123...

This link will expire in 1 hour.
====================================
```

### Production Mode

To enable email sending in production, configure an email service:

#### Option 1: Resend (Recommended)

1. Install Resend:
```bash
cd backend
bun add resend
```

2. Get API key from https://resend.com

3. Add to `.env`:
```env
RESEND_API_KEY=re_xxxxx
```

4. Update `backend/lib/email.ts`:
```typescript
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await resend.emails.send({
    from: 'noreply@yourdomain.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};
```

#### Option 2: SendGrid

1. Install SendGrid:
```bash
cd backend
bun add @sendgrid/mail
```

2. Update `backend/lib/email.ts`:
```typescript
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await sgMail.send({
    from: 'noreply@yourdomain.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};
```

#### Option 3: Nodemailer (SMTP)

1. Install Nodemailer:
```bash
cd backend
bun add nodemailer
bun add -D @types/nodemailer
```

2. Update `backend/lib/email.ts`:
```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'noreply@yourdomain.com',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  });
};
```

## Files Modified

### Backend
- `backend/lib/auth.ts` - Added `sendResetPassword` configuration
- `backend/lib/email.ts` - Email service (logs to console in dev)

### Frontend
- `frontend/src/components/ForgotPasswordModal.tsx` - New modal for requesting reset
- `frontend/src/components/EmailAuthForm.tsx` - Added "Forgot password?" button
- `frontend/src/pages/ResetPassword.tsx` - New page for resetting password
- `frontend/src/App.tsx` - Added routing for `/reset-password`
- `frontend/src/hooks/useEmailAuth.ts` - Already had reset methods

## Configuration

### Token Expiration

Default: 1 hour (3600 seconds)

To change, update `backend/lib/auth.ts`:
```typescript
emailAndPassword: {
  resetPasswordTokenExpiresIn: 7200, // 2 hours
}
```

### Email Templates

Customize email templates in `backend/lib/auth.ts` in the `sendResetPassword` function.

## Testing

1. **Start the backend** (if not running):
```bash
cd backend
bun run dev:server
```

2. **Sign up** with an email account

3. **Click "Forgot password?"** on sign-in form

4. **Enter your email**

5. **Check backend console** for the reset link

6. **Copy the link** and paste it in your browser

7. **Enter new password** and submit

8. **Sign in** with the new password

## Security Features

- ✅ Tokens expire after 1 hour
- ✅ One-time use tokens
- ✅ Secure password hashing with scrypt
- ✅ Email validation
- ✅ Password strength requirements (min 8 chars)
- ✅ HTTPS required in production

## Troubleshooting

### "Email service not configured" error
In production, you need to implement a real email service. See options above.

### Reset link doesn't work
- Check if token expired (1 hour limit)
- Verify the URL includes `?token=...`
- Check backend logs for errors

### Email not received (production)
- Verify email service credentials
- Check spam folder
- Verify sender email is authenticated
- Check email service dashboard for delivery status
