"use client";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

interface MarshalProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string | null;
  civilId: string | null;
  dateOfBirth: string | null;
  nationality: string | null;
  image: string | null;
  licenseFrontImage: string | null;
  licenseBackImage: string | null;
  role: string;
  isActive: boolean;
  marshalTypes?: string[];
}

export default function AdminMarshalProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const { language, t } = useLanguage();
  const [profile, setProfile] = useState<MarshalProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params?.id) {
      setLoading(true);
      fetch(`/api/admin/marshals/${params.id}`)
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          setProfile(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [params?.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-white mt-4">{t('loading')}</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        {language === 'ar' ? 'لا توجد بيانات لهذا المارشال' : 'No data for this marshal'}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black flex flex-col items-center py-8">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-lg border-b border-red-600/30 sticky top-0 z-40 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/admin/marshals" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </Link>
            <Link
              href="/admin/marshals"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← العودة
            </Link>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="w-full flex justify-center">
        <div className="w-full max-w-5xl bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden mt-8 p-0 md:p-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar: Profile image, role, license images, admin buttons */}
          <div className="flex flex-col items-center gap-8 md:w-80 w-full py-8 px-4 md:px-0 border-b md:border-b-0 md:border-e border-zinc-800">
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt={profile.name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-red-600 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-4xl font-bold shadow-lg">
                    {profile.name?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/70 border border-zinc-800 rounded-lg text-gray-300 text-base font-semibold shadow mt-2">
                {profile.role === "admin" ? "👑" : "🏁"}
                {profile.role === "admin" ? t('admin') : t('marshal')}
              </span>
            </div>
            {/* Admin Buttons */}
            <div className="flex flex-row flex-wrap gap-3 justify-center items-center w-full">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                type="submit"
                form="marshal-edit-form"
              >
                💾 {t('saveChanges')}
              </button>
              <button
                className={`font-bold py-2 px-6 rounded-lg transition-colors ${profile.isActive ? 'bg-yellow-600 hover:bg-yellow-700 text-white' : 'bg-green-600 hover:bg-green-700 text-white'}`}
                type="button"
                onClick={async (e) => {
                  e.preventDefault();
                  // Toggle isActive using PATCH
                  const res = await fetch(`/api/admin/marshals/${profile.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ isActive: !profile.isActive })
                  });
                  if (res.ok) {
                    // أعد تحميل بيانات المارشال من السيرفر لضمان مزامنة الحالة مع الجدول الخارجي
                    const updated = await fetch(`/api/admin/marshals/${profile.id}`);
                    if (updated.ok) {
                      const data = await updated.json();
                      setProfile(data);
                    }
                  }
                }}
              >
                {profile.isActive ? t('deactivate') : t('activate')}
              </button>
              <button
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                onClick={async () => {
                  if (confirm(t('confirmDeleteMarshal'))) {
                    const res = await fetch(`/api/admin/marshals/${profile.id}`, { method: 'DELETE' });
                    if (res.ok) {
                      window.location.href = '/admin/marshals';
                    }
                  }
                }}
                type="button"
              >
                🗑️ {t('delete')}
              </button>
            </div>
            {/* License Images */}
            <div className="flex flex-col gap-6 items-center w-full mt-8">
              <div className="flex flex-col items-center w-full">
                <span className="block text-gray-400 mb-2 text-sm">{t('licenseFront')}</span>
                {profile.licenseFrontImage ? (
                  <img
                    src={profile.licenseFrontImage || undefined}
                    alt="License Front"
                    className="w-56 h-40 object-cover border-2 border-zinc-700 rounded-lg shadow"
                  />
                ) : (
                  <div className="w-56 h-40 flex items-center justify-center bg-zinc-800/50 border-2 border-zinc-700 rounded-lg text-gray-500">
                    {t('noImage')}
                  </div>
                )}
              </div>
              <div className="flex flex-col items-center w-full">
                <span className="block text-gray-400 mb-2 text-sm">{t('licenseBack')}</span>
                {profile.licenseBackImage ? (
                  <img
                    src={profile.licenseBackImage || undefined}
                    alt="License Back"
                    className="w-56 h-40 object-cover border-2 border-zinc-700 rounded-lg shadow"
                  />
                ) : (
                  <div className="w-56 h-40 flex items-center justify-center bg-zinc-800/50 border-2 border-zinc-700 rounded-lg text-gray-500">
                    {t('noImage')}
                  </div>
                )}
              </div>
            </div>
          </div>
          {/* Main Form: Info fields and marshal types */}
          <form
            id="marshal-edit-form"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const formData = new FormData(form);
              // Build updated object: marshalTypes as string[], rest as string
              const updated: any = {};
              for (const [key, value] of formData.entries()) {
                if (key === 'marshalTypes') continue;
                updated[key] = value;
              }
              updated.marshalTypes = formData.getAll('marshalTypes').map(String);
              const res = await fetch(`/api/admin/marshals/${profile.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updated),
              });
              if (res.ok) {
                const data = await res.json();
                setProfile(data);
                alert('تم التحديث بنجاح');
              } else {
                let msg = 'فشل التحديث';
                try {
                  const err = await res.json();
                  if (err && err.error) msg += `: ${err.error}`;
                } catch {}
                alert(msg);
              }
            }}
            className="flex-1 flex flex-col gap-8 py-8 px-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
              <div className="space-y-6">
                <label className="block text-gray-400 mb-2 text-sm">{t('name')}</label>
                <input name="name" type="text" defaultValue={profile.name || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('email')}</label>
                <input name="email" type="email" defaultValue={profile.email || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('employeeId')}</label>
                <input name="employeeId" type="text" defaultValue={profile.employeeId || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white font-bold" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('phone')}</label>
                <input name="phone" type="tel" defaultValue={profile.phone || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('civilId')}</label>
                <input name="civilId" type="text" defaultValue={profile.civilId || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('dateOfBirth')}</label>
                <input name="dateOfBirth" type="date" defaultValue={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 mb-2 text-sm">{t('nationality')}</label>
                <input name="nationality" type="text" defaultValue={profile.nationality || ""} className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700 rounded-lg text-white" />
              </div>
            </div>
            {/* Marshal Types */}
            <div>
              <label className="block text-gray-400 mb-2 text-sm">{t('marshalTypes')}</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-zinc-800 border border-zinc-700 rounded-xl p-4">
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-red-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="drag-race" defaultChecked={profile.marshalTypes?.includes('drag-race')} className="accent-red-600 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">🏁</span>
                  <span className="font-bold text-red-400 text-sm">{t('marshalDragRace')}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-orange-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="motocross" defaultChecked={profile.marshalTypes?.includes('motocross')} className="accent-orange-600 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">🏍️</span>
                  <span className="font-bold text-orange-400 text-sm">{t('marshalMotocross')}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-yellow-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="karting" defaultChecked={profile.marshalTypes?.includes('karting')} className="accent-yellow-400 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">🏎️</span>
                  <span className="font-bold text-yellow-300 text-sm">{t('marshalKarting')}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-purple-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="drift" defaultChecked={profile.marshalTypes?.includes('drift')} className="accent-purple-600 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">💨</span>
                  <span className="font-bold text-purple-400 text-sm">{t('marshalDrift')}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-blue-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="circuit" defaultChecked={profile.marshalTypes?.includes('circuit')} className="accent-blue-600 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">🏁</span>
                  <span className="font-bold text-blue-400 text-sm">{t('marshalCircuit')}</span>
                </label>
                <label className="flex flex-col items-center justify-center gap-2 p-3 rounded-xl shadow transition-all cursor-pointer border-2 border-transparent hover:border-green-400 hover:shadow-lg group">
                  <input type="checkbox" name="marshalTypes" value="rescue" defaultChecked={profile.marshalTypes?.includes('rescue')} className="accent-green-600 w-6 h-6 mb-1 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl group-hover:scale-125 transition-transform">🚑</span>
                  <span className="font-bold text-green-400 text-sm">{t('marshalRescue')}</span>
                </label>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
