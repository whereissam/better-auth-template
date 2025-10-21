import { useTwitterAuth } from './useTwitterAuth';
import { useGoogleAuth } from './useGoogleAuth';
import { useSIWE } from './useSIWE';
import { useAccount } from 'wagmi';
import { useEffect, useRef } from 'react';

/**
 * Unified Auth Hook
 *
 * Combines Twitter, Google OAuth and SIWE authentication
 * Provides a single interface for all auth methods
 *
 * This hook manages all authentication methods through Better Auth
 */
export const useAuth = () => {
  const twitter = useTwitterAuth();
  const google = useGoogleAuth();
  const siwe = useSIWE();
  const { address, isConnected } = useAccount();
  const hasTriggeredSIWE = useRef(false);
  const previousConnected = useRef(false);

  // Twitter auth hook handles the session for all OAuth providers
  // (Better Auth manages a unified session)
  const user = twitter.user;
  const isLoading = twitter.isLoading;

  // Get wallet address if connected
  const walletAddress = isConnected ? address : null;

  // Auto-trigger SIWE ONLY when wallet connection state changes from disconnected to connected
  useEffect(() => {
    const justConnected = isConnected && !previousConnected.current;

    // Only trigger if:
    // 1. Wallet JUST connected (not already connected)
    // 2. We have an address
    // 3. No Better Auth session exists yet
    // 4. Haven't already triggered SIWE for this address
    // 5. Not currently loading (to avoid double triggers)
    if (justConnected && address && !user && !hasTriggeredSIWE.current && !twitter.isLoading) {
      hasTriggeredSIWE.current = true;
      console.log('🔵 Auto-triggering SIWE for newly connected address:', address);

      // Small delay to ensure wallet is fully ready
      setTimeout(() => {
        siwe.signIn().catch((error) => {
          console.error('Auto SIWE failed:', error);
          // Reset flag on user rejection/cancel so they can try again manually
          if (error?.message?.includes('User rejected') || error?.message?.includes('denied')) {
            hasTriggeredSIWE.current = false;
          }
        });
      }, 300);
    }

    // Track connection state for next render
    previousConnected.current = isConnected;

    // Reset flag when wallet disconnects OR when user is logged in
    if (!isConnected || user) {
      hasTriggeredSIWE.current = false;
    }
  }, [isConnected, address, user, twitter.isLoading]);

  // Login methods
  const loginWithTwitter = twitter.login;
  const loginWithGoogle = google.loginWithGoogle;
  const loginWithSIWE = siwe.signIn;

  // Logout uses twitter's logout (which clears the Better Auth session)
  const logout = twitter.logout;

  return {
    // User info
    user,
    isLoading,
    walletAddress,

    // Login methods
    loginWithTwitter,
    loginWithGoogle,
    loginWithSIWE,

    // SIWE state
    isSIWELoading: siwe.isLoading,
    isWalletConnected: isConnected,

    // Logout
    logout,
  };
};
