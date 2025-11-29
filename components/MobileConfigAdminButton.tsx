"use client";
import Link from "next/link";

export default function MobileConfigAdminButton() {
  return (
    <div className="my-4 flex justify-end">
      <Link
        href="/admin/mobile-config"
        className="px-5 py-3 bg-blue-700 hover:bg-blue-800 text-white font-bold rounded-lg transition-colors shadow"
      >
        إعدادات تطبيق الجوال
      </Link>
    </div>
  );
}
