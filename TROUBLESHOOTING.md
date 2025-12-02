# 🔧 دليل حل المشاكل - KMT App

## 🐛 المشكلة: التطبيق لا يجلب البيانات

### ✅ الحلول المنفذة:

#### 1. إصلاح `authUtils.js` - مشكلة Buffer
**المشكلة:**
```javascript
// ❌ لا يعمل في React Native
const decoded = JSON.parse(
  Buffer.from(payload, 'base64').toString('utf-8')
);
```

**الحل:**
```javascript
// ✅ يعمل في React Native
const base64UrlDecode = (str) => {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // ... padding logic
  const decoded = atob(base64);
  return decodeURIComponent(escape(decoded));
};
```

---

#### 2. إصلاح FCM - "You must be registered for remote messages" 🔴 حرجة
**المشكلة:**
```
Error: [messaging/unregistered] You must be registered for remote messages 
before calling getToken, see messaging().registerDeviceForRemoteMessages().
```

**الحل:**
```javascript
// ✅ تسجيل الجهاز قبل getToken() (iOS)
if (Platform.OS === 'ios') {
  await messaging().registerDeviceForRemoteMessages();
}
const token = await messaging().getToken();
```

**الملفات المصلحة:**
- ✅ `FCMService.js`
- ✅ `App.js`

---

#### 3. إصلاح `LoginScreen.js` - FCM Token
**المشكلة:**
```javascript
// ❌ خطأ: نمرر email بدلاً من token
await sendFcmTokenToServer(fcmToken, email);
```

**الحل:**
```javascript
// ✅ صحيح: نمرر JWT token
await sendFcmTokenToServer(fcmToken, userData.token);
```

---

#### 3. إصلاح `UserContext.js` - Token Refresh Loop
**المشكلة:**
```javascript
// ❌ Infinite loop - يتحدث كل مرة يتغير token
useEffect(() => {
  // ...
}, [user?.token]);
```

**الحل:**
```javascript
// ✅ يستخدم email للتجنب infinite loop
useEffect(() => {
  // ...
}, [user?.email]);
```

---

### 📝 خطوات التصحيح (Debugging):

#### 1. فحص Console Logs بعد تشغيل التطبيق:

```bash
# تشغيل Metro Bundler
npx react-native start --reset-cache

# في terminal آخر
npx react-native run-android
# أو
npx react-native run-ios
```

#### 2. تتبع Console Logs المتوقعة:

**عند بدء التطبيق:**
```
[USER CONTEXT] 📂 Loading user data...
[USER CONTEXT] 🔍 Checking IP storage: XXX.XXX.XXX.XXX Found/Not found
[USER CONTEXT] ✅ User loaded: { email: ..., role: ..., hasToken: true }
```

**عند تسجيل الدخول:**
```
[LOGIN] ✅ Saving user data: { email: ..., role: ..., hasToken: true, ... }
[USER CONTEXT] 💾 Saving user: { email: ..., role: ..., ... }
[USER CONTEXT] ✅ User saved to AsyncStorage for IP: XXX.XXX.XXX.XXX
[LOGIN] 📱 FCM Token obtained
[FCM API] Sending FCM token to server...
[FCM API] ✅ FCM Token saved successfully
[LOGIN] ✅ Navigating to MainTabs
```

**عند جلب الأحداث (HomeScreen):**
```
[HOME] Starting fetch events...
[HOME] User: { email: ..., role: admin, hasToken: true }
[HOME] 🌐 Fetching events from: https://www.kmtsys.com/api/admin/events
[HOME] 📊 Response status: 200
[HOME] 📦 Response data: { ... }
[HOME] ✅ Fetched events: 5
```

**عند جلب الأحداث (EventsScreen):**
```
[EVENTS] 🔄 Fetching events...
[EVENTS] 👤 User: { email: ..., role: admin, hasToken: true }
[EVENTS] 🌐 API URL: https://www.kmtsys.com/api/admin/events
[EVENTS] 📊 Response status: 200
[EVENTS] 📦 Response data: Array(5)
```

---

### ❌ الأخطاء الشائعة وحلولها:

#### خطأ 1: "No token or role found"
```
[HOME] ❌ No token or role found
```

**الحل:**
1. تأكد من تسجيل الدخول بنجاح
2. افحص AsyncStorage:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getItem('user_data').then(data => {
  console.log('Stored user:', data);
});
```

---

#### خطأ 2: "401 Unauthorized"
```
[HOME] 📊 Response status: 401
[HOME] ❌ Events API error: Unauthorized
```

**الأسباب:**
- التوكن منتهي
- التوكن غير صحيح
- الدور (role) غير متطابق

**الحل:**
```javascript
// افحص التوكن
import { isTokenValid, decodeJWT } from './authUtils';

console.log('Token valid?', isTokenValid(user.token));
console.log('Token payload:', decodeJWT(user.token));
```

---

#### خطأ 3: "Network request failed"
```
[HOME] 💥 Error fetching events: Network request failed
```

**الأسباب:**
- لا يوجد اتصال بالإنترنت
- السيرفر لا يعمل
- CORS issues (على iOS/Android لا تحدث عادة)

**الحل:**
1. تأكد من الاتصال بالإنترنت
2. جرب فتح الرابط في المتصفح: `https://www.kmtsys.com/api/admin/events`

---

#### خطأ 4: "Invalid JWT format"
```
Error decoding JWT: Invalid JWT format
```

**الحل:**
- التوكن تالف أو غير كامل
- امسح البيانات وسجل دخول من جديد:
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.clear().then(() => {
  console.log('Storage cleared');
});
```

---

### 🧪 اختبار سريع:

#### 1. اختبار Token Validation:
```javascript
import { isTokenValid, decodeJWT } from './authUtils';

const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

console.log('Valid?', isTokenValid(testToken));
console.log('Decoded:', decodeJWT(testToken));
```

#### 2. اختبار API مباشرة:
```javascript
import { createAuthHeaders } from './apiConfig';

fetch('https://www.kmtsys.com/api/admin/events', {
  method: 'GET',
  headers: createAuthHeaders(user.token),
})
.then(res => res.json())
.then(data => console.log('Direct API test:', data))
.catch(err => console.error('Direct API error:', err));
```

---

### 🔄 إعادة تعيين كاملة:

إذا استمرت المشاكل، نفذ:

```bash
# 1. امسح Cache
cd kmtsysApp
rm -rf node_modules
npm install

# 2. امسح Metro Cache
npx react-native start --reset-cache

# 3. امسح Build folders
# Android
cd android && ./gradlew clean && cd ..

# iOS
cd ios && pod install && cd ..

# 4. أعد البناء
npx react-native run-android
# أو
npx react-native run-ios
```

---

### 📊 Log Levels:

الـ Logs الحالية تستخدم:
- ✅ = نجح
- ❌ = فشل
- 🔄 = جاري المعالجة
- 📂 = قراءة
- 💾 = حفظ
- 🌐 = Network request
- 📊 = Response status
- 📦 = Response data
- 👤 = User info

---

### 🆘 إذا لم تنحل المشكلة:

1. **افحص Console بدقة** - كل log له معنى
2. **شارك الـ Logs** - انسخ كل logs من Console
3. **تأكد من Backend** - تأكد إن السيرفر شغال
4. **جرب Postman** - اختبر API خارج التطبيق
5. **فحص Network** - استخدم React Native Debugger

---

## 📱 معلومات مفيدة:

### API Endpoints:
- Admin Events: `/api/admin/events`
- Marshal Events: `/api/dashboard/events`
- User Events: `/api/user/events`
- Login: `/api/auth/login`
- Notifications: `/api/notifications`

### Token Format:
```
Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIxMjMiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE2OTk5OTk5OTksImV4cCI6MTY5OTk5OTk5OX0.signature
```

### User Object Structure:
```javascript
{
  id: "user_id",
  name: "اسم المستخدم",
  email: "user@email.com",
  employeeId: "12345",
  role: "admin", // or "marshal"
  token: "eyJhbGci...",
  avatar: "https://...",
  civilId: "...",
  nationality: "...",
  birthdate: "...",
  phone: "..."
}
```

---

تم تحديث هذا الملف: 2 ديسمبر 2025
