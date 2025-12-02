# ✅ شاشة قبول طلبات الحضور - PendingRequestsScreen

## 📋 الوصف
شاشة جديدة للأدمن لعرض وإدارة طلبات حضور المارشالات للأحداث. تسمح بقبول أو رفض الطلبات مع إرسال إشعارات تلقائية.

---

## 🎯 المميزات

### 1. عرض الطلبات
- ✅ قائمة شاملة بجميع طلبات الحضور
- ✅ معلومات تفصيلية عن الحدث (العنوان، التاريخ، الوقت، الموقع)
- ✅ معلومات المارشال (الاسم، رقم الموظف، البريد، الهاتف)
- ✅ حالة الطلب مع أيقونات ملونة (pending, approved, rejected)

### 2. الفلترة
- 🔍 **Pending**: الطلبات المعلقة فقط
- ✅ **Approved**: الطلبات المقبولة
- ❌ **Rejected**: الطلبات المرفوضة
- 📊 **All**: جميع الطلبات

### 3. الإجراءات
- ✅ **قبول الطلب**: تحويل الحالة إلى approved
- ❌ **رفض الطلب**: تحويل الحالة إلى rejected
- 🔄 **Pull to Refresh**: تحديث القائمة
- ⚠️ **تأكيد الإجراء**: Alert قبل القبول/الرفض

### 4. الإشعارات التلقائية
- 📧 إرسال بريد إلكتروني للمارشال
- 🔔 إرسال إشعار Push Notification
- ✉️ قوالب بريد منسقة (approval/rejection templates)

---

## 🔗 الوصول للشاشة

### طريقة 1: من Quick Actions (الإجراءات السريعة)
```javascript
// QuickActionsScreen.js
navigation.navigate('PendingRequests');
```
- الأدمن يدخل على تاب **Quick Actions** ⚡
- يضغط على **طلبات الحضور** 📋

### طريقة 2: من Home Screen
```javascript
// HomeScreen.js - كارد الطلبات المعلقة
<Card
  title="الطلبات المعلقة اليوم"
  number={pendingRequests}
  onPress={() => navigation.navigate('PendingRequests')}
/>
```
- الأدمن يضغط على كارد **الطلبات المعلقة** في الصفحة الرئيسية 🏠

---

## 🛠️ التكامل مع Backend

### API Endpoint
```javascript
// apiConfig.js
ADMIN: {
  ATTENDANCE: `${API_BASE_URL}/admin/attendance`
}
```

### GET - جلب الطلبات
```javascript
GET /api/admin/attendance?status=pending
Headers: { Authorization: Bearer <JWT_TOKEN> }
```

**Response:**
```json
[
  {
    "id": "attendance-id",
    "status": "pending",
    "registeredAt": "2025-12-02T10:30:00Z",
    "user": {
      "id": "user-id",
      "name": "أحمد محمد",
      "employeeId": "KMT001",
      "email": "ahmad@kmt.com",
      "phone": "+96512345678"
    },
    "event": {
      "id": "event-id",
      "titleEn": "Circuit Marshal Training",
      "titleAr": "تدريب مارشال الحلبة",
      "date": "2025-12-10",
      "time": "08:00",
      "location": "Kuwait Motor Town"
    }
  }
]
```

### PUT - تحديث حالة الطلب
```javascript
PUT /api/admin/attendance
Headers: { 
  Authorization: Bearer <JWT_TOKEN>,
  Content-Type: application/json
}
Body: {
  "attendanceId": "attendance-id",
  "status": "approved" | "rejected",
  "notes": "ملاحظات اختيارية"
}
```

**Response:**
```json
{
  "id": "attendance-id",
  "status": "approved",
  "user": { ... },
  "event": { ... }
}
```

---

## 🎨 التصميم

### الألوان
- **Background**: Gradient من #1f2937 إلى #111827
- **Card**: #1f2937 مع حدود #374151
- **Pending**: #f59e0b (برتقالي)
- **Approved**: #22c55e (أخضر)
- **Rejected**: #ef4444 (أحمر)

### المكونات
```javascript
// RequestCard
├── Event Info (العنوان، التاريخ، الوقت، الموقع)
├── Status Badge (حالة الطلب مع أيقونة)
├── Marshal Info (الاسم، رقم الموظف)
├── Contact Info (البريد، الهاتف)
├── Registration Date (تاريخ التسجيل)
└── Action Buttons (قبول/رفض) - للطلبات المعلقة فقط
```

---

## 📱 مثال الاستخدام

### مثال 1: فتح الشاشة من Quick Actions
```javascript
// في QuickActionsScreen.js
const handleActionPress = (key) => {
  if (key === 'attendance_requests') {
    navigation.navigate('PendingRequests');
  }
};
```

### مثال 2: قبول طلب
```javascript
// PendingRequestsScreen.js
const performStatusUpdate = async (attendanceId, newStatus) => {
  const response = await fetch(API_ENDPOINTS.ADMIN.ATTENDANCE, {
    method: 'PUT',
    headers: {
      ...createAuthHeaders(user.token),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      attendanceId,
      status: newStatus,
    }),
  });

  if (response.ok) {
    Alert.alert('Success', 'Request approved');
    fetchRequests(); // تحديث القائمة
  }
};
```

---

## 🌐 الترجمات المضافة

### العربية (ar.json)
```json
{
  "attendance_requests": "طلبات الحضور",
  "approve": "قبول",
  "reject": "رفض",
  "approved": "مقبول",
  "rejected": "مرفوض",
  "pending": "قيد الانتظار",
  "all": "الكل",
  "confirmApproval": "تأكيد القبول",
  "confirmRejection": "تأكيد الرفض",
  "marshalName": "اسم المارشال",
  "event": "الحدث",
  "requestApproved": "تم قبول الطلب بنجاح",
  "requestRejected": "تم رفض الطلب",
  "noRequests": "لا توجد طلبات",
  "noPendingRequests": "لا توجد طلبات معلقة",
  "registeredAt": "تاريخ التسجيل"
}
```

### الإنجليزية (en.json)
```json
{
  "attendance_requests": "Attendance Requests",
  "approve": "Approve",
  "reject": "Reject",
  "approved": "Approved",
  "rejected": "Rejected",
  "pending": "Pending",
  "all": "All",
  "confirmApproval": "Confirm Approval",
  "confirmRejection": "Confirm Rejection",
  "marshalName": "Marshal Name",
  "event": "Event",
  "requestApproved": "Request approved successfully",
  "requestRejected": "Request rejected",
  "noRequests": "No requests",
  "noPendingRequests": "No pending requests",
  "registeredAt": "Registered at"
}
```

---

## 📂 الملفات المعدلة

### ملفات جديدة
1. ✅ **PendingRequestsScreen.js** - الشاشة الرئيسية

### ملفات معدلة
1. ✅ **App.js** - إضافة المسار في Stack Navigator
2. ✅ **apiConfig.js** - إضافة ADMIN.ATTENDANCE endpoint
3. ✅ **QuickActionsScreen.js** - إضافة navigation للشاشة
4. ✅ **HomeScreen.js** - إضافة onPress للكارد + navigation
5. ✅ **locales/ar.json** - إضافة الترجمات العربية
6. ✅ **locales/en.json** - إضافة الترجمات الإنجليزية

---

## 🚀 كيفية التشغيل

### 1. تثبيت التحديثات
```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmtsysApp
npx react-native start --reset-cache
```

### 2. تشغيل التطبيق
```bash
# iOS
npx react-native run-ios

# Android
npx react-native run-android
```

### 3. تسجيل الدخول كـ Admin
- استخدم حساب أدمن موجود
- سترى الشاشة متاحة في Quick Actions

---

## 🔐 الصلاحيات

### Admin فقط
- الشاشة متاحة **للأدمن فقط**
- يتم التحقق من `user.role === 'admin'` في Backend
- رسالة خطأ 401 Unauthorized للمستخدمين الآخرين

---

## 🎯 الخطوات التالية (اختيارية)

### تحسينات مستقبلية
1. **Pagination**: تحميل الطلبات على دفعات
2. **Search**: البحث بالاسم أو رقم الموظف
3. **Bulk Actions**: قبول/رفض عدة طلبات معًا
4. **Stats**: إحصائيات عن الطلبات المقبولة/المرفوضة
5. **Notes Field**: إضافة ملاحظات عند الرفض
6. **History**: عرض سجل التغييرات على الطلب

---

## 🐛 استكشاف الأخطاء

### الشاشة فارغة؟
```javascript
// تحقق من Console
console.log('[REQUESTS] Response:', response.status);
console.log('[REQUESTS] Data:', data);
```

### خطأ 401 Unauthorized؟
- تأكد من تسجيل الدخول كـ Admin
- تحقق من صلاحية JWT Token
- راجع backend logs

### الإشعارات لا تصل؟
- تأكد من FCM Token محدث
- تحقق من أذونات الإشعارات
- راجع `sendFcmTokenToServer()` في fcmApi.js

---

## ✅ الخلاصة

تم إضافة شاشة **PendingRequestsScreen** بنجاح! 🎉

الأدمن يقدر الآن:
- ✅ يشوف جميع طلبات الحضور
- ✅ يقبل أو يرفض الطلبات
- ✅ يفلتر حسب الحالة (pending/approved/rejected)
- ✅ يحصل على إشعارات تلقائية للمارشالات

كل شي جاهز للاستخدام! 🚀
