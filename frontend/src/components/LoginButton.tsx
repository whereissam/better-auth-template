import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProviders } from '@/hooks/useProviders';
import { isWagmiEnabled } from '@/lib/wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { EmailAuthForm } from './EmailAuthForm';
import { PasskeyAuth } from './PasskeyAuth';
import { MailIcon } from './ui/icons/mail-icon';
import { XTwitterIcon } from './ui/icons/x-twitter-icon';
import { GoogleIcon } from './ui/icons/google-icon';
import { TelegramIcon } from './ui/icons/telegram-icon';
import { EthereumIcon } from './ui/icons/ethereum-icon';

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
  const { user, isLoading, signOut, walletAddress } = useAuth();
  const [internalShowModal, setInternalShowModal] = useState(false);

  // Use external modal control if provided, otherwise use internal state
  const showModal = externalShowModal !== undefined ? externalShowModal : internalShowModal;
  const handleShowModal = onShowModal || (() => setInternalShowModal(true));
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
          onClick={signOut}
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
        onClick={handleShowModal}
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

export interface AuthModalProps {
  onClose: () => void;
}

export const AuthModal = ({ onClose }: AuthModalProps) => {
  const {
    signInWithGoogle,
    signInWithTwitter,
    signInWithTelegram,
  } = useAuth();

  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const { providers, isLoading: providersLoading } = useProviders();

  return (
    <div
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white/80 backdrop-blur-md rounded-3xl p-7 w-full max-w-sm mx-4 shadow-xl shadow-black/[0.06] border border-white/60"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-gray-900">Sign in</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100/80 hover:bg-gray-200/80 text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="text-gray-500 text-sm mb-5">
          Choose your preferred sign-in method.
        </p>

        {providersLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-gray-200 border-t-gray-500 rounded-full animate-spin" />
          </div>
        ) : showEmailAuth ? (
          <div>
            <EmailAuthForm onClose={onClose} />
            <div className="mt-5 pt-5 border-t border-gray-200/60">
              <button
                onClick={() => setShowEmailAuth(false)}
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center w-full gap-2 cursor-pointer transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to other options
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Email & Password */}
            <button
              onClick={providers.email ? () => setShowEmailAuth(true) : undefined}
              disabled={!providers.email}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                providers.email
                  ? 'bg-gray-900 hover:bg-gray-800 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <MailIcon size={16} isAnimated={providers.email} />
              Continue with Email
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className="flex-1 h-px bg-gray-200/80"></div>
              <span className="text-xs text-gray-400">or</span>
              <div className="flex-1 h-px bg-gray-200/80"></div>
            </div>

            {/* Twitter / X */}
            <button
              onClick={providers.twitter ? signInWithTwitter : undefined}
              disabled={!providers.twitter}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                providers.twitter
                  ? 'bg-black hover:bg-gray-800 text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <XTwitterIcon size={16} className={providers.twitter ? '' : 'opacity-40'} isAnimated={providers.twitter} />
              Sign in with X
            </button>

            {/* Google */}
            <button
              onClick={providers.google ? signInWithGoogle : undefined}
              disabled={!providers.google}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-full border transition-colors ${
                providers.google
                  ? 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 cursor-pointer'
                  : 'bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed'
              }`}
            >
              <GoogleIcon size={16} disabled={!providers.google} isAnimated={providers.google} />
              Sign in with Google
            </button>

            {/* Telegram */}
            <button
              onClick={providers.telegram ? signInWithTelegram : undefined}
              disabled={!providers.telegram}
              className={`w-full flex items-center justify-center gap-2.5 px-5 py-2.5 text-sm font-medium rounded-full transition-colors ${
                providers.telegram
                  ? 'bg-[#229ED9] hover:bg-[#1d8abc] text-white cursor-pointer'
                  : 'bg-gray-100 text-gray-300 cursor-not-allowed'
              }`}
            >
              <TelegramIcon size={16} className={providers.telegram ? '' : 'opacity-40'} isAnimated={providers.telegram} />
              Sign in with Telegram
            </button>

            {/* Ethereum Wallet */}
            {providers.siwe && isWagmiEnabled ? (
              <ConnectButton.Custom>
                {({
                  openConnectModal,
                  mounted,
                }) => {
                  if (!mounted) return null;

                  return (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (openConnectModal) {
                          openConnectModal();
                        }
                      }}
                      type="button"
                      className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white text-sm font-medium rounded-full transition-colors cursor-pointer"
                    >
                      <EthereumIcon size={16} />
                      Sign in with Ethereum
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            ) : (
              <button
                disabled
                className="w-full flex items-center justify-center gap-2.5 px-5 py-2.5 bg-gray-100 text-gray-300 text-sm font-medium rounded-full cursor-not-allowed"
              >
                <EthereumIcon size={16} className="opacity-40" isAnimated={false} />
                Sign in with Ethereum
              </button>
            )}

            {/* Passkey Authentication */}
            {providers.passkey && (
              <PasskeyAuth
                mode="signin"
                onSuccess={() => {
                  onClose();
                  window.location.reload();
                }}
              />
            )}

            <p className="text-xs text-gray-400 text-center pt-3">
              We'll never post to any of your accounts without your permission.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
