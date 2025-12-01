# دليل الاختبار السريع - KMT App

## 🧪 خطوات الاختبار

### 1. تشغيل Metro Bundler
```bash
cd kmtsysApp
npx react-native start --reset-cache
```
**النتيجة المتوقعة:** ✅ Metro Bundler يعمل بدون أخطاء

---

### 2. تشغيل التطبيق

**Android:**
```bash
npx react-native run-android
```

**iOS:**
```bash
npx react-native run-ios
```

---

### 3. اختبار تسجيل الدخول

#### كـ Admin:
1. افتح التطبيق
2. أدخل بيانات Admin:
   - Email: `admin@kmtsys.com` (مثال)
   - Password: كلمة المرور
3. اضغط Login
4. راقب Console logs

**Console المتوقع:**
```
LOGIN RESPONSE: 200 true {...}
Saving user data: {
  id: "xxx",
  role: "admin",
  token: "eyJhbGci..."
}
```

#### كـ Marshal:
1. سجل خروج
2. أدخل بيانات Marshal:
   - Email: `marshal@kmtsys.com` (مثال)
   - Password: كلمة المرور
3. اضغط Login

**Console المتوقع:**
```
LOGIN RESPONSE: 200 true {...}
Saving user data: {
  id: "xxx",
  role: "marshal",
  token: "eyJhbGci..."
}
```

---

### 4. اختبار جلب الأحداث

#### في HomeScreen:
**Console المتوقع (Admin):**
```
Fetching events from: https://www.kmtsys.com/api/admin/events
Fetched events: X
```

**Console المتوقع (Marshal):**
```
Fetching events from: https://www.kmtsys.com/api/dashboard/events
Fetched events: X
```

#### في EventsScreen:
1. افتح تبويب Events
2. راقب Console logs

**Console المتوقع (Admin):**
```
Fetching events from: https://www.kmtsys.com/api/admin/events
User role: admin
Events API response: [...]
```

**Console المتوقع (Marshal):**
```
Fetching events from: https://www.kmtsys.com/api/dashboard/events
User role: marshal
Events API response: [...]
```

---

### 5. اختبار الإحصائيات (Admin فقط)

1. سجل دخول كـ Admin
2. افتح تبويب Stats
3. راقب Console logs

**Console المتوقع:**
```
Fetching stats from: https://www.kmtsys.com/api/admin/stats
Stats API response: {
  totalEvents: XX,
  totalMarshals: XX,
  ...
}
```

**إذا كنت Marshal:**
```
رسالة: "لا تملك صلاحية عرض الإحصائيات"
```

---

## ✅ قائمة التحقق

- [ ] Metro Bundler يعمل بدون أخطاء
- [ ] التطبيق يُفتح بنجاح
- [ ] تسجيل دخول Admin يعمل
- [ ] تسجيل دخول Marshal يعمل
- [ ] Admin يرى جميع الأحداث
- [ ] Marshal يرى الأحداث النشطة فقط
- [ ] Admin يرى الإحصائيات
- [ ] Marshal لا يرى الإحصائيات
- [ ] التوكن يُحفظ بنجاح
- [ ] البيانات تظهر بعد إعادة فتح التطبيق

---

## ❌ استكشاف الأخطاء الشائعة

### خطأ: "Unauthorized" عند جلب البيانات

**الأسباب المحتملة:**
1. التوكن غير صحيح
2. التوكن منتهي
3. الدور (role) غير صحيح

**الحل:**
```javascript
// في Console، تحقق من:
console.log('User token:', user.token);
console.log('User role:', user.role);
```

---

### خطأ: "No events found"

**الأسباب المحتملة:**
1. لا توجد أحداث في قاعدة البيانات
2. الأحداث ليست active
3. مشكلة في الاتصال بالسيرفر

**الحل:**
```javascript
// تحقق من Console:
console.log('Events API response:', data);
```

---

### خطأ: "Login failed"

**الأسباب المحتملة:**
1. البريد الإلكتروني أو كلمة المرور خاطئة
2. المستخدم غير موجود
3. مشكلة في الاتصال بالسيرفر

**الحل:**
```javascript
// تحقق من Console:
console.log('LOGIN RESPONSE:', response.status, data);
```

---

## 📊 مثال على بيانات الاختبار

### حسابات الاختبار:

**Admin:**
```
Email: admin@kmtsys.com
Password: Admin@123
Role: admin
```

**Marshal:**
```
Email: marshal@kmtsys.com
Password: Marshal@123
Role: marshal
```

---

## 🔍 نقاط المراقبة المهمة

### في LoginScreen:
```javascript
console.log('LOGIN RESPONSE:', response.status, response.ok, data);
console.log('Saving user data:', userData);
```

### في EventsScreen:
```javascript
console.log('Fetching events from:', apiUrl);
console.log('User role:', user.role);
console.log('Events API response:', data);
```

### في StatsScreen:
```javascript
console.log('Fetching stats from:', url);
console.log('Stats API response:', data);
```

---

## 📝 ملاحظات

1. **Console Logs:** افتح Metro Bundler terminal لمشاهدة جميع الـ logs
2. **Network:** تأكد من الاتصال بالإنترنت
3. **Backend:** تأكد من أن السيرفر يعمل
4. **Database:** تأكد من وجود بيانات في قاعدة البيانات

---

## 🎯 النتيجة المطلوبة

عند نجاح جميع الاختبارات:
- ✅ تسجيل الدخول يعمل للأدمن والمارشال
- ✅ كل مستخدم يرى البيانات المناسبة لدوره
- ✅ التوكن يُحفظ ويُستخدم بشكل صحيح
- ✅ الأحداث تظهر بدون أخطاء
- ✅ الإحصائيات تعمل للأدمن فقط
- ✅ لا توجد أخطاء في Console

---

**تاريخ الإنشاء:** 1 ديسمبر 2025
