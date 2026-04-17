'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { paymentAPI } from '@/utils/api';

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!sessionId) {
      setError('No session ID provided');
      setLoading(false);
      return;
    }

    const verifyPayment = async () => {
      try {
        setLoading(true);
        console.log('[SUCCESS PAGE] Verifying payment for session:', sessionId);
        
        const response = await paymentAPI.verifyPayment(sessionId);
        console.log('[SUCCESS PAGE] Payment verified:', response);
        
        setOrder(response.data?.data || response.data);
        setError('');
      } catch (err) {
        console.error('[SUCCESS PAGE] Verification error:', err);
        setError(err.message || 'Failed to verify payment');
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Processing your order...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Verification Failed</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <Link
              href="/wizard"
              className="block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
            >
              Return to Wizard
            </Link>
            <Link
              href="/dashboard"
              className="block px-6 py-3 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <span className="text-5xl">✓</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Thank You for Your Purchase!
          </h1>
          <p className="text-xl text-gray-600">
            Your personalized storybook order has been confirmed
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📚 Order Details</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200">
              <span className="text-gray-600">Order ID:</span>
              <span className="font-semibold text-gray-900">{order?.id}</span>
            </div>
            
            {order?.child_name && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Child's Name:</span>
                <span className="font-semibold text-gray-900">{order.child_name}</span>
              </div>
            )}
            
            {order?.theme && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Story Theme:</span>
                <span className="font-semibold text-gray-900 capitalize">{order.theme}</span>
              </div>
            )}
            
            {order?.amount && (
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-semibold text-gray-900">
                  {order.currency} {Number(order.amount).toFixed(2)}
                </span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Payment Status:</span>
              <span className="inline-block px-4 py-2 bg-green-100 text-green-800 font-semibold rounded-lg">
                ✓ Completed
              </span>
            </div>
          </div>

          {/* Security & Privacy Confirmation */}
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              🔒 Your Privacy Is Protected
            </h3>
            <ul className="space-y-3 text-green-900 text-sm font-medium">
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>Photos deleted</strong> - All uploaded photos have been permanently removed from our servers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>Child data deleted</strong> - Personal information will be removed after processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>COPPA compliant</strong> - Full parental consent verification and safety measures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>No data sharing</strong> - We never share or sell your child's data</span>
              </li>
            </ul>
          </div>

          {/* Security & Privacy Confirmation */}
          <div className="bg-green-50 border-2 border-green-400 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-4 flex items-center gap-2">
              🔒 Your Privacy Is Protected
            </h3>
            <ul className="space-y-3 text-green-900 text-sm font-medium">
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>Photos deleted</strong> - All uploaded photos have been permanently removed from our servers</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>Child data deleted</strong> - Personal information will be removed after processing</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>COPPA compliant</strong> - Full parental consent verification and safety measures</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-green-600 text-xl flex-shrink-0">✓</span>
                <span><strong>No data sharing</strong> - We never share or sell your child's data</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/dashboard"
            className="px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-center"
          >
            📊 View Dashboard
          </Link>
          <Link
            href="/"
            className="px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition text-center"
          >
            🏠 Return Home
          </Link>
        </div>

        {/* Help Text */}
        <div className="text-center text-gray-600">
          <p>Questions? Check your email or <Link href="/docs" className="text-blue-600 hover:underline">visit our help center</Link></p>
        </div>
      </div>
    </div>
  );
}
