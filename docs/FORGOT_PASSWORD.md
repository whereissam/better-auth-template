# Forgot Password / Password Reset

Complete password reset flow using Better Auth + Resend.

## How It Works

### User Flow

1. User clicks "Forgot password?" on the sign-in form
2. Enters their email in the forgot password modal
3. Receives an email with a reset link (valid for 1 hour)
4. Clicks the link → `/reset-password?token=...`
5. Enters new password (8+ characters)
6. Password is reset, redirected to homepage

### Development Mode

When `RESEND_API_KEY` is not set, the reset link is logged to the backend console:

```
[email] Resend not configured — skipping email to user@example.com (subject: "Reset your password")
```

To test password reset in dev, you'll need to set `RESEND_API_KEY` or use the Better Auth API directly.

### Production Mode

Set these environment variables:

```env
RESEND_API_KEY=re_xxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

The email service (`backend/src/lib/email.ts`) uses raw `fetch` to the Resend API — works on Cloudflare Workers, Node.js, and Bun.

## Configuration

### Token Expiration

Default: 1 hour (3600 seconds). To change, update `backend/src/lib/auth.ts`:

```typescript
emailAndPassword: {
  resetPasswordTokenExpiresIn: 7200, // 2 hours
}
```

### Email Templates

Email templates are defined inline in `backend/src/lib/auth.ts` in the `sendResetPassword` callback. Customize the HTML to match your branding.

## Files

### Backend
- `backend/src/lib/auth.ts` — `sendResetPassword` configuration
- `backend/src/lib/email.ts` — `sendEmail()` function (raw fetch to Resend)

### Frontend
- `frontend/src/components/ForgotPasswordModal.tsx` — Request reset modal
- `frontend/src/components/EmailAuthForm.tsx` — "Forgot password?" button
- `frontend/src/pages/ResetPassword.tsx` — Reset password page
- `frontend/src/App.tsx` — Route for `/reset-password`

## Testing

1. Start backend: `cd backend && bun run dev`
2. Sign up with an email account
3. Click "Forgot password?" on sign-in form
4. Enter your email
5. Check email (or backend console in dev) for the reset link
6. Click the link, enter new password
7. Sign in with the new password

## Security Features

- Tokens expire after 1 hour
- One-time use tokens
- Secure password hashing with scrypt
- Password strength requirements (min 8 chars)
- HTTPS required in production

## Troubleshooting

### Reset link doesn't work
- Check if token expired (1 hour limit)
- Verify the URL includes `?token=...`
- Check backend logs for errors

### Email not received
- Verify `RESEND_API_KEY` is set
- Check spam folder
- Verify sender domain is configured in Resend dashboard
- Check Resend dashboard for delivery status
