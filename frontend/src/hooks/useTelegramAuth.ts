import { authClient } from '@/lib/auth.client';

/**
 * Telegram Authentication Hook
 *
 * Uses better-auth-telegram plugin's OIDC flow.
 */
export const useTelegramAuth = () => {
  const signIn = async () => {
    try {
      await (authClient as any).signInWithTelegramOIDC({
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error('Telegram login error:', error);
      throw error;
    }
  };

  return { signIn };
};
