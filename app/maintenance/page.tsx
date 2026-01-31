export default function MaintenancePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white px-6">
      <div className="max-w-xl text-center">
        <div className="text-red-500 font-bold text-sm tracking-widest mb-3">KMT MARSHAL SYSTEM</div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-4">الخدمة متوقفة مؤقتًا</h1>
        <p className="text-gray-300 text-lg leading-relaxed">
          حالياً نقوم بأعمال صيانة وتحسينات. يرجى المحاولة لاحقًا.
        </p>
      </div>
    </div>
  );
}
