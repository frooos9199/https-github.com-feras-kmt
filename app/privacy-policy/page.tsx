export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-600 mb-8">Last updated: December 27, 2025</p>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
              <p className="text-gray-700">
                KMT Marshal System collects only the information necessary to provide our marshal management services:
              </p>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                <li>Name and contact information for marshal registration</li>
                <li>Employee ID for identification purposes</li>
                <li>Event participation data</li>
                <li>Device information for push notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
              <p className="text-gray-700">We use your information to:</p>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                <li>Manage marshal assignments and schedules</li>
                <li>Send notifications about events and updates</li>
                <li>Provide customer support</li>
                <li>Improve our services</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Information Sharing</h2>
              <p className="text-gray-700">
                We do not sell, trade, or share your personal information with third parties except as necessary to provide our services or as required by law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Security</h2>
              <p className="text-gray-700">
                We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Data Retention</h2>
              <p className="text-gray-700">
                We retain your information only as long as necessary to provide our services and comply with legal obligations.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Your Rights</h2>
              <p className="text-gray-700">You have the right to:</p>
              <ul className="list-disc list-inside mt-2 text-gray-700">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt-out of notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Contact Us</h2>
              <p className="text-gray-700">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="mt-2 text-gray-700">
                <p>Email: admin@kmtsys.com</p>
                <p>Website: https://www.kmtsys.com</p>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
              <p className="text-gray-700">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}