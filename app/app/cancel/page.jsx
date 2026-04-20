'use client';

import Link from 'next/link';

export default function CancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-red-50">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Cancel Header */}
        <div className="text-center mb-12">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-5xl">⏸️</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Checkout Cancelled
          </h1>
          <p className="text-xl text-gray-600">
            Your payment was not completed
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">What Happened?</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex items-start">
              <span className="text-orange-600 text-2xl mr-4">•</span>
              <p className="text-gray-700">
                Your checkout session was cancelled and no payment was charged to your account
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 text-2xl mr-4">•</span>
              <p className="text-gray-700">
                Your storybook draft has been saved and you can complete checkout anytime
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-orange-600 text-2xl mr-4">•</span>
              <p className="text-gray-700">
                No charges or fees will appear on your payment method
              </p>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 Tips to Complete Your Order:</h3>
            <ul className="space-y-2 text-gray-700 list-disc list-inside">
              <li>Make sure your payment information is correct</li>
              <li>Check that your card has sufficient funds</li>
              <li>Ensure your billing address matches your card details</li>
              <li>Try using a different payment method if needed</li>
            </ul>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/wizard"
            className="px-6 py-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition text-center"
          >
            ↩️ Try Again
          </Link>
          <Link
            href="/dashboard"
            className="px-6 py-4 bg-gray-200 text-gray-900 font-bold rounded-lg hover:bg-gray-300 transition text-center"
          >
            📊 View Dashboard
          </Link>
        </div>

        {/* Support */}
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Having trouble completing your order? We're here to help!
          </p>
          <Link
            href="/docs"
            className="text-blue-600 hover:underline font-semibold"
          >
            Visit Our Help Center
          </Link>
        </div>
      </div>
    </div>
  );
}
