export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-red-900 mb-4">
            Support & Help Center
          </h1>
          <p className="text-lg text-gray-600">
            مركز الدعم والمساعدة
          </p>
        </div>

        {/* Support Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          
          {/* Contact Information */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Contact Information | معلومات الاتصال
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Email Support</h3>
                  <a href="mailto:support@kmtsys.com" className="text-red-600 hover:text-red-700 font-medium">
                    support@kmtsys.com
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Response time: 24-48 hours</p>
                </div>
              </div>

              <div className="flex items-start p-4 bg-red-50 rounded-lg">
                <svg className="w-6 h-6 text-red-600 mt-1 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Phone Support</h3>
                  <a href="tel:+966500000000" className="text-red-600 hover:text-red-700 font-medium text-lg">
                    +966 50 000 0000
                  </a>
                  <p className="text-sm text-gray-600 mt-1">Available: Sunday - Thursday, 9 AM - 5 PM (GMT+3)</p>
                </div>
              </div>
            </div>
          </section>

          {/* How to Get Help */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to Get Help | كيفية الحصول على المساعدة
            </h2>
            
            <div className="space-y-4">
              <div className="border-l-4 border-red-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">1. Login Issues | مشاكل تسجيل الدخول</h3>
                <p className="text-gray-600">
                  Contact your system administrator or email us at support@kmtsys.com with your Employee ID.
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">2. Attendance Problems | مشاكل الحضور</h3>
                <p className="text-gray-600">
                  If you cannot mark attendance, ensure you're at the event location and have internet connection.
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">3. Notifications Not Working | الإشعارات لا تعمل</h3>
                <p className="text-gray-600">
                  Check your device settings and ensure notifications are enabled for KMT app.
                </p>
              </div>

              <div className="border-l-4 border-red-600 pl-4 py-2">
                <h3 className="font-semibold text-gray-900 mb-2">4. Technical Issues | مشاكل تقنية</h3>
                <p className="text-gray-600">
                  For app crashes or bugs, email us with: device model, iOS version, and screenshot of the error.
                </p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Frequently Asked Questions | الأسئلة الشائعة
            </h2>
            
            <div className="space-y-4">
              <details className="group bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>How do I reset my password? | كيف أعيد تعيين كلمة المرور؟</span>
                  <svg className="w-5 h-5 text-red-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600">
                  Use the "Forgot Password" link on the login screen, or contact your administrator to reset it for you.
                </p>
              </details>

              <details className="group bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>Can I use the app offline? | هل يمكنني استخدام التطبيق بدون إنترنت؟</span>
                  <svg className="w-5 h-5 text-red-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600">
                  The app requires internet connection for most features. Some cached data may be viewable offline.
                </p>
              </details>

              <details className="group bg-gray-50 rounded-lg p-4">
                <summary className="font-semibold text-gray-900 cursor-pointer list-none flex justify-between items-center">
                  <span>Who can I contact for urgent issues? | من أتصل به للمشاكل العاجلة؟</span>
                  <svg className="w-5 h-5 text-red-600 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-gray-600">
                  For urgent issues during events, contact your direct supervisor or call our support hotline at +966 50 000 0000.
                </p>
              </details>
            </div>
          </section>

          {/* System Requirements */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              System Requirements | متطلبات النظام
            </h2>
            
            <div className="bg-gray-50 rounded-lg p-6">
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  iOS 13.0 or later
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  iPhone 6s or newer
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Active internet connection
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Notifications enabled (recommended)
                </li>
              </ul>
            </div>
          </section>

          {/* Additional Resources */}
          <section>
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Additional Resources | موارد إضافية
            </h2>
            
            <div className="space-y-3">
              <a href="/privacy" className="flex items-center text-red-600 hover:text-red-700 font-medium">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Privacy Policy
              </a>
              
              <div className="flex items-center text-gray-600">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Website: <a href="https://www.kmtsys.com" className="text-red-600 hover:text-red-700 ml-2">www.kmtsys.com</a>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="text-center text-gray-600">
          <p className="mb-2">KMT Marshal Management System</p>
          <p className="text-sm">© {new Date().getFullYear()} KMT. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
