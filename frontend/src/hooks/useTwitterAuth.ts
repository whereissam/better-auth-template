import { authClient } from '@/lib/auth.client';

/**
 * Twitter OAuth Authentication Hook
 *
 * Simple wrapper around Better Auth's Twitter provider
 * Can be used alongside Google and SIWE authentication
 */
export const useTwitterAuth = () => {
  /**
   * Sign in with Twitter OAuth
   * Redirects to Twitter authorization page
   */
  const signIn = async () => {
    try {
      await authClient.signIn.social({
        provider: 'twitter',
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error('Twitter login error:', error);
      throw error;
    }
  };

  return { signIn };
};
