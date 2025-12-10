#!/bin/bash

# 🔍 KMT iOS Push Notifications Configuration Checker
# هذا السكريبت يفحص إعدادات الإشعارات في التطبيق

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 KMT iOS Push Notifications Configuration Check"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNING=0

# Check function
check_pass() {
    echo -e "${GREEN}✅ PASS${NC}: $1"
    ((PASSED++))
}

check_fail() {
    echo -e "${RED}❌ FAIL${NC}: $1"
    ((FAILED++))
}

check_warn() {
    echo -e "${YELLOW}⚠️  WARN${NC}: $1"
    ((WARNING++))
}

echo "📱 Checking iOS Configuration..."
echo ""

# 1. Check Info.plist
echo "1️⃣  Checking Info.plist..."
if grep -q "remote-notification" ios/kmtsysApp/Info.plist; then
    check_pass "UIBackgroundModes contains 'remote-notification'"
else
    check_fail "UIBackgroundModes missing 'remote-notification'"
fi

if grep -q "<string>fetch</string>" ios/kmtsysApp/Info.plist; then
    check_pass "UIBackgroundModes contains 'fetch'"
else
    check_warn "UIBackgroundModes missing 'fetch' (optional)"
fi

if grep -q "<string>processing</string>" ios/kmtsysApp/Info.plist; then
    check_pass "UIBackgroundModes contains 'processing'"
else
    check_warn "UIBackgroundModes missing 'processing' (optional)"
fi

echo ""

# 2. Check Entitlements
echo "2️⃣  Checking Entitlements..."
if [ -f "ios/kmtsysApp/kmtsysApp.entitlements" ]; then
    check_pass "Entitlements file exists"
    
    if grep -q "aps-environment" ios/kmtsysApp/kmtsysApp.entitlements; then
        check_pass "aps-environment configured"
        
        if grep -q "<string>production</string>" ios/kmtsysApp/kmtsysApp.entitlements; then
            check_pass "aps-environment set to 'production'"
        elif grep -q "<string>development</string>" ios/kmtsysApp/kmtsysApp.entitlements; then
            check_warn "aps-environment set to 'development' (change to 'production' for release)"
        fi
    else
        check_fail "aps-environment not configured"
    fi
else
    check_fail "Entitlements file missing"
fi

echo ""

# 3. Check Firebase files
echo "3️⃣  Checking Firebase Configuration..."
if [ -f "ios/kmtsysApp/GoogleService-Info.plist" ]; then
    check_pass "GoogleService-Info.plist exists"
else
    check_fail "GoogleService-Info.plist missing"
fi

if [ -f "firebaseInit.js" ]; then
    check_pass "firebaseInit.js exists"
else
    check_fail "firebaseInit.js missing"
fi

echo ""

# 4. Check AppDelegate
echo "4️⃣  Checking AppDelegate.swift..."
if grep -q "FirebaseApp.configure()" ios/kmtsysApp/AppDelegate.swift; then
    check_pass "Firebase initialized in AppDelegate"
else
    check_fail "Firebase not initialized in AppDelegate"
fi

echo ""

# 5. Check package dependencies
echo "5️⃣  Checking npm packages..."
if grep -q "@react-native-firebase/messaging" package.json; then
    check_pass "@react-native-firebase/messaging installed"
else
    check_fail "@react-native-firebase/messaging not installed"
fi

if grep -q "@react-native-firebase/app" package.json; then
    check_pass "@react-native-firebase/app installed"
else
    check_fail "@react-native-firebase/app not installed"
fi

if grep -q "@react-native-community/push-notification-ios" package.json; then
    check_pass "@react-native-community/push-notification-ios installed"
else
    check_warn "@react-native-community/push-notification-ios not installed (recommended)"
fi

if grep -q "react-native-background-fetch" package.json; then
    check_pass "react-native-background-fetch installed"
else
    check_warn "react-native-background-fetch not installed (optional)"
fi

echo ""

# 6. Check code implementation
echo "6️⃣  Checking Code Implementation..."
if grep -q "messaging().setBackgroundMessageHandler" index.js; then
    check_pass "Background message handler configured in index.js"
else
    check_fail "Background message handler missing in index.js"
fi

if grep -q "messaging().requestPermission" App.js; then
    check_pass "Notification permission request in App.js"
else
    check_fail "Notification permission request missing in App.js"
fi

if grep -q "sendFcmTokenToServer" App.js; then
    check_pass "FCM token sent to server"
else
    check_fail "FCM token not being sent to server"
fi

echo ""

# 7. Backend check
echo "7️⃣  Checking Backend Configuration..."
if [ -f "kmt/lib/firebase-admin.ts" ]; then
    check_pass "Firebase Admin SDK configured"
else
    check_fail "Firebase Admin SDK not configured"
fi

if grep -q "sendPushNotification" kmt/app/api/admin/broadcast/route.ts 2>/dev/null; then
    check_pass "Push notifications integrated in broadcast API"
else
    check_warn "Push notifications may not be integrated in backend"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed: $PASSED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNING${NC}"
echo ""

# Final verdict
if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}🎉 Configuration looks good!${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: APNs Setup Required${NC}"
    echo ""
    echo "To receive notifications when app is CLOSED, you MUST:"
    echo "1. Have an Apple Developer Account (\$99/year)"
    echo "2. Create APNs Authentication Key"
    echo "3. Upload it to Firebase Console"
    echo ""
    echo "See: IOS_PUSH_NOTIFICATIONS_GUIDE.md for details"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ Configuration has issues!${NC}"
    echo ""
    echo "Please fix the failed checks above."
    echo "See: IOS_PUSH_NOTIFICATIONS_GUIDE.md for help"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
fi

echo ""
exit $FAILED
