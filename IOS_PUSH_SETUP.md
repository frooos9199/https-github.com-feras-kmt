# 🔔 iOS Push Notifications Setup

## المشكلة الحالية ❌
```
Error: [messaging/unknown] no valid "aps-environment" entitlement string found for application
```

هذي المشكلة تطلع لما تكون Push Notifications Capability **مو مفعلة** في Xcode project.

---

## ✅ الحل - خطوة بخطوة

### 1️⃣ افتح المشروع في Xcode
```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmtsysApp
open ios/kmtsysApp.xcworkspace
```

### 2️⃣ Enable Push Notifications Capability
1. اضغط على **kmtsysApp** في Project Navigator (الجهة اليسار)
2. تأكد إنك مختار **kmtsysApp** target (مو project)
3. روح لـ تاب **Signing & Capabilities**
4. اضغط على **+ Capability** (فوق على اليسار)
5. دور على **Push Notifications** واضغط عليه

![Push Notifications Capability](https://i.imgur.com/capability.png)

### 3️⃣ Enable Background Modes
في نفس الصفحة **Signing & Capabilities**:
1. اضغط **+ Capability** مرة ثانية
2. اختر **Background Modes**
3. فعّل هالخيارات:
   - ✅ **Background fetch**
   - ✅ **Remote notifications**

### 4️⃣ تأكد من Signing
في **Signing & Capabilities** تحت **Signing**:
- ✅ **Automatically manage signing** يكون مفعل
- اختر **Team** تحت التطوير
- تأكد **Bundle Identifier** نفس الـ Firebase project

---

## 🔍 تأكد من التفعيل

بعد ما تسوي الخطوات، افحص الملف هذا:
```bash
cat ios/kmtsysApp/kmtsysApp.entitlements
```

لازم يطلع فيه:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>aps-environment</key>
    <string>development</string>
</dict>
</plist>
```

---

## 🚀 Build & Run

بعد التفعيل:
```bash
cd ios
pod install
cd ..
npx react-native run-ios
```

---

## ✨ النتيجة المتوقعة

لما تشتغل التطبيق، لازم تشوف:
```
[APP] 🔔 Requesting notification permission...
[APP] ✅ Permission granted
[APP] 📱 Registering device for remote messages (iOS)...
[APP] ✅ Device registered
[APP] 🔑 Getting FCM token...
[APP] ✅ FCM Token obtained: c7x...
```

---

## 🔧 Troubleshooting

### لو الـ Capability مو موجودة في القائمة؟
- تأكد إن Apple Developer Account متصل
- روح **Xcode > Preferences > Accounts** وضيف حسابك

### لو طلع خطأ "No provisioning profiles found"؟
- اضغط **+ Capability** ثم **- Capability** لـ Push Notifications
- ضيفها مرة ثانية - راح يسوي provisioning profile جديد

### لو لسا الخطأ موجود؟
```bash
# نظف الـ build
cd ios
rm -rf build
xcodebuild clean
cd ..

# أعد تثبيت الـ pods
cd ios
pod deintegrate
pod install
cd ..

# أعد البناء
npx react-native run-ios
```

---

## 📝 ملاحظات مهمة

1. **Development vs Production**:
   - Development builds → `aps-environment: development`
   - App Store builds → `aps-environment: production`

2. **Bundle ID يطابق Firebase**:
   - Xcode Bundle ID لازم يكون نفس الـ Bundle ID في Firebase Console

3. **Apple Developer Program**:
   - Push Notifications تشتغل **بس** مع Apple Developer Account (مو مجاني)

4. **Simulator Limitations**:
   - iOS Simulator **لا يدعم** Push Notifications
   - لازم تختبر على **جهاز حقيقي**

---

## 🎯 الخلاصة

المشكلة مو في الكود - الكود صحيح ✅  
المشكلة في Xcode project configuration ❌

بمجرد ما تضيف Push Notifications Capability، راح يشتغل كل شي! 🚀
