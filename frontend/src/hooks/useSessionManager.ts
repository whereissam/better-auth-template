import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth.client';
import { getCachedSession, setCachedSession, clearSessionCache } from '@/lib/sessionCache';

interface AuthUser {
  id: string;
  username: string;
  avatar: string;
  email?: string;
  name?: string;
  image?: string;
  emailVerified?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Session Manager Hook
 *
 * Manages authentication session state for ALL auth methods:
 * - Email & Password
 * - OAuth providers (Google, Twitter, etc.)
 * - SIWE (Sign in with Ethereum)
 *
 * Features:
 * - Unified session management for all auth providers
 * - Session caching to reduce API calls
 * - Auto-refresh on window focus (after OAuth redirect)
 * - Rate limiting protection
 */
export const useSessionManager = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

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

          if (twitterAccount || userData.name || userData.email) {
            const authUser: AuthUser = {
              id: userData.id,
              username: userData.name || twitterAccount?.accountId || 'User',
              avatar: userData.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.id}`,
              email: userData.email,
              name: userData.name,
              image: userData.image,
              emailVerified: userData.emailVerified,
              createdAt: userData.createdAt,
              updatedAt: userData.updatedAt,
            };
            setUser(authUser);
            console.log('✅ User authenticated:', authUser);
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

    // Check auth immediately
    checkAuth();

    // Re-check auth when window gains focus (after OAuth redirect)
    // Only check if we might have just come back from OAuth flow
    let focusDebounceTimer: NodeJS.Timeout;
    let lastFocusCheck = 0;
    const handleFocus = () => {
      const now = Date.now();
      // Only recheck if:
      // 1. It's been more than 10 seconds since last check (increased from 5)
      // 2. AND we don't already have a user (to avoid unnecessary checks)
      if (now - lastFocusCheck < 10000 || user) return;

      lastFocusCheck = now;
      console.log('🔄 Window focused, rechecking auth...');
      clearTimeout(focusDebounceTimer);
      focusDebounceTimer = setTimeout(() => {
        // Clear cache before checking to ensure fresh data
        clearSessionCache();
        checkAuth();
      }, 500);
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearTimeout(focusDebounceTimer);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  /**
   * Logout current user
   * Clears session and cache for ALL auth methods
   */
  const logout = async () => {
    console.log('🔴 Logout initiated');

    // Clear cache and local state immediately
    clearSessionCache();
    setUser(null);

    // Sign out from backend with proper callback handling
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          console.log('✅ Signout successful, redirecting...');
          // Redirect to home page
          window.location.href = window.location.origin;
        },
        onError: (ctx) => {
          console.error('❌ Signout error:', ctx.error);
          // Even on error, redirect to clear state
          window.location.href = window.location.origin;
        },
      },
    });
  };

  return { user, logout, isLoading };
};
