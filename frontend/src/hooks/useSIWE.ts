import { useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { SiweMessage } from 'siwe';
import { authClient } from '@/lib/auth.client';

/**
 * Sign-In With Ethereum (SIWE) Hook
 *
 * Implements SIWE authentication flow with Better Auth:
 * 1. Get nonce from Better Auth backend
 * 2. Create SIWE message with nonce
 * 3. User signs message with wallet
 * 4. Send to Better Auth for verification
 * 5. Better Auth creates authenticated session
 */

export const useSIWE = () => {
  const { address, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Sign in with Ethereum wallet using Better Auth
   */
  const signIn = async () => {
    if (!address) {
      setError('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔵 Starting SIWE flow for address:', address);

      // 1. Get nonce from Better Auth backend
      console.log('Calling authClient.siwe.nonce with:', { walletAddress: address, chainId: chainId || 1 });
      const nonceRes = await authClient.siwe.nonce({
        walletAddress: address,
        chainId: chainId || 1,
      });

      console.log('Nonce response:', nonceRes);

      if (!nonceRes.data?.nonce) {
        console.error('No nonce in response:', nonceRes);
        console.error('Error details:', nonceRes.error);
        throw new Error(nonceRes.error?.message || 'Failed to get nonce from server');
      }

      const nonce = nonceRes.data.nonce;
      console.log('🔑 Got nonce:', nonce);

      // 2. Create SIWE message (must match Better Auth's expected format)
      const siweMessage = new SiweMessage({
        domain: window.location.host,
        address: address,
        statement: 'Sign in with Ethereum to the app.',
        uri: window.location.origin,
        version: '1',
        chainId: chainId || 1,
        nonce: nonce,
        // Don't include optional fields that might break parsing
      });

      const message = siweMessage.prepareMessage();
      console.log('📝 SIWE Message:\n', message);
      console.log('Message line count:', message.split('\n').length);

      // 3. Request signature from wallet
      const signature = await signMessageAsync({
        account: address,
        message: message,
      });

      console.log('✅ Signature received');

      // 4. Verify signature with Better Auth
      const verifyRes = await authClient.siwe.verify({
        message,
        signature,
        walletAddress: address,
        chainId: chainId || 1,
      });

      if (!verifyRes.data) {
        throw new Error('SIWE verification failed');
      }

      console.log('✅ SIWE authentication successful');

      // Reload to update session
      window.location.reload();

      return verifyRes.data;
    } catch (err: any) {
      console.error('❌ SIWE error:', err);
      const errorMessage = err.message || 'Failed to sign in with Ethereum';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    isLoading,
    error,
    isConnected: !!address,
    address,
  };
};
