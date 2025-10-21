# Email & Password Authentication

This guide explains how email and password authentication is implemented in the Better Auth template.

## Overview

Email and password authentication has been added to the template alongside existing OAuth providers (Twitter, Google) and SIWE (Sign in with Ethereum). Users can now:

- Sign up with email and password
- Sign in with email and password
- Request password resets (once email service is configured)
- Verify their email addresses (once email service is configured)

## Implementation

### Backend Configuration

The backend auth configuration (`backend/lib/auth.ts`) has been updated to enable email/password authentication:

```typescript
emailAndPassword: {
  enabled: true,
  minPasswordLength: 8,
  maxPasswordLength: 128,
}
```

### Frontend Components

#### 1. Email Authentication Hook (`frontend/src/hooks/useEmailAuth.ts`)

A custom hook that provides methods for:
- `signUp(email, password, name)` - Register a new user
- `signIn(email, password, rememberMe)` - Sign in existing user
- `requestPasswordReset(email)` - Request password reset link
- `resetPassword(newPassword, token)` - Reset password with token

#### 2. Email Auth Form (`frontend/src/components/EmailAuthForm.tsx`)

A reusable form component that:
- Supports both sign-in and sign-up modes
- Includes form validation (min 8 characters for password)
- Shows loading states during authentication
- Displays error messages
- Allows toggling between sign-in and sign-up

#### 3. Updated Login Button (`frontend/src/components/LoginButton.tsx`)

The login modal now features:
- Primary "Continue with Email" button
- Tabbed interface switching between email auth and OAuth providers
- Clean, organized UI with email auth as the first option

## Usage

### Sign Up

Users can create an account by:
1. Clicking "Sign in" in the header
2. Clicking "Continue with Email"
3. Switching to "Sign up" mode
4. Entering name, email, and password (min 8 characters)
5. Clicking "Create account"

### Sign In

Users can log in by:
1. Clicking "Sign in" in the header
2. Clicking "Continue with Email"
3. Entering email and password
4. Optionally checking "Remember me"
5. Clicking "Sign in"

### Password Requirements

- Minimum length: 8 characters
- Maximum length: 128 characters
- Stored using scrypt hashing algorithm (OWASP recommended)

## Email Verification & Password Reset (Optional)

Email verification and password reset features require configuring an email service. The template includes helper files and documentation for this:

### Setup Email Service

1. **Choose an email provider** (e.g., Resend, SendGrid, AWS SES, Mailgun)

2. **Install the provider's SDK**:
   ```bash
   cd backend
   bun add resend  # or your preferred provider
   ```

3. **Configure environment variables** in `backend/.env`:
   ```env
   RESEND_API_KEY=your_api_key_here
   # or for other providers
   SENDGRID_API_KEY=your_api_key_here
   ```

4. **Implement the email sending function** in `backend/lib/email.ts`:
   ```typescript
   import { Resend } from 'resend';
   const resend = new Resend(process.env.RESEND_API_KEY);

   export async function sendEmail({ to, subject, text, html }: EmailOptions) {
     await resend.emails.send({
       from: 'noreply@yourdomain.com',
       to,
       subject,
       text,
       html,
     });
   }
   ```

5. **Update auth configuration** in `backend/lib/auth.ts`:
   ```typescript
   import { sendEmail } from './email';

   export const auth = betterAuth({
     // ... other config

     emailAndPassword: {
       enabled: true,
       minPasswordLength: 8,
       maxPasswordLength: 128,
       sendResetPassword: async ({ user, url, token }, request) => {
         await sendEmail({
           to: user.email,
           subject: 'Reset your password',
           text: `Click the link to reset your password: ${url}`,
           html: `<p>Click the link to reset your password: <a href="${url}">${url}</a></p>`,
         });
       },
       resetPasswordTokenExpiresIn: 3600, // 1 hour
     },

     emailVerification: {
       sendVerificationEmail: async ({ user, url, token }, request) => {
         await sendEmail({
           to: user.email,
           subject: 'Verify your email',
           text: `Click the link to verify your email: ${url}`,
           html: `<p>Click the link to verify your email: <a href="${url}">${url}</a></p>`,
         });
       },
     },
   });
   ```

### Require Email Verification

To require users to verify their email before logging in:

```typescript
emailAndPassword: {
  enabled: true,
  requireEmailVerification: true,
}
```

This will:
- Block unverified users from signing in
- Send a verification email on every sign-in attempt
- Return a 403 error with appropriate message

## Security Features

1. **Password Hashing**: Uses scrypt algorithm (OWASP recommended)
2. **Remember Me**: Optional session persistence
3. **Password Length Validation**: Enforces min/max length
4. **Secure Cookies**: Enabled in production
5. **CORS Protection**: Trusted origins configured

## Database Schema

Email/password authentication uses Better Auth's standard schema:
- `user` table: Stores user profile (id, email, name, image)
- `account` table: Stores credentials (providerId: "credential")
- `session` table: Manages user sessions

## API Endpoints

Better Auth automatically provides these endpoints:

- `POST /api/auth/sign-up/email` - Create new account
- `POST /api/auth/sign-in/email` - Sign in
- `POST /api/auth/sign-out` - Sign out
- `POST /api/auth/forget-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/send-verification-email` - Send verification email
- `POST /api/auth/verify-email` - Verify email with token

## Testing

To test the email/password authentication:

1. Start the development servers:
   ```bash
   # From project root
   ./start.sh
   ```

2. Open http://localhost:3000

3. Click "Sign in" and then "Continue with Email"

4. Try creating a new account with:
   - Name: Test User
   - Email: test@example.com
   - Password: testpassword123

5. After successful signup, you'll be redirected and logged in

6. Try logging out and logging back in with the same credentials

## Troubleshooting

### Common Issues

1. **"Failed to sign up"**
   - Check that PostgreSQL is running
   - Verify database connection in backend logs
   - Ensure email is not already registered

2. **"Failed to sign in"**
   - Verify email and password are correct
   - Check backend logs for detailed errors
   - Ensure user account exists

3. **Email verification/reset not working**
   - Verify email service is configured in `backend/lib/email.ts`
   - Check email service API keys in environment variables
   - Review backend logs for email sending errors

## Next Steps

- Configure an email service for verification and password reset
- Add custom email templates with your branding
- Implement password strength requirements
- Add rate limiting for auth endpoints
- Configure 2FA/MFA (Better Auth supports this)

## References

- [Better Auth Documentation](https://better-auth.com)
- [Email & Password Docs](https://better-auth.com/docs/authentication/email-password)
- [Email Verification](https://better-auth.com/docs/authentication/email-password#email-verification)
- [Password Reset](https://better-auth.com/docs/authentication/email-password#request-password-reset)
