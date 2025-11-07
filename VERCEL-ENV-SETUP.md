# Vercel Environment Variables Setup

## ⚠️ مهم جداً: متغيرات البيئة المطلوبة

لحل مشكلة رفع الصور، يجب إضافة هذه المتغيرات في Vercel:

### الخطوات:

1. **اذهب إلى:** https://vercel.com/dashboard
2. **افتح المشروع:** kmt-theta أو https-github-com-feras-kmt
3. **اذهب إلى:** Settings → Environment Variables
4. **أضف هذه المتغيرات:**

---

## المتغيرات المطلوبة:

### 1. Cloudinary Configuration (للصور)
```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dghmld0c3
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=kmt_profiles
```

### 2. Database (موجود بالفعل - تأكد فقط)
```
DATABASE_URL=postgresql://...your-neon-connection-string...
```

### 3. NextAuth (موجود بالفعل - تأكد فقط)
```
NEXTAUTH_SECRET=kmt-marshal-system-secret-key-2025
NEXTAUTH_URL=https://kmt-theta.vercel.app
```

---

## ملاحظات:
- ✅ المتغيرات اللي تبدأ بـ `NEXT_PUBLIC_` تكون متاحة في Browser
- ✅ بعد إضافة المتغيرات، لازم تعمل Redeploy للمشروع
- ✅ قاعدة البيانات على Neon محفوظة ومو تنمسح
- ✅ الأرقام الوظيفية تبدأ من KMT-100 تلقائياً

---

## التحقق من المتغيرات الموجودة:

في لوحة Vercel → Project → Settings → Environment Variables

يجب تشوف:
- ✅ DATABASE_URL
- ✅ NEXTAUTH_SECRET
- ✅ NEXTAUTH_URL
- ❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME (أضفها!)
- ❌ NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET (أضفها!)

---

## بعد إضافة المتغيرات:

1. اذهب إلى Deployments
2. اختار آخر Deployment
3. اضغط على ... (ثلاث نقاط)
4. اضغط "Redeploy"
5. ✅ تم! الصور راح تشتغل
