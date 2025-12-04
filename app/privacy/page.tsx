export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: December 4, 2025</p>

        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Information We Collect</h2>
            <p>The KMT Marshal Management System collects the following information:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Personal Information: Name, Employee ID, contact details</li>
              <li>Professional Information: Marshal specializations and qualifications</li>
              <li>Attendance Records: Event participation and check-in data</li>
              <li>Device Information: Device type and notification tokens for push notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p>We use the collected information for:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Managing marshal assignments and schedules</li>
              <li>Tracking attendance and participation</li>
              <li>Sending event notifications and updates</li>
              <li>Generating reports and statistics</li>
              <li>Improving our services and user experience</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Secure authentication and encrypted connections</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information</li>
              <li>Secure cloud infrastructure (Vercel & Neon)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Data Sharing</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. Your data is only accessible to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Authorized KMT administrators</li>
              <li>Event coordinators for scheduling purposes</li>
              <li>Required service providers (hosting, notifications)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>Access your personal information</li>
              <li>Request corrections to your data</li>
              <li>Request deletion of your account</li>
              <li>Opt-out of notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Notifications</h2>
            <p>We use Firebase Cloud Messaging to send push notifications about:</p>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>New event announcements</li>
              <li>Schedule changes</li>
              <li>Important updates</li>
            </ul>
            <p className="mt-2">You can disable notifications in your device settings at any time.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Children's Privacy</h2>
            <p>This application is intended for use by marshals aged 18 and above. We do not knowingly collect information from children under 18.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify users of any significant changes through the app or via email.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="mt-2 ml-6">
              <p><strong>Kuwait Motor Town</strong></p>
              <p>Email: support@kuwaitmotor.town</p>
            </div>
          </section>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; 2025 Kuwait Motor Town - Powered by NexDev</p>
        </div>
      </div>
    </div>
  );
}
