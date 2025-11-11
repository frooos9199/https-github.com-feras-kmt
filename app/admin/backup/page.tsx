'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationBell from '@/components/NotificationBell';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BackupPage() {
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const createBackup = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/cron/backup');
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Failed to create backup');
      }
    } catch (err) {
      setError('Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-red-600 to-red-800 p-4 shadow-lg">
        <div className="container mx-auto flex items-center justify-between">
          <Link href="/admin" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-xl">K</span>
            </div>
            <span className="text-white font-bold text-lg">KMT</span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
              👑 ADMIN
            </span>
            <NotificationBell />
            <button
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition"
            >
              {language === 'en' ? 'AR' : 'EN'}
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 rounded-lg hover:bg-red-600 transition"
            >
              {t('logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-4">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-red-500 hover:text-red-400 transition"
        >
          <span>{language === 'ar' ? '→' : '←'}</span>
          <span>{language === 'en' ? 'Back to Admin Panel' : 'العودة للوحة الإدارة'}</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            {language === 'en' ? '🗄️ Database Backup' : '🗄️ النسخ الاحتياطي لقاعدة البيانات'}
          </h1>
          <p className="text-gray-400 mb-8">
            {language === 'en' 
              ? 'Create a backup of the entire database and receive it via email'
              : 'إنشاء نسخة احتياطية كاملة من قاعدة البيانات واستلامها عبر البريد الإلكتروني'}
          </p>

          {/* Backup Info */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>ℹ️</span>
              <span>{language === 'en' ? 'Backup Information' : 'معلومات النسخ الاحتياطي'}</span>
            </h2>
            
            <div className="space-y-3 text-gray-300">
              <div className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                <div>
                  <strong>{language === 'en' ? 'Automatic Schedule:' : 'الجدول التلقائي:'}</strong>
                  <p className="text-sm text-gray-400">
                    {language === 'en' 
                      ? 'Backup runs automatically on the 1st of every month at midnight (Kuwait time)'
                      : 'يتم إنشاء نسخة احتياطية تلقائياً في اليوم الأول من كل شهر عند منتصف الليل (بتوقيت الكويت)'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                <div>
                  <strong>{language === 'en' ? 'Email Delivery:' : 'التسليم عبر البريد:'}</strong>
                  <p className="text-sm text-gray-400">
                    {language === 'en' 
                      ? 'Backup is sent to summit_kw@hotmail.com with all database data'
                      : 'يتم إرسال النسخة الاحتياطية إلى summit_kw@hotmail.com مع جميع بيانات قاعدة البيانات'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-green-500">✓</span>
                <div>
                  <strong>{language === 'en' ? 'What\'s Included:' : 'المحتويات:'}</strong>
                  <p className="text-sm text-gray-400">
                    {language === 'en' 
                      ? 'All users, events, attendances, notifications, and broadcast messages'
                      : 'جميع المستخدمين، الأحداث، الحضور، الإشعارات، ورسائل البث'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-blue-500">📅</span>
                <div>
                  <strong>{language === 'en' ? 'Next Automatic Backup:' : 'النسخة الاحتياطية التالية:'}</strong>
                  <p className="text-sm text-gray-400">
                    {language === 'en' 
                      ? '1st of next month at 00:00 (Kuwait time)'
                      : 'اليوم الأول من الشهر القادم الساعة 00:00 (بتوقيت الكويت)'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Manual Backup Button */}
          <div className="bg-gradient-to-br from-red-900/30 to-orange-900/30 rounded-xl p-6 border border-red-700/50">
            <h2 className="text-xl font-bold mb-4">
              {language === 'en' ? '🚀 Create Manual Backup' : '🚀 إنشاء نسخة احتياطية يدوياً'}
            </h2>
            
            <p className="text-gray-300 mb-6">
              {language === 'en' 
                ? 'Click the button below to create a backup right now. You will receive an email with the backup data.'
                : 'انقر على الزر أدناه لإنشاء نسخة احتياطية الآن. ستستلم بريد إلكتروني يحتوي على بيانات النسخة الاحتياطية.'}
            </p>

            <button
              onClick={createBackup}
              disabled={loading}
              className={`w-full px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                loading
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700'
              }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">⏳</span>
                  {language === 'en' ? 'Creating Backup...' : 'جاري إنشاء النسخة الاحتياطية...'}
                </span>
              ) : (
                language === 'en' ? '📦 Create Backup Now' : '📦 إنشاء نسخة احتياطية الآن'
              )}
            </button>
          </div>

          {/* Success Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl p-6 border border-green-700/50"
            >
              <h3 className="text-xl font-bold mb-4 text-green-400">
                ✅ {language === 'en' ? 'Backup Created Successfully!' : 'تم إنشاء النسخة الاحتياطية بنجاح!'}
              </h3>
              
              <div className="space-y-2 text-gray-300">
                <p>👥 <strong>{language === 'en' ? 'Users:' : 'المستخدمين:'}</strong> {result.stats?.totalUsers || 0}</p>
                <p>📅 <strong>{language === 'en' ? 'Events:' : 'الأحداث:'}</strong> {result.stats?.totalEvents || 0}</p>
                <p>✅ <strong>{language === 'en' ? 'Attendances:' : 'الحضور:'}</strong> {result.stats?.totalAttendances || 0}</p>
                <p>🔔 <strong>{language === 'en' ? 'Notifications:' : 'الإشعارات:'}</strong> {result.stats?.totalNotifications || 0}</p>
                <p>📢 <strong>{language === 'en' ? 'Broadcasts:' : 'البث:'}</strong> {result.stats?.totalBroadcasts || 0}</p>
                <p>📊 <strong>{language === 'en' ? 'Size:' : 'الحجم:'}</strong> {result.backupSize}</p>
                <p className="mt-4 pt-4 border-t border-gray-700">
                  📧 <strong>{language === 'en' ? 'Sent to:' : 'تم الإرسال إلى:'}</strong> {result.sentTo}
                </p>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 bg-gradient-to-br from-red-900/30 to-pink-900/30 rounded-xl p-6 border border-red-700/50"
            >
              <h3 className="text-xl font-bold mb-2 text-red-400">
                ❌ {language === 'en' ? 'Backup Failed' : 'فشل إنشاء النسخة الاحتياطية'}
              </h3>
              <p className="text-gray-300">{error}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 border-t border-gray-700 py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 Kuwait Motorsport Team
            {language === 'ar' && ' | فريق الكويت للسيارات'}
          </p>
          <p className="text-gray-500 text-sm mt-2">
            {language === 'en' ? 'Marshal Management System' : 'نظام إدارة المارشالات'}
          </p>
        </div>
      </footer>
    </div>
  );
}
