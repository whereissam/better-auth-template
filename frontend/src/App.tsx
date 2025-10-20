import { LoginButton } from './components/LoginButton';
import { useAuth } from './hooks/useAuth';
import { useState } from 'react';

/**
 * Example App Component
 */
function App() {
  const { user, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">
              Better Auth Template
            </h1>
            <LoginButton
              onShowModal={() => setShowLoginModal(true)}
              showModal={showLoginModal}
              onCloseModal={() => setShowLoginModal(false)}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : user ? (
          <div className="text-center py-12">
            {(() => {
              // Check if user logged in via SIWE
              const isSIWEUser = user.email?.startsWith('0x') && user.email?.includes('@localhost');

              if (user.image) {
                return (
                  <div className="inline-block mb-6">
                    <img
                      src={user.image}
                      alt={user.name || 'User'}
                      className="w-24 h-24 rounded-full border-4 border-white shadow-lg"
                    />
                  </div>
                );
              }

              if (isSIWEUser) {
                return (
                  <div className="inline-block mb-6">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                      <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M11.944 17.97L4.58 13.62 11.943 24l7.37-10.38-7.372 4.35h.003zM12.056 0L4.69 12.223l7.365 4.354 7.365-4.35L12.056 0z"/>
                      </svg>
                    </div>
                  </div>
                );
              }

              return null;
            })()}
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {user.name ? (
                `Welcome, ${user.name}!`
              ) : user.email && !user.email.includes('@localhost') ? (
                `Welcome, ${user.email}!`
              ) : (
                'Welcome!'
              )}
            </h2>
            {user.email?.startsWith('0x') && user.email?.includes('@localhost') && (
              <p className="text-sm text-gray-500 mb-2 font-mono">
                Connected with Ethereum
              </p>
            )}
            <p className="text-gray-600">
              You're successfully authenticated
            </p>
          </div>
        ) : (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Better Auth Template
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              A production-ready authentication template with social OAuth
            </p>
            <button
              onClick={() => setShowLoginModal(true)}
              className="inline-flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors shadow-md"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Features Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Secure Authentication</h3>
            <p className="text-sm text-gray-600">
              Built with Better Auth for enterprise-grade security
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Social OAuth</h3>
            <p className="text-sm text-gray-600">
              Twitter, Google, and more providers ready to use
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Easy to Customize</h3>
            <p className="text-sm text-gray-600">
              Clean code structure, fully typed with TypeScript
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
