import { authClient } from '@/lib/auth.client';

/**
 * Telegram OAuth (OIDC) Authentication Hook
 *
 * Uses Better Auth genericOAuth plugin with Telegram's OIDC provider.
 */
export const useTelegramAuth = () => {
  const signIn = async () => {
    try {
      await authClient.signIn.oauth2({
        providerId: 'telegram',
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error('Telegram login error:', error);
      throw error;
    }
  };

  return { signIn };
};
