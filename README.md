# 🏁 KMT Marshal Management System

نظام إدارة المارشالات لحلبة الكويت الدولية (Kuwait Motor Town)

## 📋 نظرة عامة

نظام شامل لإدارة المارشالات والفعاليات وتسجيل الحضور في حلبة الكويت الدولية. يدعم لغتين (العربية والإنجليزية) مع واجهة عصرية وسهلة الاستخدام.

## ✨ المميزات

### للمارشالات (Marshals)
- 📱 عرض الفعاليات القادمة والمتاحة
- ✅ تسجيل الحضور للفعاليات
- 📊 عرض سجل الحضور الشخصي
- 👤 تعديل الملف الشخصي والصورة
- 🔔 إشعارات فورية للفعاليات الجديدة
- 🌐 دعم اللغتين العربية والإنجليزية

### للمسؤولين (Admins)
- 👥 إدارة كاملة للمارشالات (إضافة، تعديل، حذف، تفعيل/تعطيل)
- 📅 إدارة الفعاليات (إنشاء، تعديل، حذف)
- 📋 متابعة الحضور والغياب لكل فعالية
- 🖨️ طباعة قوائم الحضور
- 📊 تقارير وإحصائيات شاملة
- 🔔 إشعارات تلقائية عند التسجيل أو الحضور

## 🛠️ التقنيات المستخدمة

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **UI**: React 19

## 🚀 التثبيت والتشغيل

### المتطلبات
- Node.js 18+
- npm, yarn, pnpm, or bun

### الخطوات

```bash
# 1. استنساخ المشروع
git clone https://github.com/your-username/kmt.git
cd kmt

# 2. تثبيت المكتبات
npm install

# 3. إعداد المتغيرات البيئية
cp .env.example .env

# 4. تطبيق قاعدة البيانات
npx prisma migrate dev

# 5. إضافة بيانات تجريبية (اختياري)
npx tsx prisma/seed.ts

# 6. تشغيل المشروع
npm run dev
```

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

### حسابات تجريبية

**Admin:**
- Email: admin@kmt.kw
- Password: admin123

**Marshal:**
- Email: marshal@kmt.kw
- Password: marshal123

## 📦 النشر

راجع [DEPLOYMENT.md](./DEPLOYMENT.md) للحصول على دليل شامل للنشر على:
- ✅ Vercel (مجاني وموصى به)
- ✅ Railway
- ✅ VPS/Server

### نشر سريع على Vercel

1. اربط المشروع بـ GitHub
2. اذهب إلى [vercel.com/new](https://vercel.com/new)
3. اختر المشروع وأضف المتغيرات البيئية
4. Deploy!

⚠️ **ملاحظة**: استخدم قاعدة بيانات خارجية (Turso/Neon/PlanetScale) بدلاً من SQLite للإنتاج.

## 🔧 الأوامر

```bash
npm run dev      # التطوير
npm run build    # البناء
npm start        # التشغيل

npx prisma studio        # Prisma Studio
npx prisma migrate dev   # تطبيق مايجريشن
npx tsx prisma/seed.ts   # بيانات تجريبية
```

## 📁 هيكل المشروع

```
kmt/
├── app/           # Next.js pages & API
├── components/    # React components
├── contexts/      # Context providers
├── lib/           # Utilities & helpers
├── prisma/        # Database schema
├── public/        # Static files
└── types/         # TypeScript types
```

## 🔐 الأمان

- 🔒 تشفير كلمات المرور (bcrypt)
- 🔑 JWT authentication (NextAuth)
- 🛡️ حماية المسارات حسب الصلاحيات
- ✅ التحقق من الإدخالات

## 🌐 دعم اللغات

- 🇸🇦 العربية
- 🇬🇧 الإنجليزية

## 📝 الترخيص

MIT License

---

**صنع بـ ❤️ في الكويت 🇰🇼**

