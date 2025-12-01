# تقرير التحديثات - نظام KMT

## 📋 ملخص التحديثات

تم تحديث التطبيق المحمول (kmtsysApp) والـ Backend (kmt) لضمان عمل صحيح مع JWT Authentication وفصل الصلاحيات بين الأدمن والمارشال.

---

## ✅ التعديلات المنفذة

### 1. إنشاء ملف تكوين API مركزي
**الملف:** `kmtsysApp/apiConfig.js`

- يحتوي على جميع مسارات API
- دوال مساعدة لإنشاء Headers
- دوال للتعامل مع GET, POST, PUT, DELETE
- اختيار المسار الصحيح حسب دور المستخدم (admin/marshal)

**المسارات المتاحة:**
```javascript
AUTH:
  - LOGIN: /api/auth/login
  - SIGNUP: /api/auth/signup

ADMIN (للأدمن فقط):
  - EVENTS: /api/admin/events
  - STATS: /api/admin/stats
  - MARSHALS: /api/admin/marshals
  - REPORTS: /api/admin/reports
  - BROADCAST: /api/admin/broadcast

DASHBOARD (للمارشال):
  - EVENTS: /api/dashboard/events
  - STATS: /api/dashboard/stats

USER (للمستخدم العادي):
  - EVENTS: /api/user/events
  - PROFILE: /api/profile

ATTENDANCE (للجميع):
  - REGISTER: /api/attendance/register
  - MY_ATTENDANCE: /api/attendance/my-attendance
  - CANCEL: /api/attendance/cancel
```

---

### 2. تحديث LoginScreen
**الملف:** `kmtsysApp/LoginScreen.js`

**التغييرات:**
- استخدام `API_ENDPOINTS.AUTH.LOGIN` بدلاً من URL مباشر
- حفظ التوكن الصحيح من `data.accessToken`
- حفظ جميع بيانات المستخدم (id, name, email, role, employeeId, avatar, etc.)
- تحسين معالجة الأخطاء

**مثال على البيانات المحفوظة:**
```javascript
{
  id: "user_id",
  name: "اسم المستخدم",
  email: "user@email.com",
  employeeId: "12345",
  avatar: "https://...",
  token: "eyJhbGciOiJIUzI1NiIs...",
  role: "admin" // أو "marshal"
}
```

---

### 3. تحديث EventsScreen
**الملف:** `kmtsysApp/EventsScreen.js`

**التغييرات:**
- استخدام `getEventsEndpoint(user.role)` للحصول على المسار الصحيح
- استخدام `createAuthHeaders(user.token)` لإرسال التوكن
- إزالة الاعتماد على mobileConfig
- تحسين دالة حذف الحدث (استخدام Alert بدلاً من window.confirm)
- معالجة أفضل للأخطاء

**المسارات حسب الدور:**
- **Admin:** يستخدم `/api/admin/events`
- **Marshal:** يستخدم `/api/dashboard/events`

---

### 4. تحديث HomeScreen
**الملف:** `kmtsysApp/HomeScreen.js`

**التغييرات:**
- استخدام `getEventsEndpoint(user.role)`
- استخدام `createAuthHeaders(user.token)`
- إزالة الهيدرز غير الضرورية (Cookie, x-access-token)
- تحسين معالجة البيانات

---

### 5. تحديث StatsScreen
**الملف:** `kmtsysApp/StatsScreen.js`

**التغييرات:**
- استخدام `getStatsEndpoint(user.role)`
- استخدام `createAuthHeaders(user.token)`
- تحسين معالجة الأخطاء
- إضافة رسائل توضيحية في الـ console

---

### 6. إنشاء Dashboard Events API
**الملف الجديد:** `kmt/app/api/dashboard/events/route.ts`

**الوظيفة:**
- Endpoint مخصص للمارشال/المستخدم
- يدعم JWT Authentication
- يدعم NextAuth Session
- يُرجع الأحداث النشطة فقط (status: "active")
- يتضمن عدد الحضور المقبول لكل حدث

**المثال:**
```typescript
GET /api/dashboard/events
Headers: {
  Authorization: "Bearer <JWT_TOKEN>"
}

Response:
[
  {
    id: "event_id",
    titleEn: "Event Title",
    titleAr: "عنوان الحدث",
    date: "2025-12-01",
    _count: {
      attendances: 5
    }
  }
]
```

---

## 🔐 نظام المصادقة (Authentication)

### كيف يعمل؟

1. **تسجيل الدخول:**
   - المستخدم يدخل email و password
   - يُرسل طلب POST إلى `/api/auth/login`
   - السيرفر يتحقق من البيانات ويُنشئ JWT Token
   - التطبيق يحفظ التوكن و بيانات المستخدم في AsyncStorage (حسب IP)

2. **الطلبات المحمية:**
   - كل طلب API يتضمن الهيدر: `Authorization: Bearer <token>`
   - السيرفر يتحقق من التوكن
   - إذا كان التوكن صحيح، يُرجع البيانات
   - إذا كان التوكن خاطئ/منتهي، يُرجع 401 Unauthorized

3. **الصلاحيات:**
   - **Admin:** يصل إلى `/api/admin/*`
   - **Marshal:** يصل إلى `/api/dashboard/*`
   - **User:** يصل إلى `/api/user/*`

---

## 🧪 اختبار التطبيق

### خطوات الاختبار:

1. **تشغيل Metro Bundler:**
   ```bash
   cd kmtsysApp
   npx react-native start --reset-cache
   ```

2. **تشغيل التطبيق:**
   - **Android:** `npx react-native run-android`
   - **iOS:** `npx react-native run-ios`

3. **اختبار تسجيل الدخول:**
   - جرب تسجيل الدخول بحساب Admin
   - جرب تسجيل الدخول بحساب Marshal
   - تأكد من ظهور البيانات الصحيحة

4. **اختبار جلب الأحداث:**
   - في HomeScreen، تحقق من ظهور الأحداث
   - في EventsScreen، تحقق من ظهور الأحداث
   - تأكد من استخدام المسار الصحيح (راجع Console logs)

5. **اختبار الإحصائيات (للأدمن فقط):**
   - سجل دخول بحساب Admin
   - افتح StatsScreen
   - تأكد من ظهور الإحصائيات

---

## 📝 ملاحظات مهمة

### للمطورين:

1. **JWT Secret:**
   - تأكد من تطابق `JWT_SECRET` بين الـ Backend والتطبيق
   - الافتراضي: `dev-secret-key`
   - للإنتاج، استخدم secret آمن في `.env`

2. **API Base URL:**
   - حالياً: `https://www.kmtsys.com/api`
   - للتطوير المحلي، غيّر في `apiConfig.js`

3. **حفظ البيانات:**
   - يتم حفظ بيانات المستخدم حسب IP العام
   - يستخدم AsyncStorage
   - عند تغيير الشبكة، قد تحتاج إعادة تسجيل دخول

4. **معالجة الأخطاء:**
   - جميع الطلبات تُطبع في Console
   - راجع Console للتصحيح (Debug)

---

## 🔧 استكشاف الأخطاء

### مشكلة: "Unauthorized" عند جلب البيانات

**الحل:**
1. تحقق من أن التوكن موجود: `console.log(user.token)`
2. تحقق من صلاحية التوكن (لم ينتهي)
3. تأكد من استخدام المسار الصحيح حسب الدور

### مشكلة: "No events found"

**الحل:**
1. تحقق من وجود أحداث في قاعدة البيانات
2. تأكد من أن الأحداث status = "active"
3. راجع Console logs في التطبيق

### مشكلة: "Login failed"

**الحل:**
1. تحقق من صحة البريد الإلكتروني وكلمة المرور
2. تأكد من أن المستخدم موجود في قاعدة البيانات
3. راجع Console logs في Backend

---

## 📊 ملخص الملفات المُعدلة

### التطبيق (kmtsysApp):
- ✅ `apiConfig.js` (جديد)
- ✅ `LoginScreen.js`
- ✅ `EventsScreen.js`
- ✅ `HomeScreen.js`
- ✅ `StatsScreen.js`

### Backend (kmt):
- ✅ `app/api/dashboard/events/route.ts` (جديد)
- ℹ️ `app/api/admin/events/route.ts` (يدعم JWT بالفعل)
- ℹ️ `app/api/admin/stats/route.ts` (يدعم JWT بالفعل)
- ℹ️ `app/api/auth/login/route.ts` (يُصدر JWT بالفعل)

---

## ✨ ميزات إضافية

### دوال API المساعدة في apiConfig.js:

```javascript
// GET request
const result = await apiGet(url, token);

// POST request
const result = await apiPost(url, token, { data });

// PUT request
const result = await apiPut(url, token, { data });

// DELETE request
const result = await apiDelete(url, token);
```

**الاستخدام:**
```javascript
import { apiGet, API_ENDPOINTS } from './apiConfig';

// مثال
const fetchData = async () => {
  const result = await apiGet(
    API_ENDPOINTS.ADMIN.EVENTS,
    user.token
  );
  
  if (result.success) {
    console.log(result.data);
  } else {
    console.error(result.error);
  }
};
```

---

## 🚀 الخطوات التالية (اختياري)

1. **إضافة Refresh Token:**
   - لتجديد التوكن تلقائياً عند انتهائه

2. **إضافة Offline Support:**
   - حفظ البيانات محلياً للعمل بدون إنترنت

3. **تحسين الأمان:**
   - إضافة Rate Limiting
   - إضافة CAPTCHA لتسجيل الدخول

4. **إضافة Push Notifications:**
   - إشعارات عند إضافة حدث جديد
   - إشعارات عند قبول/رفض الحضور

---

## 📞 الدعم

للأسئلة أو المشاكل، راجع:
- Console logs في التطبيق
- Server logs في Backend
- ملف `api_endpoints_and_tokens.txt`

---

**تاريخ التحديث:** 1 ديسمبر 2025  
**الإصدار:** 2.0
