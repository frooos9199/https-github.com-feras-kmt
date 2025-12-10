# 📱 iOS Push Notifications - الدليل الكامل

## 🔍 المشكلة الحالية

التطبيق **لا يستقبل إشعارات عندما يكون مغلق** على iOS.

### السبب:

iOS يتطلب **APNs (Apple Push Notification service)** لإرسال إشعارات للتطبيقات المغلقة.

حتى لو كنت تستخدم Firebase Cloud Messaging (FCM)، Firebase يستخدم APNs في الخلفية على iOS!

---

## ✅ ما تم إنجازه حتى الآن

### 1. **Info.plist** ✅
```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
  <string>fetch</string>
  <string>processing</string>
</array>
```

### 2. **Entitlements** ✅
```xml
<key>aps-environment</key>
<string>development</string>
```

### 3. **Firebase Configuration** ✅
- `FirebaseApp.configure()` في AppDelegate.swift
- FCM token يتم إرساله للسيرفر
- Background message handler في index.js

### 4. **Background Fetch** ✅
- مضاف في App.js
- يشتغل كل 15 دقيقة
- Headless task في index.js

---

## ⚠️ المشكلة الرئيسية

**iOS لن يستقبل Push Notifications في الخلفية بدون APNs!**

### لماذا؟

1. **Apple Policy**: iOS يمنع أي خدمة من إرسال إشعارات مباشرة للجهاز
2. **FCM على iOS**: يستخدم APNs كوسيط (FCM → APNs → iPhone)
3. **بدون APNs**: الإشعارات تصل فقط عندما التطبيق مفتوح

---

## 🎯 الحل الكامل (تفعيل APNs)

### المتطلبات:
- ✅ Apple Developer Account ($99/سنة)
- ✅ تطبيق مسجل في App Store Connect
- ✅ Firebase Project

### الخطوات:

#### 1️⃣ إنشاء APNs Authentication Key

1. روح https://developer.apple.com/account
2. **Certificates, Identifiers & Profiles**
3. **Keys** → اضغط **+** (زر إضافة)
4. اكتب اسم للمفتاح مثل: "KMT Push Notifications"
5. فعّل ✅ **Apple Push Notifications service (APNs)**
6. اضغط **Continue** ثم **Register**
7. **Download** الملف `.p8`
8. **احفظ**:
   - **Key ID** (مثال: `ABC123XYZ4`)
   - **Team ID** (تلقاه في Account → Membership)

⚠️ **مهم جداً**: الملف `.p8` يتم تحميله **مرة واحدة فقط**! احفظه في مكان آمن.

#### 2️⃣ رفع المفتاح إلى Firebase Console

1. روح Firebase Console → اختر مشروعك
2. **Project Settings** ⚙️ → **Cloud Messaging** tab
3. في قسم **Apple app configuration**
4. اضغط **Upload** تحت "APNs Authentication Key"
5. ارفع ملف `.p8`
6. أدخل:
   - **Key ID**: اللي حفظته من Apple
   - **Team ID**: اللي حفظته من Apple
7. اضغط **Upload**

#### 3️⃣ تحديث Entitlements (للإنتاج)

عدّل `ios/kmtsysApp/kmtsysApp.entitlements`:

```xml
<key>aps-environment</key>
<string>production</string>  <!-- غيرها من development -->
```

#### 4️⃣ إعادة بناء التطبيق

```bash
cd ios
pod install
cd ..
npm run ios
```

---

## 🧪 الاختبار

### بعد تفعيل APNs:

1. **شغل التطبيق** على جهاز حقيقي (ليس Simulator)
2. **سجل دخول** بحساب Marshal أو Admin
3. **أغلق التطبيق تماماً** (swipe up من App Switcher)
4. **من المتصفح**: روح Dashboard → أرسل إشعار
5. **انتظر 5-10 ثواني**
6. **يجب أن يظهر الإشعار** على شاشة القفل! 🎉

### التحقق من FCM Token:

```javascript
// في App.js - شوف الـ console logs
console.log('[APP] ✅ FCM Token obtained:', token);
```

---

## 🔧 Troubleshooting

### المشكلة: الإشعارات ما توصل

#### ✅ تحقق:

1. **APNs Key مرفوع صح**
   - Firebase Console → Cloud Messaging
   - شوف APNs Authentication Key موجود

2. **Bundle ID صحيح**
   - Xcode → Signing & Capabilities
   - Bundle ID يطابق اللي في Firebase

3. **Notifications Permission**
   ```javascript
   const authStatus = await messaging().requestPermission();
   console.log('Permission:', authStatus);
   // يجب أن يكون: 1 (AUTHORIZED)
   ```

4. **FCM Token يوصل للسيرفر**
   - شيك قاعدة البيانات
   - جدول `User` → عمود `fcmToken`

5. **الجهاز متصل بالإنترنت**
   - APNs يحتاج اتصال

---

## 📊 كيف يعمل النظام

```
[Dashboard] → [Send Notification]
     ↓
[Backend API] → [Firebase Admin SDK]
     ↓
[Firebase Cloud Messaging (FCM)]
     ↓
[Apple Push Notification service (APNs)] ← المفتاح هنا!
     ↓
[iPhone16] → يظهر الإشعار حتى لو التطبيق مغلق ✅
```

---

## 💰 البديل المجاني (للاختبار فقط)

إذا **ما عندك Apple Developer Account**:

### استخدم Local Notifications:

```javascript
// عند استقبال بيانات جديدة
import PushNotificationIOS from '@react-native-community/push-notification-ios';

PushNotificationIOS.addNotificationRequest({
  id: 'unique-id',
  title: 'إشعار جديد',
  body: 'لديك حدث جديد',
  badge: 1
});
```

⚠️ **لكن**: هذا يشتغل فقط إذا التطبيق يشتغل في الخلفية (ليس مغلق تماماً).

---

## 📝 الخلاصة

| الحالة | بدون APNs | مع APNs |
|--------|-----------|---------|
| التطبيق مفتوح | ✅ يشتغل | ✅ يشتغل |
| التطبيق في الخلفية | ⚠️ أحياناً | ✅ يشتغل |
| التطبيق مغلق تماماً | ❌ ما يشتغل | ✅ يشتغل |

**الحل الوحيد للإشعارات عند إغلاق التطبيق = APNs** ✅

---

## 🚀 الخطوة التالية

1. **إذا عندك Apple Developer Account**:
   - اتبع الخطوات أعلاه لتفعيل APNs
   - **الوقت المتوقع**: 15-20 دقيقة

2. **إذا ما عندك**:
   - اشترك في Apple Developer Program ($99/سنة)
   - أو استخدم Local Notifications للاختبار فقط

---

## 📞 الدعم

إذا واجهت أي مشكلة:
1. شيك Firebase Console Logs
2. شيك Xcode Console عند تشغيل التطبيق
3. تأكد من Bundle ID مطابق في كل مكان

---

**تاريخ الإنشاء**: 10 ديسمبر 2025  
**الحالة**: يحتاج تفعيل APNs للعمل الكامل
