import { BrowserRouter, Routes, Route, useNavigate, useSearchParams } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { ResetPassword } from './pages/ResetPassword';
import { useEffect } from 'react';

/**
 * Email Verification Callback Handler
 * Handles the redirect after clicking email verification link
 * Better Auth automatically signs in the user after verification
 */
function VerifyEmailCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    const verified = searchParams.get('verified');

    // Show a brief message and redirect to home
    // Better Auth automatically creates a session after successful verification
    if (verified === 'true') {
      // Success - email was verified and user is auto-signed in
      setTimeout(() => {
        navigate('/', {
          state: { emailVerified: true },
          replace: true // Replace history so back button doesn't return to verification page
        });
        // Reload to update auth state
        window.location.reload();
      }, 1500);
    } else if (error) {
      // Error occurred during verification
      setTimeout(() => {
        navigate('/', { state: { verificationError: error } });
      }, 1000);
    } else {
      // No specific status, just redirect home
      navigate('/');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600 font-medium">Verifying your email...</p>
        <p className="text-sm text-gray-500 mt-2">You'll be signed in automatically</p>
      </div>
    </div>
  );
}

/**
 * Main App Component with React Router
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmailCallback />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
