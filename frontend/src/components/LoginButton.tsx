import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EmailAuthForm } from './EmailAuthForm';

interface LoginButtonProps {
  onShowModal?: () => void;
  showModal?: boolean;
  onCloseModal?: () => void;
}

/**
 * Login Button Component
 * Shows "Sign in" button in header, opens modal with OAuth options
 */
export const LoginButton = ({ onShowModal, showModal: externalShowModal, onCloseModal }: LoginButtonProps = {}) => {
  const { user, isLoading, logout, walletAddress } = useAuth();
  const [internalShowModal, setInternalShowModal] = useState(false);

  // Use external modal control if provided, otherwise use internal state
  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const setShowModal = onShowModal || (() => setInternalShowModal(true));
  const handleCloseModal = onCloseModal || (() => setInternalShowModal(false));

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    // Determine if user logged in via SIWE by checking if email contains wallet address format
    const isSIWEUser = user.email?.startsWith('0x') && user.email?.includes('@localhost');

    // Display name logic
    let displayName = user.name || user.email || 'User';
    if (isSIWEUser && walletAddress) {
      // For SIWE users, show shortened wallet address
      displayName = `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }

    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5">
          {user.image ? (
            <img
              src={user.image}
              alt={displayName}
              className="w-8 h-8 rounded-full"
            />
          ) : isSIWEUser ? (
            // Ethereum icon for SIWE users
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
              </svg>
            </div>
          ) : null}
          <span className="text-sm font-medium text-gray-900">
            {displayName}
          </span>
        </div>
        <button
          onClick={logout}
          className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
      >
        Sign in
      </button>

      {showModal && (
        <AuthModal onClose={handleCloseModal} />
      )}
    </>
  );
};

interface AuthModalProps {
  onClose: () => void;
}

const AuthModal = ({ onClose }: AuthModalProps) => {
  const {
    loginWithGoogle,
    loginWithTwitter,
  } = useAuth();

  const [showEmailAuth, setShowEmailAuth] = useState(false);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-8 w-full max-w-md mx-4 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Sign in</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-6">
          Join our community of friendly folks discovering and sharing the latest products in tech.
        </p>

        {showEmailAuth ? (
          <div>
            <EmailAuthForm onClose={onClose} />
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowEmailAuth(false)}
                className="text-sm text-gray-600 hover:text-gray-900 flex items-center justify-center w-full"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to other options
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Email & Password */}
            <button
              onClick={() => setShowEmailAuth(true)}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Continue with Email
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          {/* Twitter / X */}
          <button
            onClick={loginWithTwitter}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            Sign in with X
          </button>

          {/* Google */}
          <button
            onClick={loginWithGoogle}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          {/* Ethereum Wallet - Just connect, no SIWE in modal */}
          <ConnectButton.Custom>
            {({
              openConnectModal,
              mounted,
            }) => {
              return (
                <div
                  {...(!mounted && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  <button
                    onClick={openConnectModal}
                    className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                    </svg>
                    Sign in with Ethereum
                  </button>
                </div>
              );
            }}
          </ConnectButton.Custom>

            <p className="text-xs text-gray-500 text-center mt-6">
              We'll never post to any of your accounts without your permission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
