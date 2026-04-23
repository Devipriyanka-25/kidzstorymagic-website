'use client';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-black text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: April 10, 2026</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Kidz Story Magic, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Personal Information</h3>
                <p className="text-gray-700">
                  We collect information you provide directly, such as when you create an account, including:
                </p>
                <ul className="list-disc list-inside ml-4 mt-2 text-gray-700">
                  <li>Name and email address</li>
                  <li>Child's name and age</li>
                  <li>Photos you upload for story generation</li>
                  <li>Payment information</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Automatically Collected Information</h3>
                <p className="text-gray-700">
                  We automatically collect certain information about your device and usage patterns through cookies and similar tracking technologies.
                </p>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>To provide and maintain our services</li>
              <li>To process payments and send billing information</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To improve and personalize your experience</li>
              <li>To detect and prevent fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Kidz Story Magic is designed for use by parents and guardians. We do not knowingly collect personal information from children under 13. Parents who believe their child has provided information to us should contact us immediately.
            </p>
          </section>

          {/* Photo Usage */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Photo Usage</h2>
            <p className="text-gray-700 leading-relaxed">
              Photos you upload are used solely to generate personalized story illustrations for your child. We apply watermarks and privacy protections to all uploaded photos. Photos are not shared with third parties and are deleted after story generation unless you opt to save them.
            </p>
          </section>

          {/* Third-Party Services */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              We may use third-party services for payment processing, analytics, and hosting. These providers are contractually obligated to use your information only to provide services to us and to protect your information.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt-out of marketing communications</li>
              <li>Data portability</li>
            </ul>
          </section>

          {/* Contact Us */}
          <section className="bg-blue-50 p-8 rounded-lg border-l-4 border-blue-600">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="mt-4 text-gray-700">
              <p><strong>Email:</strong> privacy@kidzstorymagic.com</p>
              <p><strong>Address:</strong> Kidz Story Magic, Inc.</p>
              <p className="mt-4 text-sm italic">This Privacy Policy may be updated periodically. We will notify you of material changes via email.</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
