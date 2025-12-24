# ✅ تم تحديث Version إلى 2.7.0

## ما تم تعديله:

### 1. ✅ package.json
```json
"version": "2.7.0"
```

### 2. ✅ iOS (project.pbxproj)
```plaintext
MARKETING_VERSION = 2.7.0;
```

### 3. ⚠️ Android - غير متوفر حالياً (iOS only project)

---

## 🔧 الخطوات المتبقية (iOS):

### افتح Xcode:
```bash
open ios/kmtsysApp.xcworkspace
```

### في Xcode:
1. اختر المشروع `kmtsysApp` من القائمة اليسرى
2. اختر Target: `kmtsysApp`
3. في تبويب **General**:
   - **Version:** غيّره إلى `2.7`
   - **Build:** غيّره إلى رقم جديد

### بديل سريع:
إذا ما تبي تفتح Xcode، عدّل Version في **App Store Connect** فقط:
- App Information → Version Number: `2.7`
- ارفع Build جديد

---

## 📱 بعدها سوّي Archive:

```
Product → Archive
```

---

## ✅ التعديلات المطبقة على الكود:

### ProfileScreen.js:
- ❌ حذف: Civil ID
- ❌ حذف: Nationality
- ❌ حذف: Date of Birth
- ❌ حذف: Civil ID Images
- ❌ حذف: License Images

### SignupScreen.js:
- ✅ Civil ID → Optional
- ✅ Nationality → Optional
- ✅ Date of Birth → Optional

---

**جاهز للـ Archive الآن!** 🚀
