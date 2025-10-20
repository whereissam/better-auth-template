import { authClient } from '@/lib/auth.client';

/**
 * Google OAuth Authentication Hook
 *
 * Simple wrapper around Better Auth's Google provider
 * Can be used alongside Twitter and SIWE authentication
 */
export const useGoogleAuth = () => {
  /**
   * Login with Google OAuth
   * Redirects to Google authorization page
   */
  const loginWithGoogle = async () => {
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  return { loginWithGoogle };
};
