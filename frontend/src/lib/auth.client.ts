import { createAuthClient } from "better-auth/react";
import { siweClient, emailOTPClient, magicLinkClient } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";

/**
 * Better Auth React Client
 *
 * Configuration:
 * - baseURL: Uses window.location.origin to work with proxy setup
 *   - Dev: http://localhost:3000/api/* -> Vite proxy -> backend at :3005
 *   - Prod: https://yourdomain.com/api/* -> Reverse proxy -> backend
 * - credentials: "include" ensures cookies are sent with requests
 * - SIWE plugin for Ethereum wallet authentication
 * - Email OTP plugin for OTP-based authentication
 * - Magic Link plugin for passwordless authentication
 * - Passkey plugin for WebAuthn authentication
 */
const client = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  fetchOptions: {
    credentials: "include",
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  plugins: [siweClient(), emailOTPClient(), magicLinkClient(), passkeyClient()] as any,
});

// Type definitions for plugin methods
type AuthClientResult<T = any> = Promise<{ data: T | null; error: { message?: string; status?: number } | null }>;

interface FetchOptions {
  onSuccess?: () => void;
  onError?: (ctx: { error: any }) => void;
}

interface ExtendedAuthClient {
  // Core methods
  signUp: {
    email: (opts: { email: string; password: string; name?: string }) => AuthClientResult;
  };
  signIn: {
    email: (opts: { email: string; password: string; rememberMe?: boolean }) => AuthClientResult;
    social: (opts: { provider: string; callbackURL?: string }) => AuthClientResult;
    passkey: (opts?: { autoFill?: boolean }) => AuthClientResult;
  };
  signOut: (opts?: { fetchOptions?: FetchOptions }) => AuthClientResult;
  getSession: () => AuthClientResult<{ user: any; session: any }>;
  forgetPassword: ((opts: { email: string; redirectTo?: string }) => AuthClientResult) & {
    emailOtp: (opts: { email: string }) => AuthClientResult;
  };
  resetPassword: (opts: { newPassword: string; token: string }) => AuthClientResult;
  useSession: () => { data: any; isPending: boolean; error: any };

  // SIWE plugin
  siwe: {
    getNonce: () => AuthClientResult<{ nonce: string }>;
    nonce: (opts: { walletAddress: string; chainId: number }) => AuthClientResult<{ nonce: string }>;
    verify: (opts: { message: string; signature: string; walletAddress: string; chainId: number }) => AuthClientResult;
  };

  // Email OTP plugin
  emailOtp: {
    sendVerificationOtp: (opts: { email: string; type: 'email-verification' | 'sign-in' | 'forget-password' }) => AuthClientResult;
    checkVerificationOtp: (opts: { email: string; otp: string; type: string }) => AuthClientResult;
    verifyEmail: (opts: { email: string; otp: string }) => AuthClientResult;
    resetPassword: (opts: { email: string; otp: string; password: string }) => AuthClientResult;
  };

  // Passkey plugin
  passkey: {
    addPasskey: (opts?: { name?: string; authenticatorAttachment?: "platform" | "cross-platform" }) => AuthClientResult;
    listUserPasskeys: (opts?: object) => AuthClientResult<any[]>;
    deletePasskey: (opts: { id: string }) => AuthClientResult;
    updatePasskey: (opts: { id: string; name: string }) => AuthClientResult;
  };
}

// Export with explicit type to help TypeScript infer plugin methods
export const authClient = client as unknown as ExtendedAuthClient;
