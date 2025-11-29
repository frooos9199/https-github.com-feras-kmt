import React from "react";

export default function MobileConfigPage() {
  return (
    <div className="max-w-xl mx-auto mt-12 bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-white">
      <h1 className="text-2xl font-bold mb-6">إعدادات تطبيق الجوال</h1>
      <div className="mb-4">
        <div className="font-bold mb-2">رابط API:</div>
        <code className="block bg-zinc-800 p-2 rounded text-sm break-all">/api/mobile/config</code>
      </div>
      <div className="mb-4">
        <div className="font-bold mb-2">طريقة الحماية:</div>
        <div className="bg-zinc-800 p-2 rounded text-sm">
          يجب إرسال <span className="text-blue-400">Authorization</span> header مع القيمة:
          <br />
          <span className="text-green-400">Bearer my-secret-token</span>
        </div>
      </div>
      <div className="mb-4">
        <div className="font-bold mb-2">مثال طلب (cURL):</div>
        <code className="block bg-zinc-800 p-2 rounded text-sm break-all">
          curl -H "Authorization: Bearer my-secret-token" https://your-domain.com/api/mobile/config
        </code>
      </div>
      <div className="text-gray-400 text-sm mt-8">
        يمكنك تعديل التوكن من متغير البيئة <b>MOBILE_CONFIG_SECRET</b> أو من الكود مباشرة.
      </div>
    </div>
  );
}
