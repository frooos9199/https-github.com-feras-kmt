#!/bin/bash

# KMT Marshal System - Pre-Launch Verification Script
# سكريبت للتحقق من جاهزية التطبيق للنشر

echo "🔍 فحص جاهزية التطبيق للنشر..."
echo ""

# ألوان
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

WARNINGS=0
ERRORS=0
CHECKS=0

# دالة للتحقق
check() {
    CHECKS=$((CHECKS + 1))
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓${NC} $2"
    else
        echo -e "${RED}✗${NC} $2"
        ERRORS=$((ERRORS + 1))
    fi
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. التحقق من ملفات المشروع الأساسية
echo "1️⃣ فحص ملفات المشروع:"
echo "─────────────────────"

check $([ -f "package.json" ] && echo 0 || echo 1) "package.json موجود"
check $([ -f "app.json" ] && echo 0 || echo 1) "app.json موجود"
check $([ -d "android" ] && echo 0 || echo 1) "مجلد android موجود"
check $([ -d "ios" ] && echo 0 || echo 1) "مجلد ios موجود"

echo ""

# 2. التحقق من أرقام الإصدارات
echo "2️⃣ فحص أرقام الإصدارات:"
echo "─────────────────────"

if [ -f "package.json" ]; then
    VERSION=$(grep -o '"version": *"[^"]*"' package.json | cut -d'"' -f4)
    if [ "$VERSION" = "1.0.0" ] || [ ! -z "$VERSION" ]; then
        check 0 "رقم الإصدار في package.json: $VERSION"
    else
        check 1 "رقم الإصدار في package.json غير محدد"
    fi
fi

if [ -f "android/app/build.gradle" ]; then
    ANDROID_VERSION=$(grep "versionName" android/app/build.gradle | head -1 | sed 's/.*versionName "\(.*\)".*/\1/')
    ANDROID_CODE=$(grep "versionCode" android/app/build.gradle | head -1 | sed 's/.*versionCode \(.*\)/\1/')
    check 0 "Android versionName: $ANDROID_VERSION, versionCode: $ANDROID_CODE"
fi

echo ""

# 3. التحقق من المكتبات
echo "3️⃣ فحص المكتبات:"
echo "─────────────────────"

if [ -d "node_modules" ]; then
    check 0 "node_modules موجود"
else
    check 1 "node_modules غير موجود - قم بتشغيل npm install"
fi

if [ -d "ios/Pods" ]; then
    check 0 "iOS Pods مثبت"
else
    warn "iOS Pods غير مثبت - قم بتشغيل cd ios && pod install"
fi

echo ""

# 4. التحقق من الأيقونات
echo "4️⃣ فحص الأيقونات:"
echo "─────────────────────"

ICON_SIZES=("mdpi" "hdpi" "xhdpi" "xxhdpi" "xxxhdpi")
MISSING_ICONS=0

for size in "${ICON_SIZES[@]}"; do
    if [ -f "android/app/src/main/res/mipmap-$size/ic_launcher.png" ]; then
        check 0 "أيقونة Android $size موجودة"
    else
        warn "أيقونة Android $size غير موجودة"
        MISSING_ICONS=$((MISSING_ICONS + 1))
    fi
done

if [ $MISSING_ICONS -gt 0 ]; then
    info "استخدم https://appicon.co/ لإنشاء جميع الأحجام"
fi

echo ""

# 5. التحقق من Firebase
echo "5️⃣ فحص إعدادات Firebase:"
echo "─────────────────────"

if [ -f "android/app/google-services.json" ]; then
    check 0 "google-services.json موجود"
else
    warn "google-services.json غير موجود - الإشعارات لن تعمل"
fi

if [ -f "ios/GoogleService-Info.plist" ]; then
    check 0 "GoogleService-Info.plist موجود"
else
    warn "GoogleService-Info.plist غير موجود - الإشعارات لن تعمل"
fi

echo ""

# 6. التحقق من الملفات الاحتياطية
echo "6️⃣ فحص الملفات غير الضرورية:"
echo "─────────────────────"

BACKUP_FILES=$(find . -name "*.backup" -o -name "*.bak" -o -name "*~" 2>/dev/null | grep -v node_modules | grep -v ios/Pods)
if [ -z "$BACKUP_FILES" ]; then
    check 0 "لا توجد ملفات احتياطية"
else
    warn "توجد ملفات احتياطية - قم بحذفها:"
    echo "$BACKUP_FILES"
fi

echo ""

# 7. التحقق من console.log
echo "7️⃣ فحص console.log في الكود:"
echo "─────────────────────"

CONSOLE_LOGS=$(grep -r "console\.log" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" . 2>/dev/null | grep -v node_modules | grep -v ios/Pods | grep -v ".backup" | wc -l | xargs)

if [ "$CONSOLE_LOGS" = "0" ]; then
    check 0 "لا توجد console.log"
else
    warn "وُجد $CONSOLE_LOGS استخدام لـ console.log - يُفضل إزالتها في production"
fi

echo ""

# 8. التحقق من ProGuard
echo "8️⃣ فحص إعدادات ProGuard:"
echo "─────────────────────"

if grep -q "enableProguardInReleaseBuilds = true" android/app/build.gradle 2>/dev/null; then
    check 0 "ProGuard مفعّل"
else
    warn "ProGuard غير مفعّل - حجم APK سيكون أكبر"
fi

echo ""

# 9. التحقق من التوثيق
echo "9️⃣ فحص التوثيق المطلوب:"
echo "─────────────────────"

check $([ -f "PUBLISHING_GUIDE.md" ] && echo 0 || echo 1) "دليل النشر موجود"
check $([ -f "PRE_LAUNCH_CHECKLIST.md" ] && echo 0 || echo 1) "قائمة الفحص موجودة"
check $([ -f "README.md" ] && echo 0 || echo 1) "README موجود"

echo ""

# النتيجة النهائية
echo "════════════════════════════════════════"
echo -e "${BLUE}النتيجة النهائية:${NC}"
echo "════════════════════════════════════════"
echo -e "✓ نجح: ${GREEN}$((CHECKS - ERRORS))${NC}"
echo -e "✗ فشل: ${RED}$ERRORS${NC}"
echo -e "⚠ تحذيرات: ${YELLOW}$WARNINGS${NC}"
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}🎉 التطبيق جاهز للنشر!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  التطبيق جاهز تقريباً - راجع التحذيرات${NC}"
    exit 0
else
    echo -e "${RED}❌ يجب إصلاح الأخطاء قبل النشر${NC}"
    exit 1
fi
