#!/bin/bash

# KMT Marshal System - Android Build Script
# هذا السكريبت يقوم ببناء APK/AAB للإنتاج

echo "🚀 بدء عملية بناء التطبيق للإنتاج..."
echo ""

# ألوان للـ output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# التحقق من وجود مجلد android
if [ ! -d "android" ]; then
    echo -e "${RED}❌ خطأ: مجلد android غير موجود${NC}"
    exit 1
fi

# السؤال عن نوع البناء
echo "اختر نوع البناء:"
echo "1) APK (للتثبيت المباشر)"
echo "2) AAB (للنشر على Google Play)"
read -p "اختيارك (1 أو 2): " build_type

# تنظيف المشروع
echo ""
echo -e "${BLUE}🧹 تنظيف المشروع...${NC}"
cd android
./gradlew clean
cd ..

# بناء حسب الاختيار
if [ "$build_type" = "1" ]; then
    echo ""
    echo -e "${BLUE}📦 بناء APK...${NC}"
    cd android
    ./gradlew assembleRelease
    cd ..
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ تم بناء APK بنجاح!${NC}"
        echo -e "${GREEN}📍 الموقع: android/app/build/outputs/apk/release/app-release.apk${NC}"
        
        # عرض حجم الملف
        if [ -f "android/app/build/outputs/apk/release/app-release.apk" ]; then
            size=$(ls -lh android/app/build/outputs/apk/release/app-release.apk | awk '{print $5}')
            echo -e "${GREEN}📏 الحجم: $size${NC}"
        fi
    else
        echo ""
        echo -e "${RED}❌ فشل بناء APK${NC}"
        exit 1
    fi
    
elif [ "$build_type" = "2" ]; then
    echo ""
    echo -e "${BLUE}📦 بناء AAB...${NC}"
    cd android
    ./gradlew bundleRelease
    cd ..
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ تم بناء AAB بنجاح!${NC}"
        echo -e "${GREEN}📍 الموقع: android/app/build/outputs/bundle/release/app-release.aab${NC}"
        
        # عرض حجم الملف
        if [ -f "android/app/build/outputs/bundle/release/app-release.aab" ]; then
            size=$(ls -lh android/app/build/outputs/bundle/release/app-release.aab | awk '{print $5}')
            echo -e "${GREEN}📏 الحجم: $size${NC}"
        fi
    else
        echo ""
        echo -e "${RED}❌ فشل بناء AAB${NC}"
        exit 1
    fi
else
    echo -e "${RED}❌ اختيار غير صحيح${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 اكتملت عملية البناء!${NC}"
