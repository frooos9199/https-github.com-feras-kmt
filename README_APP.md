# 📱 KMT Marshal System - تطبيق الجوال

تطبيق React Native لإدارة المارشالات والفعاليات لنظام KMT.

## 📋 المحتويات

- [الميزات](#الميزات)
- [المتطلبات](#المتطلبات)
- [التثبيت](#التثبيت)
- [التشغيل](#التشغيل)
- [البناء للإنتاج](#البناء-للإنتاج)
- [الهيكل](#الهيكل)
- [المكتبات المستخدمة](#المكتبات-المستخدمة)
- [الإعدادات](#الإعدادات)
- [النشر](#النشر)

---

## ✨ الميزات

### للمارشالات (Users):
- ✅ تسجيل حساب جديد مع رفع الصور
- ✅ تسجيل دخول آمن
- ✅ عرض جميع الفعاليات القادمة
- ✅ التسجيل السريع في الفعاليات
- ✅ إلغاء التسجيل
- ✅ عرض سجل الحضور الشخصي
- ✅ استلام إشعارات فورية عن الفعاليات الجديدة
- ✅ تعديل الملف الشخصي
- ✅ دعم اللغتين العربية والإنجليزية

### للإدارة (Admins):
- ✅ جميع ميزات المارشال
- ✅ إضافة فعاليات جديدة
- ✅ تعديل وحذف الفعاليات
- ✅ إدارة تسجيلات المارشالات (موافقة/رفض)
- ✅ عرض قائمة جميع المارشالات
- ✅ تعديل حالة المارشالات (نشط/غير نشط)
- ✅ إرسال رسائل بث عامة
- ✅ عرض التقارير والإحصائيات
- ✅ النسخ الاحتياطي للبيانات
- ✅ تصدير البيانات

---

## 📦 المتطلبات

- **Node.js**: >= 18.0.0
- **npm** أو **yarn**
- **React Native CLI**: `npm install -g react-native-cli`
- **Xcode**: >= 14.0 (للـ iOS)
- **Android Studio**: >= 2023 (للـ Android)
- **CocoaPods**: >= 1.11 (للـ iOS)
- **JDK**: >= 17 (للـ Android)

---

## 🚀 التثبيت

### 1. استنساخ المشروع
```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmtsysApp
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. تثبيت iOS Pods
```bash
cd ios
pod install
cd ..
```

### 4. إعداد Firebase
- ضع ملف `google-services.json` في `android/app/`
- ضع ملف `GoogleService-Info.plist` في `ios/`

### 5. إعداد المتغيرات البيئية (اختياري)
أنشئ ملف `.env` في المجلد الرئيسي:
```env
API_URL=https://www.kmtsys.com/api
APP_NAME=KMT Marshal System
```

---

## 🏃 التشغيل

### تشغيل Metro Bundler
```bash
npm start
# أو
npx react-native start
```

### Android
```bash
npm run android
# أو
npx react-native run-android
```

### iOS
```bash
npm run ios
# أو
npx react-native run-ios
```

### تنظيف الكاش
```bash
npx react-native start --reset-cache
```

---

## 🏗️ البناء للإنتاج

### Android

#### بناء APK (للتوزيع المباشر)
```bash
./build-android.sh
# ثم اختر 1 لـ APK
```

أو يدوياً:
```bash
cd android
./gradlew assembleRelease
```

الملف الناتج: `android/app/build/outputs/apk/release/app-release.apk`

#### بناء AAB (للنشر على Google Play)
```bash
./build-android.sh
# ثم اختر 2 لـ AAB
```

أو يدوياً:
```bash
cd android
./gradlew bundleRelease
```

الملف الناتج: `android/app/build/outputs/bundle/release/app-release.aab`

### iOS

1. افتح المشروع في Xcode:
```bash
open ios/kmtsysApp.xcworkspace
```

2. اختر Generic iOS Device
3. Product → Archive
4. Distribute App → App Store Connect

---

## 📁 الهيكل

```
kmtsysApp/
├── android/                 # ملفات Android Native
├── ios/                     # ملفات iOS Native
├── assets/                  # الصور والموارد
├── components/              # المكونات القابلة لإعادة الاستخدام
│   ├── EventCard.js        # كرت الحدث
│   └── ...
├── locales/                 # ملفات الترجمة
│   ├── en.json
│   └── ar.json
├── screens/                 # الشاشات (كلها في المجلد الرئيسي حالياً)
│   ├── LoginScreen.js
│   ├── SignupScreen.js
│   ├── HomeScreen.js
│   ├── EventsScreen.js
│   ├── EventDetailsScreen.js
│   ├── ProfileScreen.js
│   ├── NotificationsScreen.js
│   └── ...
├── App.js                   # نقطة الدخول الرئيسية
├── MainTabNavigator.js      # التنقل الرئيسي
├── apiConfig.js             # إعدادات API
├── authUtils.js             # وظائف المصادقة
├── fcmApi.js                # API الإشعارات
├── FCMService.js            # خدمة Firebase
├── i18n.js                  # إعدادات الترجمة
├── UserContext.js           # Context للمستخدم
└── package.json             # المكتبات والإعدادات
```

---

## 📚 المكتبات المستخدمة

### الأساسية:
- **React**: 19.1.1
- **React Native**: 0.82.1
- **React Navigation**: للتنقل بين الشاشات
  - @react-navigation/native
  - @react-navigation/stack
  - @react-navigation/bottom-tabs

### UI/UX:
- **react-native-vector-icons**: الأيقونات
- **react-native-linear-gradient**: الخلفيات المتدرجة
- **react-native-gesture-handler**: التفاعلات

### الوظائف:
- **@react-native-async-storage/async-storage**: التخزين المحلي
- **@react-native-firebase/app**: Firebase Core
- **@react-native-firebase/messaging**: الإشعارات
- **jsonwebtoken**: JWT للمصادقة
- **react-native-webview**: عرض صفحات الويب
- **@react-native-community/datetimepicker**: اختيار التاريخ

### الترجمة:
- **i18n-js**: دعم اللغات المتعددة

---

## ⚙️ الإعدادات

### API URL
عدّل `apiConfig.js`:
```javascript
export const API_BASE_URL = 'https://www.kmtsys.com/api';
```

### Firebase
- Android: `android/app/google-services.json`
- iOS: `ios/GoogleService-Info.plist`

### الألوان والتصميم
الألوان الرئيسية في التطبيق:
- Primary: `#FF6B35` (برتقالي)
- Secondary: `#004E89` (أزرق)
- Success: `#2ECC71` (أخضر)
- Danger: `#E74C3C` (أحمر)
- Warning: `#F39C12` (أصفر)

---

## 🚀 النشر

### الإعداد للنشر

1. **راجع قائمة الفحص**:
```bash
./verify-app.sh
```

2. **راجع الأدلة**:
- [دليل النشر](PUBLISHING_GUIDE.md)
- [قائمة الفحص قبل الإطلاق](PRE_LAUNCH_CHECKLIST.md)

### Google Play Store

1. أنشئ حساب Google Play Console
2. املأ معلومات التطبيق والوصف
3. ارفع AAB
4. قدّم للمراجعة

### Apple App Store

1. أنشئ حساب Apple Developer
2. أنشئ التطبيق في App Store Connect
3. ارفع البناء عبر Xcode
4. قدّم للمراجعة

---

## 🐛 استكشاف الأخطاء

### مشكلة في Android Build
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
```

### مشكلة في iOS Build
```bash
cd ios
rm -rf Pods
pod deintegrate
pod install
cd ..
```

### مشكلة في Metro
```bash
npx react-native start --reset-cache
```

### أخطاء Firebase
- تأكد من وجود `google-services.json` و `GoogleService-Info.plist`
- تحقق من صحة Package Name/Bundle ID

---

## 📞 الدعم

للمساعدة أو الاستفسارات:
- Email: support@kmtsys.com
- Website: https://www.kmtsys.com

---

## 📄 الترخيص

جميع الحقوق محفوظة © 2025 KMT System

---

## 🔄 الإصدارات

### الإصدار 1.0.0 (الحالي)
- ✅ إطلاق أولي
- ✅ جميع الميزات الأساسية
- ✅ دعم Android و iOS
- ✅ دعم اللغتين العربية والإنجليزية

---

**آخر تحديث**: 4 ديسمبر 2025
