# Email & Password Authentication

How email and password authentication works in this template.

## Overview

Users can:
- Sign up with email and password
- Sign in with email and password
- Request password resets (via Resend email)
- Verify their email addresses

## Backend Configuration

The auth factory (`backend/src/lib/auth.ts`) configures email/password:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
  sendResetPassword: async ({ user, url }) => {
    await sendEmail({ to: user.email, subject: "Reset your password", ... }, emailEnv);
  },
  resetPasswordTokenExpiresIn: 3600, // 1 hour
}
```

## Frontend Usage

### Sign Up

```tsx
import { authClient } from '@/lib/auth.client';

const result = await authClient.signUp.email({
  email: "user@example.com",
  password: "testpassword123",
  name: "Test User",
});
```

### Sign In

```tsx
const result = await authClient.signIn.email({
  email: "user@example.com",
  password: "testpassword123",
});
```

### Password Requirements

- Minimum length: 8 characters
- Maximum length: 128 characters
- Stored using scrypt hashing (OWASP recommended)

## Email Service

Emails are sent via [Resend](https://resend.com) using raw `fetch` (no SDK, works on all runtimes).

**Development**: If `RESEND_API_KEY` is not set, emails are skipped with a console warning. Check backend logs for verification links and OTP codes.

**Production**: Set `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in your environment.

## API Endpoints

Better Auth provides these automatically:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/sign-up/email` | POST | Create account |
| `/api/auth/sign-in/email` | POST | Sign in |
| `/api/auth/sign-out` | POST | Sign out |
| `/api/auth/forget-password` | POST | Request reset email |
| `/api/auth/reset-password` | POST | Reset with token |
| `/api/auth/send-verification-email` | POST | Send verify email |
| `/api/auth/verify-email` | POST | Verify with token |

## Database Schema

Email/password uses Better Auth's standard tables:
- `user` — Stores profile (id, email, name, image)
- `account` — Stores credentials (providerId: "credential", password hash)
- `session` — Manages user sessions

## Security Features

1. **Password Hashing**: scrypt algorithm (OWASP recommended)
2. **Email Verification**: Required before sign-in
3. **Secure Cookies**: HTTP-only, secure in production
4. **CORS Protection**: Trusted origins only

## Testing

1. Start backend: `cd backend && bun run dev`
2. Start frontend: `cd frontend && bun run dev`
3. Open http://localhost:3000
4. Click "Sign in" → "Sign up"
5. Create account with email/password
6. Check backend console for verification email (dev mode)

## Troubleshooting

### "Failed to sign up"
- Check backend logs for errors
- Ensure email is not already registered
- Verify database is running

### "Failed to sign in"
- Check email and password are correct
- If email verification is required, verify email first

### Email verification not working
- Check `RESEND_API_KEY` is set
- In dev mode, check backend console for verification link
- Verify sender email domain is configured in Resend

## References

- [Better Auth Email & Password Docs](https://better-auth.com/docs/authentication/email-password)
- [Resend Documentation](https://resend.com/docs)
