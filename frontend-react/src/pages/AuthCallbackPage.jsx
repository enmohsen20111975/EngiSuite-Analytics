import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader } from '../components/ui';

/**
 * Auth Callback Page
 * Handles OAuth callbacks from Google (and other providers)
 * This page is opened in a popup window during OAuth flow
 */
function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState(null);

  useEffect(() => {
    // Parse the URL hash for access_token and id_token
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const idToken = params.get('id_token');
    const errorParam = params.get('error');
    const errorDescription = params.get('error_description');

    if (errorParam) {
      // Send error to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: errorDescription || errorParam,
          },
          window.location.origin
        );
      }
      setError(errorDescription || errorParam);
      // Close popup after short delay
      setTimeout(() => window.close(), 2000);
      return;
    }

    if (idToken) {
      // Send success message to parent window
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_SUCCESS',
            idToken: idToken,
            accessToken: accessToken,
          },
          window.location.origin
        );
        // Close popup
        setTimeout(() => window.close(), 100);
      } else {
        // If not in popup, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError('No authentication token received');
      if (window.opener) {
        window.opener.postMessage(
          {
            type: 'GOOGLE_AUTH_ERROR',
            error: 'No authentication token received',
          },
          window.location.origin
        );
        setTimeout(() => window.close(), 2000);
      }
    }
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Failed
          </h1>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <p className="text-sm text-gray-400 mt-4">This window will close automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Loader size="lg" className="mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          Completing sign-in...
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Please wait while we finish authenticating you.
        </p>
      </div>
    </div>
  );
}

export default AuthCallbackPage;
