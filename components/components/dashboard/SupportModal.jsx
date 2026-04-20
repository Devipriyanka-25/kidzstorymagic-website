'use client';

import { useState } from 'react';

/**
 * SupportModal - Customer support and help features
 * Features:
 * - WhatsApp support link
 * - Email support
 * - FAQ
 * - Help topics
 */
export default function SupportModal({ isOpen = false, onClose = () => {} }) {
  const [selectedTopic, setSelectedTopic] = useState('contact'); // 'contact', 'faq', 'issues'

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const whatsappNumber = '+917385983456'; // Replace with your business WhatsApp number
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Hi%20Kidz%20Story%20Magic!%20I%20need%20help%20with%20my%20account.`;
  const emailSupport = 'support@kidzstorymagic.com';

  const faqItems = [
    {
      question: 'How do I create a new story?',
      answer: 'Click the "+ Create Story" button on your dashboard to start the wizard. Follow the steps to select your child\'s age, theme, and upload photos.'
    },
    {
      question: 'Can I edit a draft story?',
      answer: 'Yes! All drafts are saved automatically. Click "Continue" on any draft story to edit and regenerate it before checkout.'
    },
    {
      question: 'How long does story generation take?',
      answer: 'Typically 2-5 minutes depending on the number of pages and current server load. You\'ll receive a notification when complete.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards (Visa, Mastercard, American Express) through secure Stripe payment gateway.'
    },
    {
      question: 'Can I download my story as PDF?',
      answer: 'Yes! After purchase, you can download your story as a high-resolution PDF. Free previews show a watermark and blurred images.'
    },
    {
      question: 'What if I\'m not satisfied with the story?',
      answer: 'You can regenerate your story unlimited times before checkout. After purchase, contact support for a refund within 7 days.'
    },
    {
      question: 'Is my child\'s photo secure?',
      answer: 'Yes, we use industry-standard encryption and never share photos with third parties. Photos are used only for your story generation.'
    },
    {
      question: 'How many images should I upload?',
      answer: 'Upload 2-5 images for best results. More variety helps create a richer, more diverse story with different scenes.'
    }
  ];

  const commonIssues = [
    {
      title: 'Upload not working',
      solution: 'Try using a different browser or clearing your cache. Ensure file size is under 5MB and format is JPG/PNG/WebP.'
    },
    {
      title: 'Story generation failed',
      solution: 'Refresh the page and try again. If persistent, contact support via WhatsApp or email.'
    },
    {
      title: 'Payment declined',
      solution: 'Verify your card details are correct and sufficient balance. Try a different payment method or contact your bank.'
    },
    {
      title: 'Dashboard not loading',
      solution: 'Clear browser cache or try incognito mode. Ensure you\'re signed in and have a stable internet connection.'
    },
    {
      title: 'Can\'t find my story',
      solution: 'Check the "Published" tab. If still not visible, sign out and back in, or contact support.'
    }
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-screen overflow-y-auto my-8">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            💬 Help & Support
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-blue-100 text-3xl font-bold transition-colors hover:scale-110"
          >
            ✕
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 sticky top-16 z-10">
          <button
            onClick={() => setSelectedTopic('contact')}
            className={`flex-1 py-4 font-semibold transition-colors border-b-2 ${
              selectedTopic === 'contact'
                ? 'text-blue-600 border-blue-600 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            📞 Contact Us
          </button>
          <button
            onClick={() => setSelectedTopic('faq')}
            className={`flex-1 py-4 font-semibold transition-colors border-b-2 ${
              selectedTopic === 'faq'
                ? 'text-blue-600 border-blue-600 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            ❓ FAQ
          </button>
          <button
            onClick={() => setSelectedTopic('issues')}
            className={`flex-1 py-4 font-semibold transition-colors border-b-2 ${
              selectedTopic === 'issues'
                ? 'text-blue-600 border-blue-600 bg-white'
                : 'text-gray-600 border-transparent hover:text-gray-900'
            }`}
          >
            🔧 Issues
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Contact Us Section */}
          {selectedTopic === 'contact' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                We're here to help! Choose your preferred contact method:
              </p>

              {/* WhatsApp Support */}
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-6 bg-gradient-to-r from-green-400 to-green-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">💬</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">WhatsApp Support</h3>
                    <p className="text-sm opacity-90">
                      Chat with us on WhatsApp for instant support
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      Typical response time: 2-5 minutes
                    </p>
                  </div>
                </div>
              </a>

              {/* Email Support */}
              <a
                href={`mailto:${emailSupport}?subject=Help%20with%20Kidz%20Story%20Magic%20Account`}
                className="block p-6 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="text-4xl">✉️</div>
                  <div>
                    <h3 className="text-xl font-bold mb-1">Email Support</h3>
                    <p className="text-sm opacity-90">
                      {emailSupport}
                    </p>
                    <p className="text-xs opacity-75 mt-2">
                      Response time: Within 24 hours
                    </p>
                  </div>
                </div>
              </a>

              {/* Live Chat Info */}
              <div className="p-6 bg-purple-50 border-2 border-purple-200 rounded-xl">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎧</div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Business Hours</h3>
                    <p className="text-gray-700">
                      📅 Monday - Friday: 9 AM - 6 PM IST<br/>
                      📅 Saturday: 10 AM - 4 PM IST<br/>
                      📅 Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-blue-900 font-semibold mb-3">⚡ Quick Actions:</p>
                <div className="space-y-2 text-sm">
                  <button
                    onClick={() => window.open('mailto:' + emailSupport)}
                    className="block w-full text-left p-2 hover:bg-blue-100 rounded transition-colors"
                  >
                    📧 Send Email
                  </button>
                  <button
                    onClick={() => window.open(whatsappLink)}
                    className="block w-full text-left p-2 hover:bg-blue-100 rounded transition-colors"
                  >
                    💬 Open WhatsApp
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          {selectedTopic === 'faq' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Frequently asked questions
              </p>
              {faqItems.map((item, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <summary className="p-4 font-semibold text-gray-900 cursor-pointer hover:bg-blue-50 flex items-start gap-3">
                    <span className="text-lg">❓</span>
                    <span>{item.question}</span>
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-gray-700 border-t border-gray-200 bg-white">
                    {item.answer}
                  </div>
                </details>
              ))}
            </div>
          )}

          {/* Common Issues Section */}
          {selectedTopic === 'issues' && (
            <div className="space-y-4">
              <p className="text-gray-600 text-center mb-6">
                Troubleshooting common issues
              </p>
              {commonIssues.map((issue, index) => (
                <details
                  key={index}
                  className="group bg-gray-50 border-2 border-gray-200 rounded-lg overflow-hidden hover:border-orange-300 transition-colors"
                >
                  <summary className="p-4 font-semibold text-gray-900 cursor-pointer hover:bg-orange-50 flex items-start gap-3">
                    <span className="text-lg">🔧</span>
                    <span>{issue.title}</span>
                  </summary>
                  <div className="px-4 pb-4 pt-0 text-gray-700 border-t border-gray-200 bg-white">
                    <p className="mb-2 font-semibold text-green-700">✅ Solution:</p>
                    {issue.solution}
                    <p className="mt-3 text-sm text-gray-600">
                      Still not resolved? <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Contact support via WhatsApp</a>
                    </p>
                  </div>
                </details>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50 sticky bottom-0">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-all"
          >
            Close Support Center
          </button>
        </div>
      </div>
    </div>
  );
}
