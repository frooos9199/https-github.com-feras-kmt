"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import EventCountdown from "@/components/EventCountdown"
import { useLanguage } from "@/contexts/LanguageContext"
import { motion } from "framer-motion"
import Link from "next/link"
import MobileConfigAdminButton from "@/components/MobileConfigAdminButton"

interface Event {
  id: string
  titleEn: string
  titleAr: string
  descriptionEn: string
  descriptionAr: string
  date: string
  endDate: string | null
  time: string
  location: string
  endTime?: string | null
  marshalTypes: string
  maxMarshals: number
  status: string
  _count: {
    attendances: number
  }
}

export default function EventsManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { language } = useLanguage();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    titleEn: "",
    titleAr: "",
    descriptionEn: "",
    descriptionAr: "",
    date: "",
    endDate: "",
    time: "",
    endTime: "",
    location: "",
    marshalTypes: [] as string[],
    maxMarshals: "20",
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/dashboard");
    }
  }, [status, session, router]);

  useEffect(() => {
    if (session?.user?.role === "admin") {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/events");
      const data = await res.json();
      if (Array.isArray(data)) {
        setEvents(data);
      } else if (Array.isArray(data.events)) {
        setEvents(data.events);
      } else {
        setEvents([]);
      }
    } catch (error) {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  // Sort events: current first, then upcoming, then ended
  const now = new Date();
  const parseDate = (event: any, which: 'start'|'end') => {
    const dateStr = which === 'start' ? event.date : event.endDate;
    const timeStr = which === 'start' ? event.time : event.endTime;
    if (!dateStr || !timeStr) return null;
    const datePart = typeof dateStr === 'string' ? dateStr.split('T')[0] : '';
    const dt = new Date(datePart + 'T' + timeStr);
    return isNaN(dt.getTime()) ? null : dt;
  };
  const getState = (event: any) => {
    const start = parseDate(event, 'start');
    const end = parseDate(event, 'end');
    if (!start) return 'ended';
    if (end && now > end) return 'ended';
    if (now >= start && (!end || now <= end)) return 'current';
    if (now < start) return 'upcoming';
    return 'ended';
  };
  const sorted = [...events].sort((a, b) => {
    const stateOrder = { current: 0, upcoming: 1, ended: 2 };
    const aState = getState(a);
    const bState = getState(b);
    if (aState !== bState) return stateOrder[aState] - stateOrder[bState];
    // If same state, sort by start date ascending
    const aStart = parseDate(a, 'start');
    const bStart = parseDate(b, 'start');
    if (aStart && bStart) return aStart.getTime() - bStart.getTime();
    return 0;
  });

  if (status === "loading" || loading) {
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
            <Link href="/admin" className="flex items-center gap-3">
              <img src="/kmt-logo-main.png" alt="KMT" className="h-12 w-auto rounded px-2 py-1" />
              <span className="text-yellow-500 font-bold text-sm">👑 ADMIN</span>
            </Link>
            <Link
              href="/admin"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ← {language === "ar" ? "العودة" : "Back"}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MobileConfigAdminButton />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              🏁 {language === "ar" ? "إدارة الفعاليات" : "Events Management"}
            </h1>
            <p className="text-gray-400">
              {language === "ar" ? "إنشاء وتعديل وحذف الفعاليات" : "Create, edit and delete events"}
            </p>
          </div>
        </motion.div>

        {/* Events Grid */}
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center"
          >
            <p className="text-gray-400 text-lg">
              {language === "ar" ? "لا توجد فعاليات" : "No events found"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sorted.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-zinc-900/50 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-600/50 transition-all cursor-pointer transform hover:scale-105"
              >
                <div
                  className="relative h-32 overflow-hidden cursor-pointer"
                  onClick={() => window.open(`/admin/events/${event.id}`, '_self')}
                  title={language === "ar" ? "عرض تفاصيل الفعالية" : "View event details"}
                >
                  <div className="absolute inset-0 w-full h-full z-0">
                    <div
                      style={{
                        backgroundImage: 'url(/test.jpg)',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        backgroundRepeat: 'no-repeat',
                        width: '100%',
                        height: '100%',
                        position: 'absolute',
                        inset: 0
                      }}
                    />
                  </div>
                </div>
                <EventCountdown event={event} language={language} />
                <div className="flex">
                  <div className="flex flex-col items-center justify-center px-3 py-4 gap-2">
                    {event.marshalTypes && event.marshalTypes.split(',').filter((t: string) => t).map((type: string) => {
                      const typeIcons: Record<string, string> = {
                        'drag-race': '🏁',
                        'motocross': '🏍️',
                        'karting': '🏎️',
                        'drift': '💨',
                        'circuit': '🏁',
                        'rescue': '🚑'
                      };
                      return <span key={type} className="text-2xl md:text-3xl">{typeIcons[type] || '�'}</span>;
                    })}
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="text-lg font-bold text-white mb-2 truncate">
                      {language === "ar" ? event.titleAr : event.titleEn}
                    </h3>
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {language === "ar" ? event.descriptionAr : event.descriptionEn}
                    </p>
                    <div className="space-y-1 text-sm text-gray-300 mb-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-green-500 flex items-center gap-1">
                            {language === "ar" ? "بداية" : "Start"}:
                            <span className="flex items-center gap-2">
                              <span>🕐 {event.time}</span>
                              <span className="inline-block w-3" />
                              <span>📅 {new Date(event.date).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</span>
                            </span>
                          </span>
                          {event.endDate && event.endTime && (
                            <span className="font-bold text-red-500 flex items-center gap-1 mt-1">
                              {language === "ar" ? "نهاية" : "End"}:
                              <span className="flex items-center gap-2">
                                <span>🕐 {event.endTime}</span>
                                <span className="inline-block w-3" />
                                <span>📅 {new Date(event.endDate).toLocaleDateString(language === "ar" ? "ar-EG" : "en-US")}</span>
                              </span>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>👥</span>
                        <span>
                          <span className={
                            event._count.attendances >= event.maxMarshals
                              ? "text-red-500 font-bold"
                              : "text-green-500 font-bold"
                          }>
                            {event._count.attendances}
                          </span>
                          <span className="mx-1 text-gray-400">/</span>
                          <span className={
                            event._count.attendances >= event.maxMarshals
                              ? "text-red-500 font-bold"
                              : "text-red-500 font-bold"
                          }>
                            {event.maxMarshals}
                          </span>
                          <span className="ml-1 text-gray-400">{language === "ar" ? "مارشال" : "Marshals"}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={e => { e.stopPropagation(); window.open(`/admin/attendance/print/${event.id}`, '_blank'); }}
                        className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                        title={language === "ar" ? "طباعة قائمة الحضور" : "Print Attendance List"}
                      >
                        🖨️ {language === "ar" ? "طباعة" : "Print"}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); setEditingEvent(event); setShowModal(true); }}
                        className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        ✏️ {language === "ar" ? "تعديل" : "Edit"}
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); if (window.confirm(language === "ar" ? "هل أنت متأكد من حذف الفعالية؟" : "Are you sure you want to delete this event?")) { /* حذف الفعالية */ } }}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        🗑️ {language === "ar" ? "حذف" : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
