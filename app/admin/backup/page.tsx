'use client';

import { useState, useEffect, useRef } from 'react';
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
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [uploadError, setUploadError] = useState('');
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [uploadImagesResult, setUploadImagesResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

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

  const downloadExcel = async () => {
    try {
      setError('');
      const response = await fetch('/api/backup/download-excel');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download Excel');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KMT_Users_Backup_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download Excel file');
    }
  };

  const downloadImages = async () => {
    setDownloadingImages(true);
    try {
      setError('');
      const response = await fetch('/api/backup/download-images');
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to download images');
      }

      // Get the blob and create download link
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `KMT_Images_Backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || 'Failed to download images');
    } finally {
      setDownloadingImages(false);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError(language === 'en' ? 'Please select an Excel file (.xlsx or .xls)' : 'الرجاء اختيار ملف Excel (.xlsx أو .xls)');
      return;
    }

    setUploadLoading(true);
    setUploadError('');
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/backup/upload-excel', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data);
      } else {
        setUploadError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setUploadError('Failed to upload file. Please try again.');
    } finally {
      setUploadLoading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImagesSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.zip')) {
      setUploadError(language === 'en' ? 'Please select a ZIP file' : 'الرجاء اختيار ملف ZIP');
      return;
    }

    setUploadingImages(true);
    setUploadError('');
    setUploadImagesResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/backup/upload-images', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setUploadImagesResult(data);
      } else {
        setUploadError(data.error || 'Failed to upload images');
      }
    } catch (err) {
      setUploadError('Failed to upload images. Please try again.');
    } finally {
      setUploadingImages(false);
      // Reset file input
      if (imagesInputRef.current) {
        imagesInputRef.current.value = '';
      }
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
                    ? 'Backup is sent to su****_kw@hotmail.com with all database data'
                    : 'يتم إرسال النسخة الاحتياطية إلى su****_kw@hotmail.com مع جميع بيانات قاعدة البيانات'}
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

        {/* Excel Backup Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span>📊</span>
            <span>{language === 'en' ? 'Excel Backup & Restore' : 'النسخ الاحتياطي واستعادة Excel'}</span>
          </h2>
          
          <p className="text-gray-300 mb-6">
            {language === 'en' 
              ? 'Download all users data as Excel file or upload Excel file to restore/import users (including passwords).'
              : 'تحميل بيانات جميع المستخدمين كملف Excel أو رفع ملف Excel لاستعادة/استيراد المستخدمين (بما في ذلك كلمات المرور).'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Download Excel */}
            <button
              onClick={downloadExcel}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-lg transition-all"
            >
              <span className="text-2xl">📥</span>
              <span>{language === 'en' ? 'Download Excel' : 'تحميل Excel'}</span>
            </button>

            {/* Download Images */}
            <button
              onClick={downloadImages}
              disabled={downloadingImages}
              className={`flex items-center justify-center gap-3 px-6 py-4 rounded-lg font-bold text-lg transition-all ${
                downloadingImages
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white'
              }`}
            >
              {downloadingImages ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{language === 'en' ? 'Downloading...' : 'جاري التحميل...'}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📸</span>
                  <span>{language === 'en' ? 'Download Images' : 'تحميل الصور'}</span>
                </>
              )}
            </button>

            {/* Upload Excel */}
            <label className="flex items-center justify-center gap-3 px-6 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold text-lg transition-all cursor-pointer">
              {uploadLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{language === 'en' ? 'Uploading...' : 'جاري الرفع...'}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">📤</span>
                  <span>{language === 'en' ? 'Upload Excel' : 'رفع Excel'}</span>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                disabled={uploadLoading}
                className="hidden"
              />
            </label>
          </div>

          {/* Second Row: Upload Images */}
          <div className="grid grid-cols-1 gap-4">
            <label className="flex items-center justify-center gap-3 px-6 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-lg transition-all cursor-pointer">
              {uploadingImages ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>{language === 'en' ? 'Uploading Images...' : 'جاري رفع الصور...'}</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">🖼️</span>
                  <span>{language === 'en' ? 'Upload Images ZIP' : 'رفع ملف الصور ZIP'}</span>
                </>
              )}
              <input
                ref={imagesInputRef}
                type="file"
                accept=".zip"
                onChange={handleImagesSelect}
                disabled={uploadingImages}
                className="hidden"
              />
            </label>
          </div>

          {/* Upload Success Result */}
          {uploadResult && (
            <div className="mt-6 bg-green-600/10 border border-green-600/30 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3 text-green-400">
                ✅ {language === 'en' ? 'Upload Completed!' : 'تم الرفع بنجاح!'}
              </h3>
              
              <div className="space-y-2 text-gray-300 text-sm">
                <p>📊 <strong>{language === 'en' ? 'Total:' : 'الإجمالي:'}</strong> {uploadResult.stats?.total || 0}</p>
                <p>✅ <strong>{language === 'en' ? 'Imported:' : 'تم الاستيراد:'}</strong> {uploadResult.stats?.imported || 0}</p>
                <p>🔄 <strong>{language === 'en' ? 'Updated:' : 'تم التحديث:'}</strong> {uploadResult.stats?.updated || 0}</p>
                <p>❌ <strong>{language === 'en' ? 'Failed:' : 'فشل:'}</strong> {uploadResult.stats?.failed || 0}</p>
                
                {/* Update Details */}
                {uploadResult.updateDetails && uploadResult.updateDetails.length > 0 && (
                  <div className="mt-4 p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg">
                    <p className="font-bold text-blue-400 mb-3">
                      📝 {language === 'en' ? 'Update Details:' : 'تفاصيل التحديث:'}
                    </p>
                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {uploadResult.updateDetails.map((detail: any, idx: number) => (
                        <div key={idx} className="bg-zinc-800/50 p-3 rounded border border-zinc-700">
                          <p className="font-semibold text-white mb-2">
                            {detail.employeeId} - {detail.name} ({detail.email})
                          </p>
                          <div className="space-y-1 text-xs">
                            {Object.entries(detail.changes).map(([field, change]: [string, any]) => (
                              <div key={field} className="flex items-start gap-2">
                                <span className="text-yellow-400 min-w-[120px]">{field}:</span>
                                <div className="flex-1">
                                  <div className="text-red-400">
                                    ❌ {language === 'en' ? 'Old:' : 'قديم:'} {change.old || 'null'}
                                  </div>
                                  <div className="text-green-400">
                                    ✅ {language === 'en' ? 'New:' : 'جديد:'} {change.new || 'null'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {uploadResult.errors && uploadResult.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-600/10 border border-red-600/30 rounded">
                    <p className="font-bold text-red-400 mb-2">{language === 'en' ? 'Errors:' : 'الأخطاء:'}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {uploadResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {uploadResult.errors.length > 5 && (
                        <li>...{language === 'en' ? `and ${uploadResult.errors.length - 5} more` : `و ${uploadResult.errors.length - 5} أخرى`}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Images Success Result */}
          {uploadImagesResult && (
            <div className="mt-6 bg-green-600/10 border border-green-600/30 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-3 text-green-400">
                ✅ {language === 'en' ? 'Images Upload Completed!' : 'تم رفع الصور بنجاح!'}
              </h3>
              
              <div className="space-y-2 text-gray-300 text-sm">
                <p>📁 <strong>{language === 'en' ? 'Total Images:' : 'إجمالي الصور:'}</strong> {uploadImagesResult.stats?.total || 0}</p>
                <p>✅ <strong>{language === 'en' ? 'Uploaded:' : 'تم الرفع:'}</strong> {uploadImagesResult.stats?.uploaded || 0}</p>
                <p>⏭️ <strong>{language === 'en' ? 'Skipped:' : 'تم التجاهل:'}</strong> {uploadImagesResult.stats?.skipped || 0}</p>
                <p>❌ <strong>{language === 'en' ? 'Failed:' : 'فشل:'}</strong> {uploadImagesResult.stats?.failed || 0}</p>
                {uploadImagesResult.errors && uploadImagesResult.errors.length > 0 && (
                  <div className="mt-3 p-3 bg-red-600/10 border border-red-600/30 rounded">
                    <p className="font-bold text-red-400 mb-2">{language === 'en' ? 'Errors:' : 'الأخطاء:'}</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      {uploadImagesResult.errors.slice(0, 5).map((err: string, i: number) => (
                        <li key={i}>{err}</li>
                      ))}
                      {uploadImagesResult.errors.length > 5 && (
                        <li>...{language === 'en' ? `and ${uploadImagesResult.errors.length - 5} more` : `و ${uploadImagesResult.errors.length - 5} أخرى`}</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && (
            <div className="mt-6 bg-red-600/10 border border-red-600/30 rounded-xl p-4">
              <h3 className="text-lg font-bold mb-2 text-red-400">
                ❌ {language === 'en' ? 'Upload Failed' : 'فشل الرفع'}
              </h3>
              <p className="text-gray-300 text-sm">{uploadError}</p>
            </div>
          )}

          {/* Important Notes */}
          <div className="mt-6 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
            <h4 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
              <span>⚠️</span>
              <span>{language === 'en' ? 'Important Notes:' : 'ملاحظات هامة:'}</span>
            </h4>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>{language === 'en' ? 'Excel file contains ALL user data including password hashes' : 'يحتوي ملف Excel على جميع بيانات المستخدمين بما في ذلك كلمات المرور المشفرة'}</li>
              <li>{language === 'en' ? 'Images ZIP contains ALL profile photos and documents' : 'ملف ZIP يحتوي على جميع الصور الشخصية والمستندات'}</li>
              <li>{language === 'en' ? 'Uploading will update existing users or create new ones' : 'الرفع سيحدث المستخدمين الموجودين أو ينشئ مستخدمين جدد'}</li>
              <li>{language === 'en' ? 'Keep backup files secure - they contain sensitive data!' : 'احتفظ بملفات النسخ الاحتياطي بشكل آمن - تحتوي على بيانات حساسة!'}</li>
            </ul>
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
