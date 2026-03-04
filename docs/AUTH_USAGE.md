# Authentication Usage Guide

This project uses a centralized auth approach with `useAuth` plus provider discovery from `/api/auth/providers`.

## Unified Auth Hook

Use `useAuth` for session state and sign-in actions:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    user,
    isLoading,
    walletAddress,
    signInWithGoogle,
    signInWithTwitter,
    signInWithTelegram,
    signInWithEthereum,
    signOut,
  } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  return user ? (
    <div>
      <p>Welcome, {user.name ?? user.email}</p>
      {walletAddress && <p>Wallet: {walletAddress}</p>}
      <button onClick={signOut}>Logout</button>
    </div>
  ) : (
    <div>
      <button onClick={signInWithGoogle}>Google</button>
      <button onClick={signInWithTwitter}>X</button>
      <button onClick={signInWithTelegram}>Telegram</button>
      <button onClick={signInWithEthereum}>Ethereum</button>
    </div>
  );
}
```

## Provider Availability

The frontend checks enabled providers dynamically:

```tsx
import { useProviders } from '@/hooks/useProviders';

const { providers, isLoading } = useProviders();
// providers.email / google / twitter / telegram / siwe / passkey
```

`useProviders` calls `GET /api/auth/providers`. Buttons are enabled only when backend credentials/config are present.

## Auth Methods

### 1. Email and Password

```tsx
import { authClient } from '@/lib/auth.client';

await authClient.signUp.email({
  email: 'user@example.com',
  password: 'password123',
  name: 'Test User',
});

await authClient.signIn.email({
  email: 'user@example.com',
  password: 'password123',
});
```

### 2. Google and X OAuth

```tsx
await authClient.signIn.social({
  provider: 'google', // or 'twitter'
  callbackURL: window.location.origin,
});
```

### 3. Telegram OAuth (Generic OAuth)

```tsx
await authClient.signIn.oauth2({
  providerId: 'telegram',
  callbackURL: window.location.origin,
});
```

### 4. Magic Link

```tsx
await authClient.signIn.magicLink({ email: 'user@example.com' });
```

### 5. Email OTP

```tsx
await authClient.emailOtp.sendVerificationOtp({
  email: 'user@example.com',
  type: 'sign-in',
});

await authClient.signIn.emailOtp({
  email: 'user@example.com',
  otp: '123456',
});
```

### 6. Passkey

Use `PasskeyAuth` for sign-in and `PasskeyManager` for registration/deletion:
- `authClient.signIn.passkey()`
- `authClient.passkey.addPasskey()`
- `authClient.passkey.listUserPasskeys()`
- `authClient.passkey.deletePasskey()`

## Common Pitfall: Tunnel Callback URL

OAuth hooks send `callbackURL: window.location.origin`. If you open the app from a tunnel URL, backend must allow that origin.

Set in `backend/.env`:
- `APP_URL=<your current frontend URL>`
- `TRUSTED_ORIGINS=<same URL, comma-separated if multiple>`

Keep backend URL separate:
- Local Node.js/Bun backend: `BETTER_AUTH_URL=http://localhost:4200`
