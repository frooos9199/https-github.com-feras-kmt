# نشر تطبيق KMT Marshal Management System

## خيارات النشر

### 1. Vercel (موصى به - مجاني وسريع)

#### الخطوات:

1. **إنشاء حساب على Vercel**
   - اذهب إلى: https://vercel.com/signup
   - سجل باستخدام GitHub

2. **ربط المشروع بـ GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - KMT Marshal System"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

3. **نشر على Vercel**
   - اذهب إلى: https://vercel.com/new
   - اختر المشروع من GitHub
   - ضع المتغيرات البيئية (Environment Variables):
     - `DATABASE_URL`: استخدم قاعدة بيانات خارجية (انظر الخيارات أدناه)
     - `NEXTAUTH_URL`: رابط الموقع (مثال: https://kmt.vercel.app)
     - `NEXTAUTH_SECRET`: مفتاح سري قوي (استخدم: `openssl rand -base64 32`)

4. **قاعدة البيانات**
   
   **خيار أ - Turso (SQLite في السحابة - مجاني)**
   ```bash
   # تثبيت Turso CLI
   curl -sSfL https://get.tur.so/install.sh | bash
   
   # إنشاء قاعدة بيانات
   turso db create kmt-marshal-db
   
   # الحصول على رابط الاتصال
   turso db show kmt-marshal-db --url
   
   # نسخ URL وضعه في Vercel Environment Variables
   ```

   **خيار ب - Neon PostgreSQL (مجاني)**
   - اذهب إلى: https://neon.tech
   - أنشئ قاعدة بيانات جديدة
   - انسخ Connection String
   - عدّل schema.prisma لاستخدام PostgreSQL بدلاً من SQLite

   **خيار ج - PlanetScale MySQL (مجاني)**
   - اذهب إلى: https://planetscale.com
   - أنشئ قاعدة بيانات جديدة
   - انسخ Connection String

5. **تطبيق المايجريشن**
   ```bash
   # بعد النشر، شغل هذا الأمر لإنشاء الجداول
   npx prisma migrate deploy
   
   # أو استخدم
   npx prisma db push
   ```

---

### 2. Railway (بديل سهل)

1. اذهب إلى: https://railway.app
2. سجل باستخدام GitHub
3. اختر "New Project" → "Deploy from GitHub repo"
4. Railway سيكتشف Next.js تلقائياً
5. ضع المتغيرات البيئية
6. Railway يوفر PostgreSQL مدمج (اضغط على "+ New" → Database → PostgreSQL)

---

### 3. نشر على VPS/Server خاص

#### متطلبات:
- Node.js 18+
- Nginx
- PM2

#### الخطوات:

```bash
# 1. رفع الملفات للسيرفر
scp -r /path/to/kmt user@your-server:/var/www/kmt

# 2. على السيرفر
cd /var/www/kmt
npm install
npx prisma generate
npx prisma migrate deploy
npm run build

# 3. تشغيل بـ PM2
npm install -g pm2
pm2 start npm --name "kmt" -- start
pm2 save
pm2 startup

# 4. إعداد Nginx
sudo nano /etc/nginx/sites-available/kmt

# محتوى الملف:
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# 5. تفعيل
sudo ln -s /etc/nginx/sites-available/kmt /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 6. SSL باستخدام Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## ملاحظات مهمة

### 1. الملفات المرفوعة (Uploads)
- على Vercel، الملفات المرفوعة لن تبقى دائمة
- استخدم خدمة تخزين خارجية:
  - **Cloudinary** (مجاني حتى 25GB)
  - **AWS S3**
  - **DigitalOcean Spaces**

### 2. قاعدة البيانات
- SQLite لا تعمل على Vercel (serverless)
- استخدم PostgreSQL أو MySQL أو Turso

### 3. المتغيرات البيئية المطلوبة
```
DATABASE_URL=<your-database-url>
NEXTAUTH_URL=<your-production-url>
NEXTAUTH_SECRET=<strong-random-secret>
NODE_ENV=production
```

### 4. إنشاء مستخدم Admin الأول
بعد النشر، شغل seed script أو أنشئ admin يدوياً:

```bash
# على السيرفر أو في Vercel Terminal
npx tsx prisma/seed.ts
```

أو استخدم Prisma Studio:
```bash
npx prisma studio
```

---

## الاختبار بعد النشر

1. ✅ تسجيل الدخول كـ Admin (admin@kmt.kw / admin123)
2. ✅ إنشاء مارشال جديد
3. ✅ إنشاء event جديد
4. ✅ تسجيل حضور
5. ✅ طباعة قائمة الحضور
6. ✅ الإشعارات تعمل
7. ✅ تعديل الملف الشخصي

---

## دعم فني

إذا واجهت مشاكل:
1. تحقق من logs في Vercel/Railway
2. تأكد من المتغيرات البيئية صحيحة
3. تأكد من قاعدة البيانات متصلة
4. شغل المايجريشن: `npx prisma migrate deploy`

---

## التكلفة

- **Vercel**: مجاني (Hobby Plan) - يكفي للاستخدام المتوسط
- **Database (Turso/Neon)**: مجاني حتى حد معين
- **التخزين (Cloudinary)**: مجاني حتى 25GB

**المجموع: مجاني بالكامل للبداية!** 🎉
