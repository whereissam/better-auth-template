import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth.client';
import { getCachedSession, setCachedSession, clearSessionCache } from '@/lib/sessionCache';

interface TwitterUser {
  username: string;
  avatar: string;
}

/**
 * Twitter Authentication Hook
 *
 * Manages Twitter OAuth authentication state and provides
 * login/logout methods.
 *
 * Features:
 * - Session caching to reduce API calls
 * - Auto-refresh on window focus (after OAuth redirect)
 * - Rate limiting protection
 * - Wallet address filtering (optional)
 */
export const useTwitterAuth = () => {
  const [user, setUser] = useState<TwitterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let debounceTimer: NodeJS.Timeout;

    // Check if user is already authenticated with Better Auth
    const checkAuth = async () => {
      try {
        // Check cache first
        const cachedSession = getCachedSession();
        let session;

        if (cachedSession) {
          session = cachedSession;
        } else {
          try {
            session = await authClient.getSession();
            // Cache the session if it was fetched from API
            setCachedSession(session);
          } catch (sessionError: any) {
            // Handle rate limiting or network errors
            if (sessionError?.message?.includes('429') || sessionError?.status === 429) {
              console.warn('⚠️ Rate limited while fetching session, will retry later');
            } else {
              console.error('❌ Error fetching session:', sessionError);
            }
            if (isMounted) setIsLoading(false);
            return;
          }
        }

        if (!isMounted) return;

        console.log('🔍 Session user:', session.data?.user);

        if (session.data?.user) {
          const userData = session.data.user;

          // Fetch linked accounts from Better Auth
          let accounts: any[] = [];
          try {
            const response = await fetch(`${window.location.origin}/api/auth/list-accounts`, {
              credentials: 'include',
            });
            if (response.ok) {
              accounts = await response.json();
              console.log('🔗 Linked accounts:', accounts);
            } else if (response.status === 429) {
              console.warn('⚠️ Rate limited while fetching accounts');
            }
          } catch (e) {
            console.error('Failed to fetch accounts:', e);
          }

          if (!isMounted) return;

          // Find Twitter account
          const twitterAccount = accounts.find((acc: any) => acc.providerId === 'twitter');

          if (twitterAccount || userData.name) {
            const twitterUser: TwitterUser = {
              username: userData.name || twitterAccount?.accountId || 'User',
              avatar: userData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
            };
            setUser(twitterUser);
            console.log('✅ Twitter user authenticated:', twitterUser);
          }
        } else {
          console.log('❌ No session found');
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error checking auth session:', error);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    // Debounce initial check
    debounceTimer = setTimeout(() => {
      checkAuth();
    }, 500);

    // Re-check auth when window gains focus (after OAuth redirect)
    let focusDebounceTimer: NodeJS.Timeout;
    let lastFocusCheck = 0;
    const handleFocus = () => {
      const now = Date.now();
      // Only recheck if it's been more than 5 seconds since last check
      if (now - lastFocusCheck < 5000) return;

      lastFocusCheck = now;
      console.log('🔄 Window focused, rechecking auth...');
      clearTimeout(focusDebounceTimer);
      focusDebounceTimer = setTimeout(() => {
        checkAuth();
      }, 1000);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimer);
      clearTimeout(focusDebounceTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /**
   * Login with Twitter OAuth
   * Redirects to Twitter authorization page
   */
  const login = async () => {
    setIsLoading(true);
    try {
      // Redirect to Better Auth Twitter OAuth
      await authClient.signIn.social({
        provider: 'twitter',
        callbackURL: window.location.origin,
      });
    } catch (error) {
      console.error('Twitter login error:', error);
      setIsLoading(false);
    }
  };

  /**
   * Logout current user
   * Clears session and cache
   */
  const logout = async () => {
    try {
      await authClient.signOut();
      clearSessionCache();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return { user, login, logout, isLoading };
};
