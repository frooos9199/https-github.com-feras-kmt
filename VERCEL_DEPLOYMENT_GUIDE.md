# 🚀 دليل نشر KMT System على Vercel

## 📋 نظرة عامة

هذا الدليل يوضح خطوات نشر نظام KMT Marshal Management على Vercel مع قاعدة بيانات Neon PostgreSQL.

**الإصدار**: 1.0.0  
**آخر تحديث**: 4 ديسمبر 2025

---

## ✅ المتطلبات الأساسية

### 1. الحسابات المطلوبة
- [ ] حساب GitHub (لربط المشروع)
- [ ] حساب Vercel (https://vercel.com)
- [ ] حساب Neon (https://neon.tech) - قاعدة البيانات
- [ ] حساب Resend (https://resend.com) - للبريد الإلكتروني
- [ ] حساب Cloudinary (https://cloudinary.com) - لتخزين الصور

### 2. الأدوات المحلية
- Node.js 20+
- npm أو yarn
- Git

---

## 🗄️ الخطوة 1: إعداد قاعدة البيانات (Neon)

### 1.1 إنشاء مشروع جديد في Neon

1. اذهب إلى https://neon.tech
2. سجل دخول أو أنشئ حساب جديد
3. انقر "Create Project"
4. اختر:
   - **Name**: KMT System
   - **Region**: أقرب منطقة لجمهورك (مثلاً: AWS / EU Central)
   - **Postgres version**: 16 (الأحدث)

### 1.2 الحصول على Connection String

بعد إنشاء المشروع:
1. انسخ **Connection String**
2. سيكون بهذا الشكل:
   ```
   postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   ```
3. احفظه في مكان آمن (ستحتاجه لاحقاً)

### 1.3 تطبيق Schema على قاعدة البيانات

**الخيار A - من ملف SQL**:
```bash
# استخدم SQL Editor في Neon Dashboard
# انسخ محتوى prisma/migrations أو neon-setup.sql
```

**الخيار B - من Prisma** (مفضل):
```bash
# في المشروع المحلي
DATABASE_URL="your-neon-connection-string" npx prisma db push
```

---

## 🌐 الخطوة 2: نشر على Vercel

### 2.1 ربط المشروع مع Vercel

**من Vercel Dashboard**:
1. اذهب إلى https://vercel.com/new
2. اختر "Import Git Repository"
3. اختر repository الخاص بك
4. Vercel سيكتشف Next.js تلقائياً

**أو من CLI**:
```bash
# تثبيت Vercel CLI
npm install -g vercel

# في مجلد المشروع
vercel

# اتبع التعليمات:
# - اربط مع حسابك
# - اختر scope (personal/team)
# - أكد اسم المشروع
```

### 2.2 تكوين Build Settings

في Vercel Dashboard:

**Framework Preset**: Next.js  
**Root Directory**: `./` (أو مسار المشروع)  
**Build Command**:
```bash
prisma generate && next build
```

**Output Directory**: `.next` (افتراضي)

**Install Command**: `npm install`

---

## 🔐 الخطوة 3: إعداد متغيرات البيئة

في Vercel Dashboard → Project → Settings → Environment Variables:

### متغيرات إلزامية:

| المتغير | القيمة | الوصف |
|---------|--------|-------|
| `DATABASE_URL` | `postgresql://...` | Connection string من Neon |
| `NEXTAUTH_URL` | `https://www.kmtsys.com` | عنوان الموقع الكامل |
| `NEXTAUTH_SECRET` | `random-string-here` | مفتاح عشوائي طويل (32+ حرف) |
| `RESEND_API_KEY` | `re_...` | API Key من Resend |
| `ADMIN_EMAIL` | `summit_kw@hotmail.com` | بريد الأدمن |

### متغيرات Cloudinary:

| المتغير | القيمة |
|---------|--------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `dghmld0c3` |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `kmt_profiles` |

### متغيرات اختيارية:

| المتغير | القيمة |
|---------|--------|
| `NODE_ENV` | `production` |
| `DIRECT_URL` | (نفس DATABASE_URL) |

**⚠️ مهم جداً**:
- استخدم نفس `NEXTAUTH_SECRET` في جميع البيئات
- `NEXTAUTH_URL` يجب أن يكون HTTPS في production
- لا تضع مسافات قبل أو بعد القيم

### توليد NEXTAUTH_SECRET:

```bash
openssl rand -base64 32
```

---

## 🚀 الخطوة 4: النشر الأول

### 4.1 Push إلى Git

```bash
git add .
git commit -m "Prepare for deployment v1.0.0"
git push origin main
```

### 4.2 Vercel ستبدأ البناء تلقائياً

راقب Build Logs في:
```
https://vercel.com/[your-username]/[project-name]/deployments
```

### 4.3 التحقق من النشر

بعد انتهاء البناء:
1. افتح URL المؤقت: `https://[project-name].vercel.app`
2. تحقق من:
   - [ ] الصفحة الرئيسية تعمل
   - [ ] تسجيل الدخول يعمل
   - [ ] الاتصال بقاعدة البيانات

---

## 🌍 الخطوة 5: ربط Domain مخصص

### 5.1 إضافة Domain في Vercel

1. في Dashboard → Project → Settings → Domains
2. أضف `www.kmtsys.com` و `kmtsys.com`
3. اتبع التعليمات لتحديث DNS

### 5.2 تحديث DNS Records

في مزود الـ Domain (مثل GoDaddy, Namecheap):

**لـ Root Domain** (`kmtsys.com`):
```
Type: A
Name: @
Value: 76.76.21.21
```

**لـ www**:
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### 5.3 تحديث NEXTAUTH_URL

في Environment Variables:
```
NEXTAUTH_URL=https://www.kmtsys.com
```

**ثم أعد نشر المشروع** (Redeploy)

---

## 🔧 الخطوة 6: تهيئة قاعدة البيانات

### 6.1 تشغيل Migrations

```bash
# من المشروع المحلي مع DATABASE_URL للإنتاج
DATABASE_URL="your-production-url" npx prisma migrate deploy
```

### 6.2 إضافة Seed Data (اختياري)

```bash
DATABASE_URL="your-production-url" npm run db:seed
```

### 6.3 إنشاء حساب Admin الأول

**الخيار A - من API**:
```bash
curl -X POST https://www.kmtsys.com/api/init \
  -H "Content-Type: application/json"
```

**الخيار B - من Prisma Studio**:
```bash
DATABASE_URL="your-production-url" npx prisma studio
```

---

## ✅ الخطوة 7: اختبار شامل

### 7.1 اختبار الوظائف الأساسية

- [ ] تسجيل دخول Admin
- [ ] إضافة حدث جديد
- [ ] رفع صورة
- [ ] تسجيل مستخدم جديد
- [ ] إرسال إشعار
- [ ] إرسال بريد إلكتروني

### 7.2 اختبار الأداء

```bash
# من المتصفح أو أدوات Developer Tools
# تحقق من:
- سرعة تحميل الصفحات (< 3 ثواني)
- حجم JavaScript bundle
- عدد الطلبات
```

### 7.3 اختبار الأمان

- [ ] HTTPS يعمل
- [ ] Redirects صحيحة
- [ ] Headers أمنة (في next.config.ts)

---

## 🔄 تحديثات مستقبلية

### نشر تحديث جديد:

```bash
# 1. تحديث الكود
git add .
git commit -m "Update: add new feature"

# 2. Push إلى main
git push origin main

# 3. Vercel ستنشر تلقائياً
```

### Rollback لإصدار سابق:

في Vercel Dashboard:
1. Deployments → اختر الإصدار
2. انقر "Promote to Production"

---

## 🛠️ استكشاف الأخطاء

### مشكلة: Build فشل

**الحل**:
1. راجع Build Logs في Vercel
2. تحقق من جميع dependencies موجودة
3. تأكد من `prisma generate` يعمل

### مشكلة: لا يتصل بقاعدة البيانات

**الحل**:
1. تحقق من `DATABASE_URL` صحيح
2. تأكد من Neon database يعمل
3. جرب الاتصال من terminal:
```bash
DATABASE_URL="..." npx prisma db pull
```

### مشكلة: NextAuth لا يعمل

**الحل**:
1. تحقق من `NEXTAUTH_URL` صحيح (مع https://)
2. تحقق من `NEXTAUTH_SECRET` موجود ونفسه في كل مكان
3. امسح cookies ثم جرب مرة أخرى

### مشكلة: الصور لا ترفع

**الحل**:
1. تحقق من Cloudinary credentials
2. تحقق من upload preset موجود ومفعّل
3. راجع size limits في next.config.ts

---

## 📊 المراقبة والصيانة

### 1. Vercel Analytics

فعّل Analytics في:
```
Dashboard → Project → Analytics
```

لمراقبة:
- Page views
- Performance
- Errors

### 2. Database Monitoring

في Neon Dashboard:
- راقب Storage usage
- راقب Active connections
- راجع Slow queries

### 3. Logs

```bash
# عرض logs من Vercel CLI
vercel logs [deployment-url]

# أو من Dashboard
Dashboard → Deployments → [deployment] → View Logs
```

---

## 🔐 أفضل الممارسات الأمنية

### 1. Environment Variables
- ✅ لا تضع secrets في الكود
- ✅ استخدم Environment Variables فقط
- ✅ لا ترفع .env إلى Git

### 2. API Routes
- ✅ تحقق من التوكن في كل طلب admin
- ✅ استخدم rate limiting
- ✅ validate جميع inputs

### 3. Database
- ✅ استخدم SSL/TLS (`sslmode=require`)
- ✅ فعّل automatic backups في Neon
- ✅ راجع access logs دورياً

---

## 📋 Checklist قبل Go Live

- [ ] جميع Environment Variables محددة
- [ ] Database migrations مطبقة
- [ ] Domain مربوط وSSL يعمل
- [ ] اختبار شامل لجميع الميزات
- [ ] Backups مفعّلة
- [ ] Analytics مفعّل
- [ ] Error monitoring مفعّل
- [ ] Privacy Policy & Terms متاحة
- [ ] Support email/contact جاهز

---

## 🆘 الدعم والمساعدة

### الوثائق الرسمية:
- **Vercel**: https://vercel.com/docs
- **Next.js**: https://nextjs.org/docs
- **Prisma**: https://www.prisma.io/docs
- **Neon**: https://neon.tech/docs

### Community:
- Vercel Discord: https://vercel.com/discord
- Next.js Discord: https://nextjs.org/discord

---

## 📈 خطة النمو

### المرحلة 1: MVP (الحالية)
- نشر على Vercel
- قاعدة بيانات Neon (Free tier)
- Cloudinary (Free tier)

### المرحلة 2: Scale Up
- ترقية Neon إلى Pro
- إضافة CDN لتسريع الصور
- إضافة Monitoring متقدم

### المرحلة 3: Enterprise
- Database replicas
- Multi-region deployment
- Advanced analytics

---

**آخر تحديث**: 4 ديسمبر 2025  
**الإصدار**: 1.0.0  
**المشروع**: KMT Marshal Management System

**حظاً موفقاً في النشر! 🚀**
