export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-xl text-center">
        <div className="text-red-500 font-bold text-sm tracking-widest mb-3">KMT MARSHAL SYSTEM</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">الخدمة متوقفة مؤقتًا</h1>
        <p className="text-gray-300 text-lg leading-relaxed mb-8">
          حالياً نقوم بأعمال صيانة وتحسينات. يرجى المحاولة لاحقًا.
        </p>

        <div className="border-t border-zinc-800 pt-6">
          <p className="text-gray-400 text-sm mb-4">للاتصال بالمطور:</p>
          <div className="flex flex-col gap-3 items-center">
            <a 
              href="https://www.q8nexdev.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-red-500 hover:text-red-400 transition-colors font-semibold"
            >
              🌐 www.q8nexdev.com
            </a>
            <a 
              href="tel:+96550540999"
              className="text-red-500 hover:text-red-400 transition-colors font-semibold"
            >
              📞 +٩٦٥٥٠٥٤٠٩٩٩
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
