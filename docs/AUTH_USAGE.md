# Authentication Usage Guide

This project uses a **centralized authentication approach** with the `useAuth` hook.

## Unified Auth Hook

All authentication methods (Google, Twitter, SIWE, Passkey) are handled through a single hook:

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
    connectWallet,
    loginWithSIWE,
    logout,

    // Wallet state (for SIWE)
    isWalletConnected,
    walletAddress,
    isSIWELoading,
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

### 1. Google OAuth
```tsx
const { loginWithGoogle } = useAuth();

<button onClick={loginWithGoogle}>
  Sign in with Google
</button>
```

### 2. Twitter/X OAuth
```tsx
const { loginWithTwitter } = useAuth();

<button onClick={loginWithTwitter}>
  Sign in with Twitter
</button>
```

### 3. SIWE (Sign-In with Ethereum)
```tsx
const {
  connectWallet,
  loginWithSIWE,
  isWalletConnected,
  walletAddress,
  isSIWELoading
} = useAuth();

// Step 1: Connect wallet
if (!isWalletConnected) {
  return <button onClick={connectWallet}>Connect Wallet</button>;
}

// Step 2: Sign in with connected wallet
return (
  <button onClick={loginWithSIWE} disabled={isSIWELoading}>
    Sign in with Ethereum
  </button>
);
```

### 4. Passkey (WebAuthn)
Passkeys provide passwordless authentication using biometrics or device PIN.

#### Sign In with Passkey
```tsx
import { PasskeyAuth } from '@/components/PasskeyAuth';

// In your login modal
<PasskeyAuth
  mode="signin"
  onSuccess={() => {
    // Handle successful sign in
    window.location.reload();
  }}
/>
```

#### Register a Passkey (User must be signed in)
```tsx
import { authClient } from '@/lib/auth.client';

// Register a new passkey
const handleRegisterPasskey = async () => {
  const result = await authClient.passkey.addPasskey({
    name: 'My MacBook', // Optional name for the passkey
  });

  if (result.error) {
    console.error('Failed to register passkey:', result.error);
  } else {
    console.log('Passkey registered successfully!');
  }
};
```

#### Manage Passkeys
```tsx
import { PasskeyManager } from '@/components/PasskeyAuth';

// In your settings/profile page
<PasskeyManager />
```

This component allows users to:
- View all registered passkeys
- Add new passkeys
- Delete existing passkeys

### 5. Logout (works for all methods)
```tsx
const { logout } = useAuth();

<button onClick={logout}>Logout</button>
```

## Session Data

The hook provides user session information:

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
3. **Easy to Use** - Import one hook, get everything you need
4. **Type Safe** - Full TypeScript support
5. **Maintainable** - Changes to auth flow only need updates in one file

## Old Hooks (Deprecated)

The following hooks are now deprecated and replaced by `useAuth`:
- ❌ `useTwitterAuth`
- ❌ `useGoogleAuth`
- ❌ `useSIWE`

Always use `useAuth` instead!
