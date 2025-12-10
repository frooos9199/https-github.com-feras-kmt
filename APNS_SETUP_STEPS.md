# 🔑 APNs Setup - خطوات سريعة

## ✅ الخطوة 1: إنشاء APNs Key من Apple

1. **روح**: https://developer.apple.com/account
2. **اضغط**: Certificates, Identifiers & Profiles
3. **اختر**: Keys من القائمة اليسرى
4. **اضغط**: زر + (أعلى يمين)
5. **اكتب**: اسم المفتاح (مثال: KMT Push Key)
6. **فعّل**: ☑️ Apple Push Notifications service (APNs)
7. **اضغط**: Continue → Register
8. **Download**: اضغط Download لتحميل ملف `.p8`
9. **احفظ**:
   - Key ID (مثال: `ABC123XYZ4`)
   - Team ID (من Account → Membership)
   - الملف `.p8` في مكان آمن

⚠️ **تنبيه**: الملف `.p8` يُحمّل مرة واحدة فقط!

---

## ✅ الخطوة 2: رفع المفتاح إلى Firebase

1. **روح**: https://console.firebase.google.com
2. **اختر**: مشروعك (KMT)
3. **اضغط**: ⚙️ Project Settings (أعلى يسار)
4. **اختر**: Cloud Messaging tab
5. **في**: Apple app configuration
6. **اضغط**: Upload تحت "APNs Authentication Key"
7. **ارفع**: الملف `.p8`
8. **أدخل**:
   - Key ID: (من الخطوة 1)
   - Team ID: (من الخطوة 1)
9. **اضغط**: Upload

✅ تم! Firebase الآن يقدر يرسل إشعارات لـ iOS!

---

## ✅ الخطوة 3: تحديث Entitlements

```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmt
```

عدّل `ios/kmtsysApp/kmtsysApp.entitlements`:

```xml
<key>aps-environment</key>
<string>production</string>  <!-- غيرها من development -->
```

---

## ✅ الخطوة 4: إعادة البناء

```bash
cd ios
rm -rf Pods DerivedData build
pod install
cd ..

# بناء Release build
npx react-native run-ios --configuration Release --device
```

---

## 🧪 الاختبار

1. **شغل التطبيق** على جهاز حقيقي
2. **سجل دخول**
3. **أغلق التطبيق تماماً** (swipe up)
4. **أرسل إشعار** من Dashboard
5. **يجب أن يظهر** على شاشة القفل! 🎉

---

## 🔍 التحقق

في Xcode Console:

```
[APP] ✅ FCM Token obtained: YES
[APP] ✅ Permission granted
[APP] ✅ Device registered
```

في Firebase Console:
- Cloud Messaging → Apple apps
- يجب أن تشوف "APNs certificate uploaded" ✅

---

## ⏱️ الوقت المتوقع

- إنشاء APNs Key: **5 دقائق**
- رفع إلى Firebase: **3 دقائق**
- تحديث الكود: **2 دقيقة**
- إعادة البناء: **5-10 دقائق**

**المجموع: ~20 دقيقة** ⏱️

---

## 💡 نصائح

✅ **افعل**:
- احفظ ملف `.p8` في مكان آمن
- استخدم نفس Key ID و Team ID
- تأكد من Bundle ID مطابق في كل مكان

❌ **لا تفعل**:
- لا تشارك ملف `.p8` مع أحد
- لا تحذف المفتاح من Apple Developer
- لا تغير Bundle ID بعد الرفع

---

**بعد هذه الخطوات، الإشعارات ستشتغل 100%!** 🚀
