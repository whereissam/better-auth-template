import { useSessionManager } from './useSessionManager';
import { useTwitterAuth } from './useTwitterAuth';
import { useGoogleAuth } from './useGoogleAuth';
import { useSIWE } from './useSIWE';
import { useAccount } from 'wagmi';
import { useEffect, useRef } from 'react';

/**
 * Unified Auth Hook
 *
 * Combines all authentication methods:
 * - Email & Password
 * - OAuth providers (Google, Twitter, etc.)
 * - SIWE (Sign in with Ethereum)
 *
 * Provides a single interface for all auth methods through Better Auth
 */
export const useAuth = () => {
  const session = useSessionManager();
  const twitter = useTwitterAuth();
  const google = useGoogleAuth();
  const siwe = useSIWE();
  const { address, isConnected } = useAccount();
  const hasTriggeredSIWE = useRef(false);
  const previousConnected = useRef(false);

  // Session manager handles the session for all auth methods
  // (Better Auth manages a unified session)
  const user = session.user;
  const isLoading = session.isLoading;

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
    if (justConnected && address && !user && !hasTriggeredSIWE.current && !session.isLoading) {
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
  }, [isConnected, address, user, session.isLoading]);

  // All auth methods now use consistent "signIn" naming
  const signInWithTwitter = twitter.signIn;
  const signInWithGoogle = google.signIn;
  const signInWithEthereum = siwe.signIn;

  // Logout - shared across all auth methods (clears the Better Auth session)
  const signOut = session.logout;

  return {
    // User info
    user,
    isLoading,
    walletAddress,

    // Sign in methods - all use consistent naming
    signInWithTwitter,
    signInWithGoogle,
    signInWithEthereum,

    // SIWE state
    isSIWELoading: siwe.isLoading,
    isWalletConnected: isConnected,

    // Sign out - works for all auth methods
    signOut,
  };
};
