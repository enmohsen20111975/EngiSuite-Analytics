import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button, Card } from '../components/ui';
import { 
  CircleCheck, CircleX, LoaderCircle, Mail, ArrowRight
} from 'lucide-react';
import { cn } from '../lib/utils';

/**
 * Email Verification Page
 * Handles email verification from the link sent to users
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  // Verify email on mount
  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. Please request a new one.');
      return;
    }

    const verifyEmail = async () => {
      try {
        setStatus('loading');
        const result = await authService.verifyEmail(token);
        setStatus('success');
        setMessage(result.message || 'Your email has been verified successfully!');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard', { replace: true });
        }, 3000);
      } catch (error) {
        setStatus('error');
        setMessage(error.response?.data?.detail || 'Verification failed. The link may have expired.');
      }
    };

    verifyEmail();
  }, [token, navigate]);

  // Handle resend verification
  const handleResend = async () => {
    if (!email) {
      setMessage('Please enter your email to resend verification.');
      return;
    }

    try {
      setResending(true);
      await authService.resendVerification(email);
      setResendSuccess(true);
      setMessage('Verification email sent! Please check your inbox.');
    } catch (error) {
      setMessage(error.response?.data?.detail || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-accent/10 via-white to-cyan-100 dark:from-accent/10 dark:via-slate-900 dark:to-cyan-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-cyan-400 text-white text-2xl font-bold mb-4 shadow-lg shadow-accent/30">
            E
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Email Verification
          </h1>
        </div>

        {/* Verification Card */}
        <Card className="p-6 shadow-xl">
          {/* Loading State */}
          {status === 'loading' && (
            <div className="text-center py-8">
              <LoaderCircle className="w-12 h-12 text-accent animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Verifying your email address...
              </p>
            </div>
          )}

          {/* Success State */}
          {status === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-success/20 dark:bg-success/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CircleCheck className="w-8 h-8 text-success" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Email Verified!
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {message}
              </p>
              <p className="text-sm text-gray-500">
                Redirecting to dashboard...
              </p>
              <Button className="mt-4" asChild>
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          )}

          {/* Error State */}
          {status === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-danger/20 dark:bg-danger/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <CircleX className="w-8 h-8 text-danger" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Verification Failed
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {message}
              </p>
              
              {/* Resend Form */}
              {!resendSuccess ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Enter your email to resend verification
                    </label>
                    <input
                      type="email"
                      defaultValue={email || ''}
                      placeholder="you@example.com"
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      id="resend-email"
                    />
                  </div>
                  <Button
                    onClick={() => {
                      const emailInput = document.getElementById('resend-email');
                      handleResend();
                    }}
                    disabled={resending}
                    className="w-full"
                  >
                    {resending ? (
                      <>
                        <LoaderCircle className="w-4 h-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Resend Verification
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="bg-success/10 dark:bg-success/20 border border-success/20 dark:border-success/30 rounded-lg p-4">
                  <p className="text-sm text-success dark:text-success/90">
                    {message}
                  </p>
                </div>
              )}

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Link
                  to="/login"
                  className="text-accent hover:text-accent-hover dark:text-accent"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
