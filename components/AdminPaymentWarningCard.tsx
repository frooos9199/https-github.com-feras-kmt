"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";

export default function AdminPaymentWarningCard() {
  const { data: session, status } = useSession();
  const [dismissed, setDismissed] = useState(false);

  const shouldShow = useMemo(() => {
    if (dismissed) return false;
    if (status !== "authenticated") return false;
    return (session as any)?.user?.role === "admin";
  }, [dismissed, session, status]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.localStorage.getItem("adminPaymentWarningDismissed");
      if (stored === "1") setDismissed(true);
    } catch {
      // ignore
    }
  }, []);

  const onDismiss = () => {
    setDismissed(true);
    try {
      window.localStorage.setItem("adminPaymentWarningDismissed", "1");
    } catch {
      // ignore
    }
  };

  if (!shouldShow) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-yellow-600/40 bg-zinc-950 p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-yellow-400 font-extrabold text-lg">تنبيه إداري</div>
            <div className="text-white font-bold text-2xl mt-1">مستحقات المشروع غير مدفوعة</div>
          </div>
          <button
            type="button"
            onClick={onDismiss}
            className="text-zinc-400 hover:text-white transition-colors"
            aria-label="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="mt-4 text-zinc-200 leading-relaxed">
          يرجى سداد المبلغ المستحق لتجنب إيقاف الخدمة أو تعطيل بعض المزايا.
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onDismiss}
            className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-4 rounded-lg transition-colors"
          >
            فهمت
          </button>
          <button
            type="button"
            onClick={() => {
              try {
                window.open("mailto:billing@company.com?subject=Payment%20Reminder", "_blank");
              } catch {
                // ignore
              }
            }}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            تواصل الآن
          </button>
        </div>

        <div className="mt-4 text-xs text-zinc-500">
          يظهر هذا التنبيه للأدمن فقط.
        </div>
      </div>
    </div>
  );
}
