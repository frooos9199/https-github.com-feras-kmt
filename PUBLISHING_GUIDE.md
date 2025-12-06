# دليل نشر تطبيق KMT Marshal System

## 📋 قائمة التحقق قبل النشر

### 1️⃣ التحقق من الإعدادات الأساسية
- [x] تحديث رقم الإصدار في `package.json` → 1.0.0
- [x] تحديث رقم الإصدار في `android/app/build.gradle` → versionName "1.0.0", versionCode 1
- [x] تحديث اسم التطبيق المعروض → "KMT Marshal System"
- [ ] التحقق من أيقونة التطبيق في جميع الأحجام
- [ ] التحقق من شاشة البداية (Splash Screen)

### 2️⃣ الأيقونات المطلوبة

#### Android
يجب توفير أيقونات في المسار `android/app/src/main/res/`:
- `mipmap-mdpi/ic_launcher.png` (48x48)
- `mipmap-hdpi/ic_launcher.png` (72x72)
- `mipmap-xhdpi/ic_launcher.png` (96x96)
- `mipmap-xxhdpi/ic_launcher.png` (144x144)
- `mipmap-xxxhdpi/ic_launcher.png` (192x192)

#### iOS
يجب تحديث الأيقونات في `ios/kmtsysApp/Images.xcassets/AppIcon.appiconset/`:
- أحجام مختلفة من 20x20 إلى 1024x1024

### 3️⃣ تنظيف الكود

#### ملفات تم حذفها:
- [x] EditEventScreen.js.backup

#### ملفات للمراجعة:
- [ ] PlaceholderCardScreen.js (هل مستخدم؟)
- [ ] ErrorBoundary.js (التأكد من استخدامه في App.js)

### 4️⃣ اختبار شامل

#### الميزات الأساسية:
- [ ] تسجيل دخول/خروج
- [ ] عرض الأحداث
- [ ] التسجيل في الأحداث
- [ ] إلغاء التسجيل
- [ ] عرض الحضور الخاص
- [ ] الإشعارات (Push Notifications)

#### ميزات الأدمن:
- [ ] إضافة حدث جديد
- [ ] تعديل حدث
- [ ] حذف حدث
- [ ] إدارة المسجلين
- [ ] البث العام
- [ ] التقارير
- [ ] النسخ الاحتياطي

#### الاختبار على:
- [ ] Android (جهاز حقيقي)
- [ ] iOS (جهاز حقيقي)
- [ ] اتصال إنترنت ضعيف
- [ ] وضع عدم الاتصال

---

## 🤖 خطوات بناء Android

### الخطوة 1: تنظيف المشروع
```bash
cd android
./gradlew clean
cd ..
```

### الخطوة 2: إنشاء keystore للإنتاج (مرة واحدة فقط)
```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore kmtsys-release-key.keystore -alias kmtsys-key-alias -keyalg RSA -keysize 2048 -validity 10000
cd ../..
```

**احفظ معلومات الـ keystore في مكان آمن:**
- اسم الملف: `kmtsys-release-key.keystore`
- Password
- Alias: `kmtsys-key-alias`

### الخطوة 3: تكوين الـ signing
أنشئ ملف `android/gradle.properties` (إذا لم يكن موجوداً) وأضف:
```properties
MYAPP_RELEASE_STORE_FILE=kmtsys-release-key.keystore
MYAPP_RELEASE_KEY_ALIAS=kmtsys-key-alias
MYAPP_RELEASE_STORE_PASSWORD=***your-password***
MYAPP_RELEASE_KEY_PASSWORD=***your-password***
```

⚠️ **مهم:** لا ترفع هذا الملف إلى Git! أضفه إلى `.gitignore`

### الخطوة 4: تحديث build.gradle
في `android/app/build.gradle`، أضف في قسم `android`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### الخطوة 5: بناء APK
```bash
cd android
./gradlew assembleRelease
```

الملف الناتج: `android/app/build/outputs/apk/release/app-release.apk`

### الخطوة 6: بناء AAB (للنشر على Google Play)
```bash
cd android
./gradlew bundleRelease
```

الملف الناتج: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🍎 خطوات بناء iOS

### الخطوة 1: تثبيت المكتبات
```bash
cd ios
pod install
cd ..
```

### الخطوة 2: فتح المشروع في Xcode
```bash
open ios/kmtsysApp.xcworkspace
```

### الخطوة 3: في Xcode
1. اختر Target → kmtsysApp
2. في General tab:
   - تحديث Display Name → "KMT Marshal System"
   - تحديث Bundle Identifier (مثال: com.kmtsys.app)
   - تحديث Version → 1.0.0
   - تحديث Build → 1

3. في Signing & Capabilities:
   - اختر Team (حساب Apple Developer الخاص بك)
   - تفعيل Automatically manage signing

4. اختر Generic iOS Device أو جهاز حقيقي
5. Product → Archive
6. في Organizer، اختر الأرشيف → Distribute App
7. اتبع الخطوات لرفع إلى App Store Connect أو تصدير IPA

---

## 🚀 خطوات النشر

### Google Play Store

1. **إنشاء حساب Google Play Console**
   - سجل في https://play.google.com/console
   - ادفع رسوم التسجيل لمرة واحدة ($25)

2. **إنشاء تطبيق جديد**
   - اسم التطبيق: KMT Marshal System
   - اللغة الافتراضية: العربية أو الإنجليزية
   - نوع التطبيق: Application
   - مجاني أو مدفوع: مجاني

3. **ملء معلومات التطبيق**
   - الوصف القصير (80 حرف)
   - الوصف الكامل (4000 حرف)
   - لقطات الشاشة (على الأقل 2 لكل حجم)
   - أيقونة التطبيق عالية الدقة (512x512)
   - رسم توضيحي مميز (1024x500)

4. **رفع AAB**
   - في قسم Production → Create new release
   - رفع ملف `app-release.aab`
   - كتابة Release notes
   - Submit for review

### Apple App Store

1. **إنشاء حساب Apple Developer**
   - سجل في https://developer.apple.com
   - ادفع الاشتراك السنوي ($99/سنة)

2. **في App Store Connect**
   - أنشئ تطبيق جديد
   - Bundle ID: نفس الذي في Xcode
   - اسم التطبيق: KMT Marshal System

3. **ملء معلومات التطبيق**
   - الوصف
   - الكلمات المفتاحية
   - لقطات الشاشة (iPhone 6.7" و 5.5" على الأقل)
   - أيقونة التطبيق (1024x1024)

4. **رفع البناء**
   - استخدم Xcode Archive كما في الخطوات أعلاه
   - اختر البناء في App Store Connect
   - Submit for review

---

## 📱 معلومات إضافية

### وصف التطبيق (مقترح)

**العربية:**
```
نظام إدارة المارشالات الخاص بـ KMT - تطبيق شامل لإدارة الفعاليات والمارشالات.

الميزات الرئيسية:
✅ تسجيل وإدارة المارشالات
✅ جدول الفعاليات والتسجيل السريع
✅ إشعارات فورية للفعاليات الجديدة
✅ متابعة حضورك وسجلك
✅ لوحة تحكم شاملة للإدارة
✅ تقارير وإحصائيات تفصيلية
✅ نظام بث عام للإعلانات
✅ دعم اللغتين العربية والإنجليزية
```

**English:**
```
KMT Marshal Management System - A comprehensive app for managing events and marshals.

Key Features:
✅ Register and manage marshals
✅ Event calendar and quick registration
✅ Instant notifications for new events
✅ Track your attendance history
✅ Comprehensive admin dashboard
✅ Detailed reports and statistics
✅ Broadcast messaging system
✅ Arabic and English support
```

### الكلمات المفتاحية (Keywords)
```
marshal, event, management, KMT, attendance, tracking, admin, system
```

### التصنيف (Category)
- Google Play: Business / Productivity
- App Store: Business / Productivity

### الفئة العمرية
- 12+ (Everyone)

### الأذونات المطلوبة
- الإنترنت (للاتصال بالسيرفر)
- الإشعارات (لإرسال التنبيهات)
- التخزين (لحفظ الصور)
- الكاميرا (لرفع الصور الشخصية والرخصة)

---

## ✅ قائمة فحص نهائية

قبل إرسال التطبيق للمراجعة:

- [ ] اختبار شامل على أجهزة حقيقية
- [ ] التأكد من عمل جميع الميزات
- [ ] التأكد من اتصال API الصحيح (production URL)
- [ ] مراجعة جميع النصوص والترجمات
- [ ] التأكد من جودة الأيقونات ولقطات الشاشة
- [ ] كتابة Privacy Policy
- [ ] كتابة Terms of Service
- [ ] تجهيز Support URL أو Email

---

## 🔧 استكشاف الأخطاء

### مشكلة في Android Build
```bash
cd android
./gradlew clean
cd ..
rm -rf node_modules
npm install
cd android
./gradlew assembleRelease
```

### مشكلة في iOS Build
```bash
cd ios
rm -rf Pods
pod deintegrate
pod install
cd ..
```

### مشكلة في Metro Bundler
```bash
npx react-native start --reset-cache
```

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع الـ logs في `android/app/build/` أو Xcode
2. تأكد من تحديث جميع المكتبات
3. راجع التوثيق الرسمي لـ React Native
4. تواصل مع فريق التطوير

---

**آخر تحديث:** 4 ديسمبر 2025
**الإصدار:** 1.0.0
