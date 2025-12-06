# 📱 دليل التصميم المتجاوب - KMT App

## 🎯 الهدف
ضمان أن التطبيق يعمل بشكل مثالي على جميع أحجام الأجهزة مع الحفاظ على نفس النسب والتصميم.

## 📐 الجهاز المرجعي
**iPhone 17** - 430 × 932 pixels

جميع التصميمات والأحجام مبنية على هذا الجهاز، ويتم تحجيمها تلقائياً للأجهزة الأخرى.

---

## ⚙️ كيفية الاستخدام

### 1. استيراد الإعدادات

```javascript
import { 
  COLORS, 
  FONT_SIZES, 
  SPACING, 
  ICON_SIZES,
  scaleFont,
  scaleWidth,
  scaleHeight 
} from './appConfig';
```

### 2. استخدام الألوان

```javascript
const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary, // #b71c1c
  },
  text: {
    color: COLORS.white,
  },
  card: {
    backgroundColor: COLORS.cardBg,
  },
});
```

### 3. استخدام أحجام الخطوط

```javascript
const styles = StyleSheet.create({
  title: {
    fontSize: FONT_SIZES.huge, // 24 (متحجم حسب الجهاز)
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONT_SIZES.large, // 16
  },
  body: {
    fontSize: FONT_SIZES.regular, // 14
  },
});
```

### 4. استخدام المسافات

```javascript
const styles = StyleSheet.create({
  container: {
    padding: SPACING.large, // 16 (متحجم)
    marginBottom: SPACING.medium, // 12
  },
  gap: {
    gap: SPACING.small, // 8
  },
});
```

### 5. استخدام أحجام الأيقونات

```javascript
<Ionicons 
  name="home" 
  size={ICON_SIZES.medium} // 28 (متحجم)
  color={COLORS.white} 
/>
```

### 6. التحجيم اليدوي

إذا احتجت تحجيم قيمة معينة:

```javascript
import { scaleFont, scaleWidth, scaleHeight } from './appConfig';

const styles = StyleSheet.create({
  customText: {
    fontSize: scaleFont(20), // يتحجم حسب عرض الشاشة
  },
  customWidth: {
    width: scaleWidth(300), // يتحجم حسب عرض الشاشة
  },
  customHeight: {
    height: scaleHeight(200), // يتحجم حسب ارتفاع الشاشة
  },
});
```

---

## 🎨 الألوان المتاحة

### الألوان الأساسية
- `COLORS.primary` - #b71c1c (أحمر KMT)
- `COLORS.secondary` - #dc2626
- `COLORS.black` - #000
- `COLORS.white` - #fff

### ألوان الحالة
- `COLORS.success` - #22c55e (أخضر)
- `COLORS.warning` - #f59e0b (برتقالي)
- `COLORS.danger` - #dc2626 (أحمر)
- `COLORS.info` - #3b82f6 (أزرق)

### ألوان الأكسنت
- `COLORS.gold` - #fbbf24 (ذهبي)

### ألوان الخلفية
- `COLORS.cardBg` - rgba(0, 0, 0, 0.7)
- `COLORS.overlayBg` - rgba(0, 0, 0, 0.5)

---

## 📏 أحجام الخطوط

| الحجم | القيمة الأصلية | الاستخدام |
|-------|---------------|-----------|
| `tiny` | 11 | نصوص صغيرة جداً |
| `small` | 13 | تفاصيل ثانوية |
| `regular` | 14 | نصوص عادية |
| `medium` | 15 | عناوين صغيرة |
| `large` | 16 | عناوين متوسطة |
| `xlarge` | 18 | عناوين رئيسية |
| `xxlarge` | 20 | عناوين كبيرة |
| `huge` | 24 | عناوين ضخمة |
| `massive` | 28 | أسماء المستخدمين |
| `giant` | 32 | عناوين رئيسية جداً |

---

## 📐 المسافات

| الحجم | القيمة الأصلية | الاستخدام |
|-------|---------------|-----------|
| `tiny` | 4 | مسافة صغيرة جداً |
| `small` | 8 | مسافة صغيرة |
| `medium` | 12 | مسافة متوسطة |
| `large` | 16 | مسافة كبيرة |
| `xlarge` | 20 | مسافة كبيرة جداً |
| `xxlarge` | 24 | مسافة ضخمة |
| `huge` | 32 | مسافة عملاقة |

---

## 🔍 أحجام الأيقونات

| الحجم | القيمة | الاستخدام |
|-------|--------|-----------|
| `tiny` | 16 | أيقونات صغيرة جداً |
| `small` | 20 | أيقونات صغيرة |
| `regular` | 24 | أيقونات عادية |
| `medium` | 28 | أيقونات متوسطة |
| `large` | 32 | أيقونات كبيرة |
| `xlarge` | 40 | أيقونات ضخمة |

---

## ✅ أفضل الممارسات

### ✅ افعل:
```javascript
// استخدم الثوابت المعرفة
fontSize: FONT_SIZES.large,
padding: SPACING.medium,

// استخدم دوال التحجيم للقيم المخصصة
width: scaleWidth(350),
```

### ❌ لا تفعل:
```javascript
// لا تستخدم أرقام ثابتة مباشرة
fontSize: 18,
padding: 16,
width: 350,
```

---

## 🔧 أمثلة عملية

### مثال 1: كرت بسيط

```javascript
import { StyleSheet } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from './appConfig';

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.large,
    padding: SPACING.large,
    marginBottom: SPACING.medium,
    ...SHADOWS.medium,
  },
  title: {
    fontSize: FONT_SIZES.xlarge,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.small,
  },
  description: {
    fontSize: FONT_SIZES.regular,
    color: COLORS.offWhite,
  },
});
```

### مثال 2: زر مخصص

```javascript
import { COLORS, SPACING, FONT_SIZES, ICON_SIZES } from './appConfig';

<TouchableOpacity style={styles.button}>
  <Ionicons name="add" size={ICON_SIZES.regular} color={COLORS.white} />
  <Text style={styles.buttonText}>إضافة حدث</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.medium,
    borderRadius: BORDER_RADIUS.medium,
    gap: SPACING.small,
  },
  buttonText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '600',
    color: COLORS.white,
  },
});
```

---

## 📱 الأجهزة المدعومة

التطبيق متوافق تلقائياً مع:

- ✅ iPhone SE (375 × 667)
- ✅ iPhone 13/14/15 (390 × 844)
- ✅ iPhone 13/14/15 Pro Max (430 × 932)
- ✅ iPhone 17 (430 × 932) - **المرجع**
- ✅ Android (جميع الأحجام)

---

## 🎯 خلاصة

استخدم دائماً:
1. **COLORS** للألوان
2. **FONT_SIZES** لأحجام الخطوط
3. **SPACING** للمسافات
4. **ICON_SIZES** للأيقونات
5. **scaleWidth/scaleHeight** للقيم المخصصة

هذا يضمن:
- ✅ تصميم متجاوب على جميع الأجهزة
- ✅ سهولة الصيانة
- ✅ توحيد التصميم
- ✅ تجربة مستخدم ممتازة

---

**آخر تحديث**: 4 ديسمبر 2025
