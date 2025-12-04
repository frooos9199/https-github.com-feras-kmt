#!/usr/bin/env node

/**
 * KMT System - Deployment Verification Script
 * سكريبت للتحقق من جاهزية المشروع للنشر على Vercel
 */

const fs = require('fs');
const path = require('path');

const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

let checks = 0;
let warnings = 0;
let errors = 0;

function check(condition, message) {
  checks++;
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${message}`);
    return true;
  } else {
    console.log(`${RED}✗${RESET} ${message}`);
    errors++;
    return false;
  }
}

function warn(message) {
  console.log(`${YELLOW}⚠${RESET} ${message}`);
  warnings++;
}

function info(message) {
  console.log(`${BLUE}ℹ${RESET} ${message}`);
}

console.log('🔍 فحص جاهزية المشروع للنشر...\n');

// 1. التحقق من الملفات الأساسية
console.log('1️⃣ فحص الملفات الأساسية:');
console.log('─────────────────────');

check(fs.existsSync('package.json'), 'package.json موجود');
check(fs.existsSync('next.config.ts'), 'next.config.ts موجود');
check(fs.existsSync('prisma/schema.prisma'), 'schema.prisma موجود');
check(fs.existsSync('.env'), '.env موجود');
check(fs.existsSync('.env.example'), '.env.example موجود');

console.log('');

// 2. التحقق من package.json
console.log('2️⃣ فحص package.json:');
console.log('─────────────────────');

try {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  check(pkg.version, `رقم الإصدار: ${pkg.version || 'غير محدد'}`);
  check(pkg.scripts && pkg.scripts.build, 'build script موجود');
  check(pkg.scripts && pkg.scripts.start, 'start script موجود');
  check(pkg.dependencies && pkg.dependencies.next, `Next.js: ${pkg.dependencies.next}`);
  check(pkg.dependencies && pkg.dependencies.prisma, `Prisma: ${pkg.dependencies.prisma}`);
  
} catch (error) {
  check(false, 'قراءة package.json');
  console.error(error.message);
}

console.log('');

// 3. التحقق من متغيرات البيئة
console.log('3️⃣ فحص متغيرات البيئة:');
console.log('─────────────────────');

const envVars = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'RESEND_API_KEY',
  'ADMIN_EMAIL'
];

if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf8');
  
  envVars.forEach(varName => {
    const hasVar = envContent.includes(varName);
    const hasValue = new RegExp(`${varName}=.+`).test(envContent);
    
    if (hasVar && hasValue) {
      check(true, `${varName} محدد`);
    } else if (hasVar) {
      warn(`${varName} موجود لكن بدون قيمة`);
    } else {
      check(false, `${varName} غير موجود`);
    }
  });
} else {
  warn('ملف .env غير موجود');
}

console.log('');

// 4. التحقق من Prisma
console.log('4️⃣ فحص Prisma:');
console.log('─────────────────────');

check(fs.existsSync('prisma/schema.prisma'), 'schema.prisma موجود');
check(fs.existsSync('node_modules/.prisma'), 'Prisma Client مولد');

if (fs.existsSync('prisma/migrations')) {
  const migrations = fs.readdirSync('prisma/migrations').filter(f => f !== 'migration_lock.toml');
  info(`عدد الـ migrations: ${migrations.length}`);
}

console.log('');

// 5. التحقق من الملفات غير المرغوبة
console.log('5️⃣ فحص الملفات غير المستخدمة:');
console.log('─────────────────────');

const unwantedFiles = [
  '*.backup',
  '*.bak',
  '*~',
  '.DS_Store'
];

let foundUnwanted = false;
unwantedFiles.forEach(pattern => {
  // بحث بسيط للملفات
  const files = fs.readdirSync('.').filter(f => {
    if (pattern === '.DS_Store') return f === '.DS_Store';
    if (pattern.startsWith('*.')) {
      const ext = pattern.substring(1);
      return f.endsWith(ext);
    }
    return false;
  });
  
  if (files.length > 0) {
    warn(`وُجد ${files.length} ملف بنمط ${pattern}`);
    foundUnwanted = true;
  }
});

if (!foundUnwanted) {
  check(true, 'لا توجد ملفات غير مستخدمة');
}

console.log('');

// 6. التحقق من .gitignore
console.log('6️⃣ فحص .gitignore:');
console.log('─────────────────────');

if (fs.existsSync('.gitignore')) {
  const gitignore = fs.readFileSync('.gitignore', 'utf8');
  
  const mustIgnore = [
    '.env',
    'node_modules',
    '.next',
    '*.log'
  ];
  
  mustIgnore.forEach(pattern => {
    if (gitignore.includes(pattern)) {
      check(true, `${pattern} في .gitignore`);
    } else {
      warn(`${pattern} غير موجود في .gitignore`);
    }
  });
} else {
  check(false, '.gitignore موجود');
}

console.log('');

// 7. التحقق من next.config
console.log('7️⃣ فحص next.config:');
console.log('─────────────────────');

check(fs.existsSync('next.config.ts') || fs.existsSync('next.config.js'), 'next.config موجود');

console.log('');

// 8. التحقق من vercel.json
console.log('8️⃣ فحص vercel.json:');
console.log('─────────────────────');

if (fs.existsSync('vercel.json')) {
  check(true, 'vercel.json موجود');
  
  try {
    const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
    info(`Build command: ${vercelConfig.buildCommand || 'افتراضي'}`);
    info(`Output directory: ${vercelConfig.outputDirectory || 'افتراضي'}`);
  } catch (error) {
    warn('خطأ في قراءة vercel.json');
  }
} else {
  info('vercel.json غير موجود (سيستخدم الإعدادات الافتراضية)');
}

console.log('');

// النتيجة النهائية
console.log('════════════════════════════════════════');
console.log(`${BLUE}النتيجة النهائية:${RESET}`);
console.log('════════════════════════════════════════');
console.log(`✓ نجح: ${GREEN}${checks - errors}${RESET}`);
console.log(`✗ فشل: ${RED}${errors}${RESET}`);
console.log(`⚠ تحذيرات: ${YELLOW}${warnings}${RESET}`);
console.log('');

if (errors === 0 && warnings === 0) {
  console.log(`${GREEN}🎉 المشروع جاهز للنشر!${RESET}`);
  process.exit(0);
} else if (errors === 0) {
  console.log(`${YELLOW}⚠️  المشروع جاهز تقريباً - راجع التحذيرات${RESET}`);
  process.exit(0);
} else {
  console.log(`${RED}❌ يجب إصلاح الأخطاء قبل النشر${RESET}`);
  process.exit(1);
}
