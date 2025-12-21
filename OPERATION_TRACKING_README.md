# نظام تتبع العمليات متعدد اللغات / Multi-Language Operation Tracking System

## نظرة عامة / Overview

نظام تتبع العمليات في تطبيق KMT Marshal System يدعم اللغتين العربية والإنجليزية، ويتغير تلقائياً حسب اللغة المختارة في الموقع.

## كيفية العمل / How It Works

### 1. قاموس الترجمة / Translation Dictionary
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
  // ... المزيد من العمليات
}
```

### 2. دالة الترجمة / Translation Function
```typescript
export function getOperationTranslation(operation: string, language?: 'en' | 'ar'): string {
  const lang = language || getCurrentLanguage(); // تستخدم اللغة المحفوظة في الموقع
  const translation = operationTranslations[operation];
  return translation ? translation[lang] : operation;
}
```

### 3. Hook مخصص للمكونات / Custom Hook for Components
```typescript
export function useOperationTranslation() {
  const { language } = useLanguage();

  const translateOperation = (operation: string) => {
    return getOperationTranslation(operation, language);
  };

  return translateOperation;
}
```

## الاستخدام في المكونات / Usage in Components

### الطريقة المباشرة / Direct Usage
```tsx
import { getOperationTranslation } from "@/lib/monitoring";

const operationName = getOperationTranslation('user_login', 'ar'); // "تسجيل دخول مستخدم"
```

### استخدام الـ Hook / Using the Hook
```tsx
import { useOperationTranslation } from "@/lib/useOperationTranslation";

function MyComponent() {
  const translateOperation = useOperationTranslation();

  return (
    <div>
      {translateOperation('user_login')} {/* يتغير حسب اللغة المختارة */}
    </div>
  );
}
```

## العمليات المدعومة / Supported Operations

| العملية / Operation | الإنجليزية / English | العربية / Arabic |
|-------------------|---------------------|------------------|
| notification_send | Send Notification | إرسال إشعار |
| user_login | User Login | تسجيل دخول مستخدم |
| user_logout | User Logout | تسجيل خروج مستخدم |
| user_signup | User Registration | تسجيل مستخدم جديد |
| event_create | Create Event | إنشاء حدث |
| event_update | Update Event | تحديث حدث |
| attendance_register | Register Attendance | تسجيل حضور |
| email_send | Send Email | إرسال بريد إلكتروني |
| broadcast_send | Send Broadcast | إرسال إذاعة |

## اللغة الافتراضية / Default Language

- **الافتراضي**: العربية (`ar`)
- **يتم حفظ اختيار المستخدم**: في `localStorage`
- **يتغير تلقائياً**: عند تغيير اللغة في الموقع

## إضافة عمليات جديدة / Adding New Operations

1. أضف الترجمة في `operationTranslations` في `lib/monitoring.ts`
2. استخدم `getOperationTranslation()` أو `useOperationTranslation()` في المكونات

```typescript
// مثال / Example
'new_operation': {
  en: 'New Operation',
  ar: 'عملية جديدة'
}
```</content>
<parameter name="filePath">/Users/mac/Documents/GitHub/kmtmaster/https-github.com-feras-kmt/OPERATION_TRACKING_README.md