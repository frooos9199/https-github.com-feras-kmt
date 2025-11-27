// مثال عملي لدالة تسجيل الدخول وجلب التوكن من API الموقع الرئيسي
// يمكنك نسخ الكود وتعديله حسب بيئة العمل (React Native, Node.js, إلخ)

const API_BASE_URL = "https://your-backend.com"; // ضع هنا رابط السيرفر الفعلي
const LOGIN_ENDPOINT = "/api/auth/login"; // endpoint الخاص بتسجيل الدخول

// دالة تسجيل الدخول
async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}${LOGIN_ENDPOINT}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email, password })
  });
  if (!response.ok) {
    throw new Error("فشل تسجيل الدخول");
  }
  const data = await response.json();
  // تحقق من وجود التوكن في response
  if (!data.token && !data.accessToken && !data.jwt) {
    throw new Error("لم يتم العثور على التوكن في response. اطلب من مطور الـ backend تعديله ليعيد التوكن مع بيانات المستخدم.");
  }
  // اختر اسم الحقل المناسب حسب الـ backend
  const token = data.token || data.accessToken || data.jwt;
  return { token, user: data.user };
}

// مثال استخدام الدالة
// loginUser("user@email.com", "password123").then(res => console.log(res)).catch(console.error);

module.exports = { loginUser };
