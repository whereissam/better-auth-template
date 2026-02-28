# Authentication Usage Guide

This project uses a **centralized authentication approach** with the `useAuth` hook.

## Unified Auth Hook

All authentication methods are handled through a single hook:

```tsx
import { useAuth } from '@/hooks/useAuth';

function MyComponent() {
  const {
    // Session data
    user,
    session,
    isLoading,

    // Login methods
    loginWithGoogle,
    loginWithTwitter,
    logout,
  } = useAuth();

  return (
    <div>
      {user ? (
        <div>
          <p>Welcome, {user.name}!</p>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <div>
          <button onClick={loginWithGoogle}>Login with Google</button>
          <button onClick={loginWithTwitter}>Login with Twitter</button>
        </div>
      )}
    </div>
  );
}
```

## Authentication Methods

### 1. Email & Password
```tsx
import { authClient } from '@/lib/auth.client';

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password123",
  name: "Test User",
});

// Sign in
await authClient.signIn.email({
  email: "user@example.com",
  password: "password123",
});
```

### 2. Google OAuth
```tsx
const { loginWithGoogle } = useAuth();

<button onClick={loginWithGoogle}>
  Sign in with Google
</button>
```

### 3. Twitter/X OAuth
```tsx
const { loginWithTwitter } = useAuth();

<button onClick={loginWithTwitter}>
  Sign in with Twitter
</button>
```

### 4. Magic Link
```tsx
import { authClient } from '@/lib/auth.client';

await authClient.signIn.magicLink({
  email: "user@example.com",
});
// User receives email with sign-in link
```

### 5. Email OTP
```tsx
import { authClient } from '@/lib/auth.client';

// Send OTP
await authClient.emailOtp.sendVerificationOtp({
  email: "user@example.com",
  type: "sign-in",
});

// Verify OTP
await authClient.signIn.emailOtp({
  email: "user@example.com",
  otp: "123456",
});
```

### 6. Logout (works for all methods)
```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## Session Data

```tsx
const { user, session } = useAuth();

console.log(user?.name);      // User's name
console.log(user?.email);     // User's email
console.log(user?.image);     // Profile picture URL
console.log(session);         // Full session object
```

## Benefits of Centralized Auth

1. **Single Source of Truth** - All auth logic in one place
2. **Consistent API** - Same patterns for all auth methods
3. **Easy to Use** - Import one hook, get everything
4. **Type Safe** - Full TypeScript support
5. **Maintainable** - Changes only needed in one file
