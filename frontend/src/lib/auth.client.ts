import { createAuthClient } from "better-auth/react";
import { siweClient, emailOTPClient } from "better-auth/client/plugins";

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
 */
export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : '',
  fetchOptions: {
    credentials: "include",
  },
  plugins: [siweClient(), emailOTPClient()],
});
