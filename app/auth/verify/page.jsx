'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

/**
 * Email Verification Page
 * Route: /auth/verify?token=XXX
 * Handles email verification when user clicks link from email
 */
export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState('verifying'); // verifying, success, error
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setEmail(data.email);
          setMessage('Email verified successfully! Redirecting you to login...');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            router.push('/auth/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(data.error || 'Email verification failed');
        }
      } catch (error) {
        setStatus('error');
        setMessage(error.message || 'An error occurred during verification');
      }
    };

    verifyEmail();
  }, [token, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-12 text-center">
            <div className="text-5xl mb-4">
              {status === 'verifying' && '⏳'}
              {status === 'success' && '✅'}
              {status === 'error' && '❌'}
            </div>
            <h1 className="text-3xl font-bold text-white">
              {status === 'verifying' && 'Verifying Email...'}
              {status === 'success' && 'Email Verified!'}
              {status === 'error' && 'Verification Failed'}
            </h1>
          </div>

          {/* Content */}
          <div className="px-8 py-12">
            
            {status === 'verifying' && (
              <div className="text-center">
                <div className="inline-block">
                  <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
                </div>
                <p className="text-gray-600">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {status === 'success' && (
              <div className="text-center">
                <p className="text-gray-600 mb-4">
                  Great news! Your email <strong>{email}</strong> has been verified successfully.
                </p>
                <p className="text-gray-500 text-sm mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <p className="text-gray-600">Redirecting to login in a few seconds...</p>
                  <Link
                    href="/auth/login"
                    className="inline-block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Go to Login Now
                  </Link>
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="text-center">
                <p className="text-red-600 font-semibold mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <p className="text-gray-600 text-sm mb-4">
                    {!token && 'The verification token is missing. Please check your email for the verification link.'}
                    {token && 'The verification link may have expired. Please register again or contact support.'}
                  </p>
                  <Link
                    href="/auth/register"
                    className="block px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                  >
                    Back to Registration
                  </Link>
                  <Link
                    href="/auth/login"
                    className="block px-6 py-3 border-2 border-indigo-600 text-indigo-600 font-semibold rounded-lg hover:bg-indigo-50 transition-all"
                  >
                    Go to Login
                  </Link>
                </div>
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-6 text-center border-t">
            <p className="text-sm text-gray-600">
              Need help? <a href="mailto:support@kidzstorymagic.com" className="text-indigo-600 hover:underline font-semibold">
                Contact support
              </a>
            </p>
          </div>

        </div>

        {/* Logo */}
        <div className="text-center mt-8">
          <p className="text-gray-600">
            <span className="text-2xl mr-2">✨</span>
            <span className="font-bold text-lg">Kidz Story Magic</span>
          </p>
        </div>

      </div>
    </div>
  );
}
