# 🔔 دليل اختبار Push Notifications

## 📋 خطوات الاختبار الكاملة

### 1️⃣ التحقق من حفظ FCM Tokens في Database

```bash
cd /Users/mac/Documents/GitHub/kmtmaster/https-github.com-feras-kmt
node check-fcm-tokens.js
```

**النتيجة المتوقعة:**
- يجب أن تشاهد المستخدمين الذين لديهم FCM Tokens
- إذا لم يكن هناك tokens، يجب تسجيل دخول من التطبيق أولاً

---

### 2️⃣ تشغيل التطبيق وتسجيل الدخول

1. افتح Xcode:
```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmt/ios
open kmtsysApp.xcworkspace
```

2. اختر iPhone 16 كـ Device
3. اضغط Run (▶️)
4. **راقب Console** وابحث عن:
```
[APP] ✅ FCM Token obtained: YES
[APP] 📝 Token (first 30 chars): ...
[APP] 💾 FCM Token save result: SUCCESS ✅
```

5. **انسخ الـ FCM Token** من Console (سيكون طويل ~150-200 حرف)

---

### 3️⃣ اختبار Push Notification مباشرة

```bash
cd /Users/mac/Documents/GitHub/kmtmaster/https-github.com-feras-kmt
node test-push-notification.js "FCM_TOKEN_HERE"
```

**مثال:**
```bash
node test-push-notification.js "dPZq8f9rT0y..."
```

**النتيجة المتوقعة:**
- ✅ SUCCESS!
- يجب أن تظهر notification على الجهاز فوراً!

---

### 4️⃣ اختبار Broadcast من Dashboard

1. افتح Dashboard Admin:
```
https://www.kmtsys.com/login
```

2. اذهب إلى **Admin > Broadcast**
3. اكتب رسالة جديدة
4. اختر Recipients: "All Marshals"
5. تأكد من تفعيل: ✅ **Send Push Notification**
6. اضغط **Send Broadcast**

**النتيجة المتوقعة:**
- يجب أن تصل النتفكيشن فوراً على الجهاز
- حتى لو التطبيق **مغلق تماماً**!

---

### 5️⃣ اختبار الحالات المختلفة

#### أ) التطبيق في المقدمة (Foreground):
- افتح التطبيق
- أرسل broadcast
- **النتيجة:** نتفكيشن تظهر داخل التطبيق

#### ب) التطبيق في الخلفية (Background):
- افتح التطبيق ثم اضغط Home
- أرسل broadcast
- **النتيجة:** نتفكيشن تظهر في notification center

#### ج) التطبيق مغلق تماماً (Killed):
- أغلق التطبيق من App Switcher
- أرسل broadcast
- **النتيجة:** نتفكيشن تظهر في notification center

---

## 🔍 تشخيص المشاكل

### المشكلة: "No FCM tokens found"

**الحل:**
1. تأكد من تسجيل دخول من التطبيق
2. تحقق من Console logs:
   - `[APP] 💾 FCM Token save result: SUCCESS ✅`
3. شغل `node check-fcm-tokens.js` للتأكد

---

### المشكلة: "JWT verification failed"

**الحل:**
1. تحقق من `.env.local`:
   ```bash
   grep NEXTAUTH_SECRET .env.local
   ```
2. تأكد من وجود القيمة
3. أعد تشغيل Vercel deployment

---

### المشكلة: "APNs error: InvalidProviderToken"

**الحل:**
1. تحقق من Firebase Console > Project Settings > Cloud Messaging
2. تأكد من رفع APNs Authentication Key
3. تأكد من Team ID صحيح

---

## 📊 Vercel Logs للتحقق

1. افتح Vercel Dashboard:
```
https://vercel.com/frooos9199/https-github-com-feras-kmt
```

2. اذهب إلى **Logs**
3. ابحث عن:
   - `[FCM-TOKEN]` - للتحقق من حفظ الـ tokens
   - `[BROADCAST]` - للتحقق من إرسال الـ push notifications
   - `[FCM] ✅ Success` - نجاح الإرسال

---

## ✅ Checklist للنجاح

- [ ] FCM Token محفوظ في Database (✅ في check-fcm-tokens.js)
- [ ] Test script يعمل ويرسل نتفكيشن (✅ في test-push-notification.js)
- [ ] Broadcast من Dashboard يصل للجهاز
- [ ] النتفكيشن تصل والتطبيق في Foreground
- [ ] النتفكيشن تصل والتطبيق في Background
- [ ] النتفكيشن تصل والتطبيق مغلق تماماً ✨

---

## 🎯 الهدف النهائي

**يجب أن تصل النتفكيشن في جميع الحالات:**
- ✅ التطبيق مفتوح
- ✅ التطبيق في الخلفية
- ✅ **التطبيق مغلق تماماً (هذا الأهم!)**

---

## 📞 للدعم

إذا واجهت أي مشكلة، شارك:
1. Console logs من Xcode
2. Vercel logs من Dashboard
3. نتيجة `node check-fcm-tokens.js`
