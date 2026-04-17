'use client';

import { useEffect, useState } from 'react';

/**
 * ChildSafetyModal Component
 * First-time user safety acknowledgment modal
 * COPPA-compliant notification
 */
export default function ChildSafetyModal({ onAccept, onClose, forceShow = false }) {
  const [isOpen, setIsOpen] = useState(forceShow);
  const [accepted, setAccepted] = useState(false);
  const [showError, setShowError] = useState(false);
  const STORAGE_KEY = 'child_safety_acceptance';

  // Check if user already accepted on component mount
  useEffect(() => {
    if (!forceShow) {
      const hasAccepted = localStorage.getItem(STORAGE_KEY);
      if (!hasAccepted) {
        setIsOpen(true);
      }
    } else {
      setIsOpen(true);
    }
  }, [forceShow]);

  /**
   * Handle modal acceptance
   */
  const handleAccept = () => {
    if (!accepted) {
      setShowError(true);
      return;
    }

    // Store acceptance in localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      accepted: true,
      timestamp: new Date().toISOString(),
    }));

    setIsOpen(false);
    if (onAccept) {
      onAccept();
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setIsOpen(false);
    if (onClose) {
      onClose();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity" />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="text-4xl">🛡️</span>
              Child Safety First
            </h1>
            <p className="text-blue-100 mt-2">
              We're committed to keeping children safe online
            </p>
          </div>

          {/* Content */}
          <div className="px-8 py-8 space-y-6">
            {/* Safety Summary */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📋</span> Our Safety Commitment
              </h2>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-r-lg space-y-3">
                <p className="text-gray-800 font-semibold">
                  We comply with <strong>COPPA</strong> (Children's Online Privacy Protection Act) and international child safety standards.
                </p>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">🔒</span>
                    <span><strong>No Data Storage:</strong> Photos and personal information are deleted immediately after processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">👨‍👩‍👧</span>
                    <span><strong>Parental Consent:</strong> Children under 13 require verified parent/guardian permission</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">📧</span>
                    <span><strong>Parent Verification:</strong> We verify parent/guardian email before processing any content</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-blue-600 text-xl mt-1">🚫</span>
                    <span><strong>No Sharing:</strong> We never sell, share, or use child data for advertising</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* Age Validation Info */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>🎂</span> Age Verification
              </h2>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-6 rounded-r-lg">
                <p className="text-gray-800 mb-4">
                  Based on age, different protections apply:
                </p>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <p className="font-bold text-gray-900 mb-2">👶 Under 13 Years Old:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>✓ Verified parent/guardian consent required</li>
                      <li>✓ Parent email verification needed</li>
                      <li>✓ Enhanced privacy protections</li>
                    </ul>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-amber-200">
                    <p className="font-bold text-gray-900 mb-2">👦 13+ Years Old:</p>
                    <ul className="text-sm text-gray-700 space-y-1 ml-4">
                      <li>✓ Can use service with parental awareness</li>
                      <li>✓ Still protected by strict privacy policies</li>
                      <li>✓ No data storage or sharing</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* Data Handling */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span>📸</span> How We Handle Data
              </h2>
              <div className="space-y-2 text-gray-800">
                <div className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 font-bold">1</span>
                  <div>
                    <p className="font-semibold">Upload:</p>
                    <p className="text-gray-600">You upload photos for story creation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 font-bold">2</span>
                  <div>
                    <p className="font-semibold">Process:</p>
                    <p className="text-gray-600">AI analyzes images (in-memory only)</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 font-bold">3</span>
                  <div>
                    <p className="font-semibold">Generate:</p>
                    <p className="text-gray-600">Story is created in real-time</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-green-100 text-green-700 rounded-full px-3 py-1 font-bold">4</span>
                  <div>
                    <p className="font-semibold">Delete:</p>
                    <p className="text-gray-600"><strong>Immediately deleted</strong> - no permanent storage</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Consent Checkbox */}
            <section>
              <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6">
                <div className="flex items-start gap-4">
                  <input
                    type="checkbox"
                    id="safetyAccept"
                    checked={accepted}
                    onChange={(e) => {
                      setAccepted(e.target.checked);
                      setShowError(false);
                    }}
                    className="mt-1 w-6 h-6 cursor-pointer"
                  />
                  <label htmlFor="safetyAccept" className="flex-1 cursor-pointer">
                    <p className="font-bold text-gray-900 text-lg">
                      I understand and accept these child safety practices
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      I confirm that I have read and understand how this service handles child data and privacy.
                    </p>
                  </label>
                </div>
                {showError && !accepted && (
                  <p className="text-red-600 font-semibold mt-4 flex items-center gap-2">
                    <span>⚠️</span> Please accept to continue
                  </p>
                )}
              </div>
            </section>

            {/* Legal Notice */}
            <section className="text-xs text-gray-600 bg-gray-100 p-4 rounded-lg">
              <p>
                This service is compliant with <strong>COPPA (15 U.S.C. § 6501-6506)</strong>, the US Children's Online Privacy Protection Act,
                and similar child protection regulations in other jurisdictions. For more information, visit our{' '}
                <a href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </a>
                .
              </p>
            </section>
          </div>

          {/* Actions */}
          <div className="border-t border-gray-200 px-8 py-6 bg-gray-50 flex gap-4 justify-end">
            <button
              onClick={handleClose}
              className="px-6 py-3 rounded-lg border-2 border-gray-300 text-gray-900 font-semibold hover:bg-gray-100 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleAccept}
              disabled={!accepted}
              className={`px-8 py-3 rounded-lg font-bold text-white transition-all ${
                accepted
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg cursor-pointer'
                  : 'bg-gray-400 cursor-not-allowed opacity-60'
              }`}
            >
              I Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
