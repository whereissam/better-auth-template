import { useSessionManager } from './useSessionManager';
import { useTwitterAuth } from './useTwitterAuth';
import { useGoogleAuth } from './useGoogleAuth';
import { isWagmiEnabled } from '@/lib/wagmi';
import { useEffect, useRef } from 'react';

// Static imports are safe (no throw). The hooks just can't be *called* outside WagmiProvider.
import { useAccount } from 'wagmi';
import { useSIWE } from './useSIWE';

const noopAccount = { address: undefined as string | undefined, isConnected: false };
const noopSIWE = { signIn: () => Promise.resolve(), isLoading: false, error: null, isConnected: false, address: undefined as string | undefined };

export const useAuth = () => {
  const session = useSessionManager();
  const twitter = useTwitterAuth();
  const google = useGoogleAuth();

  // isWagmiEnabled is a module-level constant — hook count is stable across renders
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const account = isWagmiEnabled ? useAccount() : noopAccount;
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const siwe = isWagmiEnabled ? useSIWE() : noopSIWE;

  const { address, isConnected } = account;

  const hasTriggeredSIWE = useRef(false);
  const previousConnected = useRef(false);

  const user = session.user;
  const isLoading = session.isLoading;
  const walletAddress = isConnected ? address : null;

  // Auto-trigger SIWE when wallet connects
  useEffect(() => {
    if (!isWagmiEnabled) return;

    const justConnected = isConnected && !previousConnected.current;

    if (justConnected && address && !user && !hasTriggeredSIWE.current && !session.isLoading) {
      hasTriggeredSIWE.current = true;

      setTimeout(() => {
        siwe.signIn().catch((error: any) => {
          console.error('Auto SIWE failed:', error);
          if (error?.message?.includes('User rejected') || error?.message?.includes('denied')) {
            hasTriggeredSIWE.current = false;
          }
        });
      }, 300);
    }

    previousConnected.current = isConnected;

    if (!isConnected || user) {
      hasTriggeredSIWE.current = false;
    }
  }, [isConnected, address, user, session.isLoading]);

  const signOut = session.logout;

  return {
    user,
    isLoading,
    walletAddress,

    signInWithTwitter: twitter.signIn,
    signInWithGoogle: google.signIn,
    signInWithEthereum: siwe.signIn,

    isSIWELoading: siwe.isLoading,
    isWalletConnected: isConnected,

    signOut,
  };
};
