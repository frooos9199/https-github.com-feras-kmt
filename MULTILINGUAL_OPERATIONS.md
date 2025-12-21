# تتبع العمليات متعدد اللغات

## المشكلة
كان تتبع العمليات في لوحة المراقبة يعرض أسماء العمليات بالإنجليزية فقط، مما يجعلها غير مفهومة للمستخدمين العرب.

## الحل المطبق

### 1. قاموس الترجمة
تم إنشاء قاموس شامل لترجمة أسماء العمليات في `lib/monitoring.ts`:

```typescript
const operationTranslations = {
  'notification_send': {
    en: 'Send Notification',
    ar: 'إرسال إشعار'
  },
  'user_login': {
    en: 'User Login',
    ar: 'تسجيل دخول مستخدم'
  },
  // ... المزيد من الترجمات
}
```

### 2. دالة الترجمة الديناميكية
```typescript
export function getOperationTranslation(operation: string, language: 'en' | 'ar' = 'ar'): string {
  const translation = operationTranslations[operation as keyof typeof operationTranslations];
  if (translation) {
    return translation[language];
  }
  // إذا لم توجد ترجمة، أعد العملية كما هي
  return operation;
}
```

### 3. تحديث لوحة المراقبة
تم تحديث `app/admin/monitoring/page.tsx` لاستخدام الترجمة حسب لغة الموقع:

```tsx
<td className="px-6 py-4 whitespace-nowrap text-sm text-white">
  {getOperationTranslation(operation.operation, language === 'ar' ? 'ar' : 'en')}
</td>
```

## العمليات المدعومة

| المفتاح | الإنجليزية | العربية |
|---------|------------|---------|
| `notification_send` | Send Notification | إرسال إشعار |
| `user_login` | User Login | تسجيل دخول مستخدم |
| `user_signup` | User Registration | تسجيل مستخدم جديد |
| `event_create` | Create Event | إنشاء حدث |
| `attendance_register` | Register Attendance | تسجيل حضور |
| `broadcast_send` | Send Broadcast | إرسال إذاعة |
| وغيرها... | | |

## كيفية إضافة ترجمات جديدة

لإضافة ترجمة لعملية جديدة:

1. أضف الإدخال في `operationTranslations` في `lib/monitoring.ts`
2. استخدم المفتاح المناسب (يفضل بالإنجليزية مع underscores)
3. أضف الترجمة لكل من الإنجليزية والعربية

## الاستخدام

```typescript
import { getOperationTranslation } from '@/lib/monitoring';

// في المكون
const operationName = getOperationTranslation('notification_send', language);
```

## الملفات المُحدّثة

- `lib/monitoring.ts`: إضافة قاموس الترجمة ودالة الترجمة
- `app/admin/monitoring/page.tsx`: تحديث عرض العمليات لاستخدام الترجمة

## الاختبار

للتحقق من الميزة:
1. سجل دخولاً إلى لوحة الإدارة
2. اذهب إلى `/admin/monitoring`
3. شاهد تبويب "العمليات"
4. لاحظ أن أسماء العمليات تظهر بالعربية
5. غير لغة الموقع ولاحظ التغيير

## المميزات

- ✅ دعم كامل للعربية والإنجليزية
- ✅ ترجمة تلقائية حسب إعدادات الموقع
- ✅ سهولة إضافة ترجمات جديدة
- ✅ لا يؤثر على أداء النظام
- ✅ يدعم العمليات المستقبلية