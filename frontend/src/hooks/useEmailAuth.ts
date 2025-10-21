import { useState } from 'react';
import { authClient } from '@/lib/auth.client';

/**
 * Hook for email and password authentication
 */
export const useEmailAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signUp = async (email: string, password: string, name: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to sign up');
        return { success: false, error: result.error };
      }

      // After signup, user needs to verify email before they can sign in
      return { success: true, data: result.data, requiresVerification: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = true) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        rememberMe,
      });

      if (result.error) {
        // Check if error is due to unverified email (403 status)
        if (result.error.status === 403) {
          setError('Please verify your email address before signing in. Check your inbox for the verification link.');
        } else {
          setError(result.error.message || 'Failed to sign in');
        }
        return { success: false, error: result.error };
      }

      // Successfully signed in - no need to redirect, just return success
      return { success: true, data: result.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordReset = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.forgetPassword({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to request password reset');
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (newPassword: string, token: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authClient.resetPassword({
        newPassword,
        token,
      });

      if (result.error) {
        setError(result.error.message || 'Failed to reset password');
        return { success: false, error: result.error };
      }

      return { success: true, data: result.data };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signUp,
    signIn,
    requestPasswordReset,
    resetPassword,
    isLoading,
    error,
  };
};
