import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth.client';
import { FingerprintIcon } from './ui/icons/fingerprint-icon';

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

  // Check if browser supports WebAuthn
  const [supportsPasskey, setSupportsPasskey] = useState(false);

  useEffect(() => {
    const checkSupport = async () => {
      if (window.PublicKeyCredential) {
        try {
          // Check platform authenticator support
          const platformAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
          setSupportsPasskey(platformAvailable);

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
        <div className="mb-2.5 px-4 py-2.5 bg-amber-50/80 border border-amber-200/60 rounded-2xl">
          <p className="text-xs text-amber-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-2.5 px-4 py-2.5 bg-green-50/80 border border-green-200/60 rounded-2xl">
          <p className="text-xs text-green-600">{success}</p>
        </div>
      )}

      {(mode === 'signin' || mode === 'both') && (
        <button
          onClick={handleSignIn}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
        >
          {isLoading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <FingerprintIcon size={16} />
          )}
          Sign in with Passkey
        </button>
      )}
    </div>
  );
};

interface PasskeyManagerProps {}

/**
 * Passkey Manager Component
 * For managing passkeys when user is already authenticated
 */
export const PasskeyManager = ({}: PasskeyManagerProps) => {
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
      <div className="px-4 py-3 bg-amber-50/80 border border-amber-200/60 rounded-2xl">
        <p className="text-sm text-amber-700">
          Your browser or device doesn't support passkeys.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Passkeys let you sign in with your fingerprint, face, or device PIN.
      </p>

      {error && (
        <div className="px-4 py-2.5 bg-red-50/80 border border-red-200/60 rounded-2xl">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="px-4 py-2.5 bg-green-50/80 border border-green-200/60 rounded-2xl">
          <p className="text-xs text-green-600">{success}</p>
        </div>
      )}

      {/* Register new passkey */}
      <div className="flex gap-2">
        <input
          type="text"
          value={newPasskeyName}
          onChange={(e) => setNewPasskeyName(e.target.value)}
          placeholder="Passkey name (optional)"
          className="flex-1 px-4 py-2 text-sm border border-gray-200 rounded-full bg-gray-50/50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-300 transition-colors"
        />
        <button
          onClick={handleRegister}
          disabled={isRegistering}
          className="px-5 py-2 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
        >
          {isRegistering ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Add'
          )}
        </button>
      </div>

      {/* List existing passkeys */}
      {isLoading ? (
        <div className="flex justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      ) : passkeys.length > 0 ? (
        <ul className="divide-y divide-gray-100 border border-gray-200/60 rounded-2xl overflow-hidden">
          {passkeys.map((passkey) => (
            <li key={passkey.id} className="flex items-center justify-between px-4 py-3 bg-white/50">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {passkey.name || 'Unnamed passkey'}
                </p>
                <p className="text-xs text-gray-400">
                  {new Date(passkey.createdAt).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(passkey.id)}
                className="text-xs text-red-500 hover:text-red-600 font-medium cursor-pointer transition-colors"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-400 text-center py-3">
          No passkeys registered yet.
        </p>
      )}
    </div>
  );
};
