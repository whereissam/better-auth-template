import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth.client';

interface PasskeyAuthProps {
  onSuccess?: () => void;
  mode?: 'signin' | 'register' | 'both';
}

/**
 * Passkey Authentication Component
 * Supports signing in with passkeys and registering new passkeys
 *
 * Note: The passkey sign-in button only appears if:
 * 1. Browser supports WebAuthn
 * 2. Browser supports Conditional UI (to check for existing passkeys)
 */
export const PasskeyAuth = ({ onSuccess, mode = 'both' }: PasskeyAuthProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Check if browser supports WebAuthn and Conditional UI
  const [supportsPasskey, setSupportsPasskey] = useState(false);
  const [supportsConditionalUI, setSupportsConditionalUI] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          // Check platform authenticator support
          const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setSupportsPasskey(platformAvailable);

          // Check Conditional UI support (for autofill)
          if (typeof PublicKeyCredential.isConditionalMediationAvailable === 'function') {
            const conditionalAvailable = await PublicKeyCredential.isConditionalMediationAvailable();
            setSupportsConditionalUI(conditionalAvailable);
          }
        } catch {
          setSupportsPasskey(false);
        }
      }
    };
    checkSupport();
  }, []);

  const handleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await authClient.signIn.passkey();

      if (result.error) {
        // Check for specific error messages
        const errorMsg = result.error.message || '';
        if (errorMsg.includes('No credentials') || errorMsg.includes('not found')) {
          setError('No passkey found for this device. Please sign in with another method first, then register a passkey.');
        } else {
          setError(errorMsg || 'Failed to sign in with passkey');
        }
      } else {
        setSuccess('Signed in successfully!');
        onSuccess?.();
      }
    } catch (err: any) {
      // Handle user cancellation gracefully
      if (err.name === 'NotAllowedError') {
        setError('No passkey found or authentication was cancelled. Please sign in with another method first to register a passkey.');
      } else if (err.message?.includes('No credentials')) {
        setError('No passkey registered on this device. Sign in with email or social login first, then add a passkey.');
      } else {
        setError(err.message || 'Failed to sign in with passkey');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!supportsPasskey) {
    return null; // Don't show passkey option if not supported
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {(mode === 'signin' || mode === 'both') && (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
            </svg>
          )}
          Sign in with Passkey
        </button>
      )}
    </div>
  );
};

interface PasskeyManagerProps {
  userId?: string;
}

/**
 * Passkey Manager Component
 * For managing passkeys when user is already authenticated
 */
export const PasskeyManager = ({ userId }: PasskeyManagerProps) => {
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [newPasskeyName, setNewPasskeyName] = useState('');

  // Check if browser supports WebAuthn
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setSupportsPasskey(available);
        } catch {
          setSupportsPasskey(false);
        }
      }
    };
    checkSupport();
  }, []);

  // Load existing passkeys
  useEffect(() => {
    loadPasskeys();
  }, []);

  const loadPasskeys = async () => {
    setIsLoading(true);
    try {
      const result = await authClient.passkey.listUserPasskeys();
      if (result.data) {
        setPasskeys(result.data);
      }
    } catch (err) {
      console.error('Failed to load passkeys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('Starting passkey registration...');
      const result = await authClient.passkey.addPasskey({
        name: newPasskeyName || undefined,
      });

      console.log('Passkey registration result:', result);

      if (result.error) {
        const errorMsg = result.error.message || '';
        if (errorMsg.includes('timed out') || errorMsg.includes('timeout')) {
          setError('Registration timed out. Please try again and complete the biometric/PIN prompt quickly.');
        } else if (errorMsg.includes('not allowed') || errorMsg.includes('NotAllowedError')) {
          setError('Registration was cancelled or not allowed. Make sure you complete the biometric/PIN prompt.');
        } else {
          setError(errorMsg || 'Failed to register passkey');
        }
      } else {
        setSuccess('Passkey registered successfully! You can now use it to sign in.');
        setNewPasskeyName('');
        loadPasskeys();
      }
    } catch (err: any) {
      console.error('Passkey registration error:', err);
      if (err.name === 'NotAllowedError' || err.message?.includes('not allowed')) {
        setError('Registration was cancelled. Please try again and complete the biometric/PIN verification.');
      } else if (err.name === 'AbortError' || err.message?.includes('timed out') || err.message?.includes('timeout')) {
        setError('Registration timed out. Please try again and respond to the prompt more quickly.');
      } else if (err.name === 'InvalidStateError') {
        setError('A passkey for this account may already exist on this device.');
      } else {
        setError(err.message || 'Failed to register passkey. Please try again.');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  const handleDelete = async (passkeyId: string) => {
    if (!confirm('Are you sure you want to delete this passkey?')) return;

    try {
      const result = await authClient.passkey.deletePasskey({ id: passkeyId });
      if (result.error) {
        setError(result.error.message || 'Failed to delete passkey');
      } else {
        setSuccess('Passkey deleted successfully');
        loadPasskeys();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete passkey');
    }
  };

  if (!supportsPasskey) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-700">
          Your browser or device doesn't support passkeys.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Passkeys</h3>
      <p className="text-sm text-gray-600">
        Passkeys are a secure, passwordless way to sign in using your fingerprint, face, or device PIN.
      </p>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-600">{success}</p>
        </div>
      )}

      {/* Register new passkey */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPasskeyName}
          onChange={(e) => setNewPasskeyName(e.target.value)}
          placeholder="Passkey name (optional)"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors"
        >
          {isRegistering ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Add Passkey'
          )}
        </button>
      </div>

      {/* List existing passkeys */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : passkeys.length > 0 ? (
        <ul className="divide-y divide-gray-200 border border-gray-200 rounded-lg">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between p-3">
              <div>
                <p className="font-medium text-gray-900">
                  {passkey.name || 'Unnamed passkey'}
                </p>
                <p className="text-xs text-gray-500">
                  Created: {new Date(passkey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(passkey.id)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          No passkeys registered yet.
        </p>
      )}
    </div>
  );
};
