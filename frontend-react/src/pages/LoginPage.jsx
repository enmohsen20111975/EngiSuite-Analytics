import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { authService } from '../services/authService';
import { Button, Input, Card } from '../components/ui';
import { 
  Eye, EyeOff, Mail, Lock, LoaderCircle, 
  CircleAlert, CircleCheck, Chromium
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Login Page with email/password and Google OAuth
 */
export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuthStore();
  
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (user && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthError = params.get('oauth_error');
    if (oauthError) {
      const oauthMessages = {
        invalid_state: 'Google sign-in failed due to an invalid session state. Please try again.',
        access_denied: 'Google sign-in was cancelled or denied.',
        authentication_failed: 'Google authentication failed. Please verify OAuth redirect settings and try again.'
      };
      setError(oauthMessages[oauthError] || `Google sign-in failed: ${oauthError}`);
    }
  }, [location.search]);

  // Handle email/password login
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      setIsLoading(true);
      const result = await authService.login(email, password);
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google OAuth login
  const handleGoogleLogin = async () => {
    setError(null);
    setGoogleLoading(true);
    
    try {
      const result = await authService.signInWithGoogle();
      setSuccess(true);
      
      // Redirect after short delay
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 500);
    } catch (err) {
      const backendMessage = err?.response?.data?.error?.message || err?.response?.data?.detail;
      setError(backendMessage || err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-bold mb-4 shadow-lg">
            E
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Sign in to your EngiSuite account
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 shadow-xl">
          {/* Error Alert */}
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-start gap-2">
              <CircleAlert className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Success Alert */}
          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 flex items-start gap-2">
              <CircleCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-600 dark:text-green-400">Login successful! Redirecting...</p>
            </div>
          )}

          {/* Google OAuth Button - Only show if configured */}
          {authService.isGoogleOAuthConfigured() ? (
            <>
              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={googleLoading || isLoading}
                className={cn(
                  'w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700',
                  'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700',
                  'text-gray-700 dark:text-gray-300 font-medium transition-colors',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                {googleLoading ? (
                  <LoaderCircle className="w-5 h-5 animate-spin" />
                ) : (
                  <Chromium className="w-5 h-5" />
                )}
                <span>{googleLoading ? 'Signing in...' : 'Continue with Google'}</span>
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white dark:bg-gray-800 text-gray-500">or continue with email</span>
                </div>
              </div>
            </>
          ) : null}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10"
                  disabled={isLoading}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">Remember me</span>
              </label>
              
              <Link
                to="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400"
            >
              Sign up for free
            </Link>
          </p>
        </Card>

        {/* Footer */}
        <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="underline hover:text-gray-700">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="underline hover:text-gray-700">Privacy Policy</Link>
        </p>
      </div>
    </div>
  );
}
