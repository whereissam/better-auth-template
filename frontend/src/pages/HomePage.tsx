import { AuthModal } from '../components/LoginButton';
import { PasskeyManager } from '../components/PasskeyAuth';
import { Navbar } from '../components/ui/navbar';
import { useAuth } from '../hooks/useAuth';
import { useProviders } from '../hooks/useProviders';
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, Zap, Palette, Fingerprint, CheckCircle, X } from 'lucide-react';

export function HomePage() {
  const { user, isLoading } = useAuth();
  const { providers } = useProviders();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showVerificationSuccess, setShowVerificationSuccess] = useState(false);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.emailVerified) {
      setShowVerificationSuccess(true);
      window.history.replaceState({}, document.title);
      setTimeout(() => setShowVerificationSuccess(false), 5000);
    }
  }, [location]);

  // Synthetic email detection
  const isSIWEUser = user?.email?.startsWith('0x') && user?.email?.includes('@localhost');
  const isSyntheticEmail = isSIWEUser || user?.email?.endsWith('@telegram.local');

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Navbar */}
      <Navbar onSignIn={() => setShowLoginModal(true)} />

      {/* Auth Modal — rendered at page level to avoid navbar stacking context */}
      {showLoginModal && (
        <AuthModal onClose={() => setShowLoginModal(false)} />
      )}

      {/* Email Verification Success Toast */}
      <AnimatePresence>
        {showVerificationSuccess && (
          <motion.div
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-white rounded-xl shadow-lg shadow-green-500/10 border border-green-100 px-4 py-3 flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
              <p className="text-sm font-medium text-green-800 flex-1">
                Email verified successfully! You can now sign in.
              </p>
              <button
                onClick={() => setShowVerificationSuccess(false)}
                className="text-green-400 hover:text-green-600 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-24">
            <motion.div
              className="inline-block w-8 h-8 border-[3px] border-gray-200 border-t-blue-500 rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <p className="mt-4 text-sm text-gray-500">Loading...</p>
          </div>
        ) : user ? (
          /* Authenticated State */
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Avatar */}
            {user.image ? (
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <img
                  src={user.image}
                  alt={user.name || 'User'}
                  className="w-20 h-20 rounded-full border-2 border-white shadow-lg ring-4 ring-gray-100"
                />
              </motion.div>
            ) : isSIWEUser ? (
              <motion.div
                className="inline-block mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-20 h-20 rounded-full border-2 border-white shadow-lg ring-4 ring-purple-100 bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                  </svg>
                </div>
              </motion.div>
            ) : null}

            <motion.h2
              className="text-2xl font-bold text-gray-900 mb-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {user.name
                ? `Welcome, ${user.name}!`
                : user.email && !isSyntheticEmail
                  ? `Welcome, ${user.email}!`
                  : 'Welcome!'}
            </motion.h2>

            {isSIWEUser ? (
              <motion.p
                className="text-sm text-gray-500 mb-1 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                Connected with Ethereum
              </motion.p>
            ) : user.email && !isSyntheticEmail ? (
              <motion.p
                className="text-sm text-gray-500 mb-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
              >
                {user.email}
              </motion.p>
            ) : null}

            <motion.p
              className="text-sm text-gray-400"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              You're successfully authenticated
            </motion.p>

            {user.id && (
              <motion.p
                className="text-xs text-gray-300 mt-2 font-mono"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
              >
                {user.id.slice(0, 8)}...{user.id.slice(-8)}
              </motion.p>
            )}

            {/* Manage Passkeys Button */}
            {providers.passkey && (
              <motion.button
                onClick={() => setShowPasskeyModal(true)}
                className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium rounded-full border border-gray-200 shadow-sm transition-colors cursor-pointer"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Fingerprint className="w-4 h-4" />
                Manage Passkeys
              </motion.button>
            )}
          </motion.div>
        ) : (
          /* Unauthenticated Hero */
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 tracking-tight">
              Auth, done right.
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto">
              A production-ready authentication template with social OAuth, passkeys, and more.
            </p>
            <motion.button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-7 py-3 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-colors shadow-lg shadow-gray-900/20 cursor-pointer"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              Get Started
            </motion.button>
          </motion.div>
        )}

        {/* Features Grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: Lock,
              title: 'Secure Authentication',
              desc: 'Built with Better Auth for enterprise-grade security',
              iconBg: 'bg-blue-50',
              iconColor: 'text-blue-500',
            },
            {
              icon: Zap,
              title: 'Social OAuth',
              desc: 'Twitter, Google, Telegram, and more providers ready to use',
              iconBg: 'bg-amber-50',
              iconColor: 'text-amber-500',
            },
            {
              icon: Palette,
              title: 'Easy to Customize',
              desc: 'Clean code structure, fully typed with TypeScript',
              iconBg: 'bg-violet-50',
              iconColor: 'text-violet-500',
            },
          ].map((feature, i) => (
            <motion.div
              key={feature.title}
              className="text-center p-6 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 + i * 0.1 }}
            >
              <div className={`w-10 h-10 rounded-xl ${feature.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{feature.title}</h3>
              <p className="text-sm text-gray-500">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Passkey Management Modal */}
      <AnimatePresence>
        {providers.passkey && showPasskeyModal && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setShowPasskeyModal(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900">Manage Passkeys</h2>
                <button
                  onClick={() => setShowPasskeyModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <PasskeyManager />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
