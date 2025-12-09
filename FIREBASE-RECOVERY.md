# 🔥 Firebase Configuration Recovery Guide

## 📋 Overview
This document explains how to recover Firebase configuration files that were removed during project cleanup.

---

## ⚠️ Problem
After cleaning up the project structure, the iOS app failed to build with error:
```
Build input file cannot be found: '/Users/mac/Documents/GitHub/kmtmaster/kmt/ios/GoogleService-Info.plist'
```

**Root Cause:** `GoogleService-Info.plist` was intentionally removed from git in commit `ce635c7` for security reasons (contains API keys).

---

## ✅ Solution

### Option 1: Recover from Git History (DONE ✅)

```bash
# 1. Find the commit before deletion
cd /Users/mac/Documents/GitHub/kmtmaster/kmt
git log --all --full-history --name-only -- "**/GoogleService-Info.plist"

# 2. Restore from commit 87f4178 (before deletion)
git show 87f4178f0af0de7bb27226fa25407fc181d0b27b:ios/kmtsysApp/GoogleService-Info.plist > /tmp/GoogleService-Info.plist

# 3. Copy to required locations
cp /tmp/GoogleService-Info.plist ios/GoogleService-Info.plist
cp /tmp/GoogleService-Info.plist ios/kmtsysApp/GoogleService-Info.plist

# 4. Verify files exist
ls -lh ios/GoogleService-Info.plist
ls -lh ios/kmtsysApp/GoogleService-Info.plist
```

**Result:** ✅ Files restored successfully (Dec 9, 2025 17:26)

---

### Option 2: Download from Firebase Console

If git history is not available:

1. Go to: https://console.firebase.google.com
2. Select project: **KMT System** (eventapp-a421e)
3. Click ⚙️ Settings → Project Settings
4. Under "Your apps", select **iOS app**
5. Click **Download GoogleService-Info.plist**
6. Copy to both locations:
   ```bash
   cp ~/Downloads/GoogleService-Info.plist /Users/mac/Documents/GitHub/kmtmaster/kmt/ios/
   cp ~/Downloads/GoogleService-Info.plist /Users/mac/Documents/GitHub/kmtmaster/kmt/ios/kmtsysApp/
   ```

---

## 🔒 Security Notes

### Why These Files Are Excluded from Git

**GoogleService-Info.plist** contains sensitive Firebase configuration:
- API Keys
- Project IDs
- OAuth Client IDs
- Google Services credentials

**⚠️ NEVER commit these files to public repositories!**

### Protected in .gitignore

```gitignore
# Firebase configuration files (contain sensitive API keys)
google-services.json
GoogleService-Info.plist
ios/GoogleService-Info.plist
ios/kmtsysApp/GoogleService-Info.plist
android/app/google-services.json
```

---

## 📦 Required Locations

The iOS app requires Firebase config in **TWO** locations:

1. **ios/GoogleService-Info.plist**
   - Required by Xcode build system
   - Referenced in Build Phases

2. **ios/kmtsysApp/GoogleService-Info.plist**
   - Required by app bundle
   - Loaded at runtime by Firebase SDK

**Both files must be identical!**

---

## 🔧 Xcode Configuration

If Xcode shows the file in red (missing):

1. Select file in Project Navigator
2. Press Delete → Remove Reference
3. Right-click "kmtsysApp" → Add Files to "kmtsysApp"
4. Select: `ios/GoogleService-Info.plist`
5. Ensure:
   - ☑️ Copy items if needed
   - ☑️ Create groups
   - ☑️ Target: kmtsysApp

---

## ✅ Verification

After restoring files:

```bash
# 1. Clean build
cd ios
rm -rf Pods Podfile.lock DerivedData
pod install

# 2. Clean Xcode cache
rm -rf ~/Library/Developer/Xcode/DerivedData/kmtsysApp-*

# 3. Build
cd ..
npx react-native run-ios
```

---

## 📝 Related Issues

- **Commit ce635c7**: Removed Firebase files for security
- **Commit 87f4178**: Last commit with Firebase files
- **Commit b469976**: Restored Firebase files after cleanup

---

## 🚨 If Files Get Deleted Again

**Quick recovery command:**
```bash
cd /Users/mac/Documents/GitHub/kmtmaster/kmt
git show 87f4178:ios/kmtsysApp/GoogleService-Info.plist > ios/GoogleService-Info.plist
cp ios/GoogleService-Info.plist ios/kmtsysApp/GoogleService-Info.plist
```

---

## 📞 Team Notes

**For new developers:**
1. Clone repository
2. Request `GoogleService-Info.plist` from team lead
3. Place in both locations (see above)
4. Run `pod install`
5. Build app

**For CI/CD:**
- Store Firebase config as encrypted secrets
- Inject during build process
- Never expose in logs

---

**Last Updated:** December 9, 2025
**Status:** ✅ RESOLVED
**Files Restored:** ios/GoogleService-Info.plist, ios/kmtsysApp/GoogleService-Info.plist
