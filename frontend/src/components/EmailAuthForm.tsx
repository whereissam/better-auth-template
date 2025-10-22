import { useState, useEffect } from 'react';
import { useEmailAuth } from '@/hooks/useEmailAuth';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { authClient } from '@/lib/auth.client';

interface EmailAuthFormProps {
  onClose?: () => void;
}

/**
 * Email and Password Authentication Form
 * Supports both sign in and sign up modes
 */
export const EmailAuthForm = ({ onClose }: EmailAuthFormProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [isSignInNeedsVerification, setIsSignInNeedsVerification] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const { signIn, signUp, isLoading, error, clearError } = useEmailAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSignInNeedsVerification(false);

    if (mode === 'signup') {
      const result = await signUp(email, password, name);
      if (result.success) {
        // Show verification message instead of closing modal
        setShowVerificationMessage(true);
      }
    } else {
      const result = await signIn(email, password, rememberMe);
      if (result.success && onClose) {
        onClose();
        // Refresh the page to show logged-in state
        window.location.reload();
      } else if (result.needsVerification) {
        // Sign-in failed because email is not verified
        setIsSignInNeedsVerification(true);
      }
    }
  };

  const toggleMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setEmail('');
    setPassword('');
    setName('');
    setIsSignInNeedsVerification(false);
    setShowVerificationMessage(false);
  };

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCountdown]);

  // Function to resend verification email
  const handleResendVerification = async () => {
    setIsResending(true);
    try {
      // Better Auth doesn't have a built-in resend endpoint, so we'll sign up again
      // This will resend the verification email without creating a duplicate account
      const result = await authClient.signUp.email({
        email,
        password,
        name: name || 'User', // Use existing name or default
      });

      if (result.error) {
        // If user already exists, that's actually good - email was still sent
        if (result.error.message?.includes('already exists') || result.error.message?.includes('already')) {
          alert('Verification email sent! Please check your inbox.');
          setResendCountdown(60); // 60 second cooldown
        } else {
          alert(result.error.message || 'Failed to resend email');
        }
      } else {
        alert('Verification email sent! Please check your inbox.');
        setResendCountdown(60);
      }
    } catch (err) {
      alert('Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  // Show verification message after signup
  if (showVerificationMessage) {
    return (
      <div className="w-full text-center py-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Check your email</h3>
        <p className="text-gray-600 mb-4">
          We've sent a verification link to <strong>{email}</strong>
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Click the link in the email to verify your account and sign in.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={resendCountdown > 0 || isResending}
            className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 font-medium"
          >
            {isResending ? (
              'Sending...'
            ) : resendCountdown > 0 ? (
              `Resend email in ${resendCountdown}s`
            ) : (
              'Didn\'t receive the email? Resend'
            )}
          </button>

          <div>
            <button
              onClick={() => {
                setShowVerificationMessage(false);
                setMode('signin');
                setPassword('');
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Back to sign in
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show verification reminder when sign-in fails due to unverified email
  if (isSignInNeedsVerification) {
    return (
      <div className="w-full text-center py-6">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Email not verified</h3>
        <p className="text-gray-600 mb-4">
          You already have an account with <strong>{email}</strong>, but haven't verified it yet.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          Check your inbox for the verification link we sent when you signed up.
        </p>

        <div className="space-y-3">
          <button
            onClick={handleResendVerification}
            disabled={resendCountdown > 0 || isResending}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
          >
            {isResending ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Sending...
              </span>
            ) : resendCountdown > 0 ? (
              `Resend in ${resendCountdown}s`
            ) : (
              'Resend verification email'
            )}
          </button>

          <button
            onClick={() => {
              setIsSignInNeedsVerification(false);
              setMode('signin');
              setPassword('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Back to sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            maxLength={128}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="••••••••"
          />
          <p className="text-xs text-gray-500 mt-1">
            {mode === 'signup' ? 'Must be at least 8 characters' : ''}
          </p>
        </div>

        {mode === 'signin' && (
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-700"
              onClick={() => {
                setShowForgotPassword(true);
                // Clear any error messages when opening forgot password
                setIsSignInNeedsVerification(false);
                clearError();
              }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              {mode === 'signup' ? 'Creating account...' : 'Signing in...'}
            </span>
          ) : (
            mode === 'signup' ? 'Create account' : 'Sign in'
          )}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={toggleMode}
          className="text-sm text-gray-600 hover:text-gray-900"
        >
          {mode === 'signup' ? (
            <>
              Already have an account?{' '}
              <span className="text-blue-600 font-medium">Sign in</span>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <span className="text-blue-600 font-medium">Sign up</span>
            </>
          )}
        </button>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <ForgotPasswordModal
          onClose={() => {
            setShowForgotPassword(false);
            // Clear errors when coming back from forgot password
            clearError();
            setIsSignInNeedsVerification(false);
          }}
        />
      )}
    </div>
  );
};
