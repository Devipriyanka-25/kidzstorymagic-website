'use client';

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
      <div className="mx-auto max-w-4xl px-6">
        <div className="mb-16 text-center">
          <h1 className="mb-4 text-5xl font-black text-gray-900">
            Terms of Service
          </h1>
          <p className="text-gray-600">Last Updated: April 30, 2026</p>
        </div>

        <div className="space-y-8 rounded-2xl bg-white p-12 shadow-xl">
          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Agreement to These Terms
            </h2>
            <p className="leading-relaxed text-gray-700">
              By accessing or using Kidz Story Magic, you agree to these Terms
              of Service. If you do not agree, please do not use the service.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Who May Use the Service
            </h2>
            <p className="leading-relaxed text-gray-700">
              Kidz Story Magic is intended for parents, guardians, teachers, and
              other adults creating personalized stories for children. You are
              responsible for ensuring that any information or photos you submit
              may be lawfully shared with us.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Accounts and Access
            </h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>
                You must provide accurate account information when signing up.
              </li>
              <li>
                You are responsible for maintaining the security of your login
                credentials.
              </li>
              <li>
                You are responsible for all activity that happens under your
                account.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Story Content and Uploaded Photos
            </h2>
            <p className="mb-4 leading-relaxed text-gray-700">
              You retain responsibility for the names, prompts, and photos you
              provide. By uploading content, you confirm that you have the
              necessary rights and permissions to use it for story generation.
            </p>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>
                Uploaded child photos are used to personalize illustrations.
              </li>
              <li>
                You must not upload content that is unlawful, abusive, harmful,
                or infringes on another person&apos;s rights.
              </li>
              <li>
                We may block or remove content that violates safety or legal
                requirements.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Payments and Orders
            </h2>
            <p className="leading-relaxed text-gray-700">
              Some features require payment. Prices, taxes, and available
              checkout methods may vary by region. Orders are processed through
              third-party payment providers such as Stripe, and your use of
              those payment services may also be subject to their terms.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Acceptable Use
            </h2>
            <ul className="list-inside list-disc space-y-2 text-gray-700">
              <li>Do not misuse the service or attempt to break it.</li>
              <li>
                Do not upload malicious files, spam, or content intended to
                exploit the platform.
              </li>
              <li>
                Do not use the platform in a way that violates child safety,
                privacy, or intellectual property laws.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Intellectual Property
            </h2>
            <p className="leading-relaxed text-gray-700">
              Kidz Story Magic, including its branding, product design, and
              software, is owned by Kidz Story Magic or its licensors. Subject
              to these terms, we grant you a limited, non-exclusive right to use
              the service for personal or internal educational use.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Service Availability
            </h2>
            <p className="leading-relaxed text-gray-700">
              We work hard to keep the service available, but we do not
              guarantee uninterrupted access. Features, models, pricing, and
              availability may change over time.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Limitation of Liability
            </h2>
            <p className="leading-relaxed text-gray-700">
              To the maximum extent permitted by law, Kidz Story Magic is not
              liable for indirect, incidental, special, or consequential
              damages arising from your use of the service. The service is
              provided on an as-is and as-available basis.
            </p>
          </section>

          <section>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Changes to These Terms
            </h2>
            <p className="leading-relaxed text-gray-700">
              We may update these terms from time to time. When we do, we will
              post the revised version here and update the effective date above.
            </p>
          </section>

          <section className="rounded-lg border-l-4 border-blue-600 bg-blue-50 p-8">
            <h2 className="mb-4 text-2xl font-bold text-gray-900">
              Contact
            </h2>
            <p className="leading-relaxed text-gray-700">
              If you have questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-4 text-gray-700">
              <p>
                <strong>Email:</strong> support@kidzstorymagic.com
              </p>
              <p>
                <strong>Company:</strong> Kidz Story Magic
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
