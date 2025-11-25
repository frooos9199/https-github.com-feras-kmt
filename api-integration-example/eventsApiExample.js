// مثال عملي لربط تطبيق الجوال أو أي تطبيق خارجي مع API الأحداث في الموقع الرئيسي
// يمكنك نسخ هذا الكود وتعديله حسب بيئة العمل (React Native, Node.js, إلخ)

const API_BASE_URL = "https://your-backend.com"; // ضع هنا رابط السيرفر الفعلي إذا كان خارجيًا
const EVENTS_ENDPOINT = "/api/admin/events"; // أو endpoint المناسب حسب صلاحيات المستخدم

// مثال دالة لجلب الأحداث (Events)
async function fetchEvents(token) {
  const response = await fetch(`${API_BASE_URL}${EVENTS_ENDPOINT}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      // إذا كان هناك توكن مصادقة أضفه هنا
      ...(token ? { "Authorization": `Bearer ${token}` } : {})
    }
  });
  if (!response.ok) {
    // جلب تفاصيل الخطأ من السيرفر
    let errorBody;
    try {
      errorBody = await response.text();
    } catch (e) {
      errorBody = "(تعذر قراءة تفاصيل الخطأ)";
    }
    console.error("فشل في جلب الأحداث:", response.status, errorBody);
    throw new Error(`فشل في جلب الأحداث: ${response.status} - ${errorBody}`);
  }
  return await response.json();
}

// مثال استخدام الدالة
// fetchEvents("your-auth-token").then(events => console.log(events)).catch(console.error);

module.exports = { fetchEvents };
