'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationBell from '@/components/NotificationBell';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BackupPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language, setLanguage } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated" || session?.user?.role !== "admin") {
      router.push("/");
    }
  }, [session, status, router]);

  const handleLogout = async () => {
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

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session || session.user.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-3 hover:opacity-80 transition">
                <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
                <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <NotificationBell />
              <button
                onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-colors text-sm"
              >
                {language === "ar" ? "EN" : "ع"}
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                {language === "ar" ? "تسجيل خروج" : "Logout"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <span>{language === 'ar' ? '→' : '←'}</span>
            <span>{language === 'en' ? 'Back to Admin Panel' : 'العودة للوحة الإدارة'}</span>
          </Link>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            🗄️ {language === 'en' ? 'Database Backup' : 'النسخ الاحتياطي لقاعدة البيانات'}
          </h1>
          <p className="text-gray-400">
            {language === 'en' 
              ? 'Create a backup of the entire database and receive it via email'
              : 'إنشاء نسخة احتياطية كاملة من قاعدة البيانات واستلامها عبر البريد الإلكتروني'}
          </p>
        </motion.div>

        {/* Backup Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
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
        </motion.div>

        {/* Manual Backup Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6"
        >
          <h2 className="text-xl font-bold text-white mb-4">
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
                ? 'bg-zinc-700 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-700 text-white'
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
        </motion.div>

        {/* Success Result */}
        {result && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6 bg-green-600/10 border border-green-600/30 rounded-2xl p-6"
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
            transition={{ delay: 0.3 }}
            className="mt-6 bg-red-600/10 border border-red-600/30 rounded-2xl p-6"
          >
            <h3 className="text-xl font-bold mb-2 text-red-400">
              ❌ {language === 'en' ? 'Backup Failed' : 'فشل إنشاء النسخة الاحتياطية'}
            </h3>
            <p className="text-gray-300">{error}</p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
