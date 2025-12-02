# 🔥 Firebase Configuration Setup

## Quick Setup Guide

### Prerequisites
- Access to Firebase Console for project `eventapp-a421e`
- Git repository write access

### First Time Setup

1. **Download Firebase Configuration Files**

   **For Android:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select project: `eventapp-a421e`
   - Go to Project Settings → Your apps → Android app
   - Download `google-services.json`
   - Place it in: `android/app/google-services.json`

   **For iOS:**
   - In the same Firebase Console
   - Go to Project Settings → Your apps → iOS app
   - Download `GoogleService-Info.plist`
   - Place it in: `ios/GoogleService-Info.plist` and `ios/kmtsysApp/GoogleService-Info.plist`

2. **Verify Files are Not Tracked**
   ```bash
   git status
   # The Firebase config files should NOT appear in the list
   ```

3. **Build and Run**
   ```bash
   # Install dependencies
   npm install
   
   # For iOS
   cd ios && pod install && cd ..
   npx react-native run-ios
   
   # For Android
   npx react-native run-android
   ```

## 🔒 Security Notes

- **NEVER commit** `google-services.json` or `GoogleService-Info.plist` to version control
- These files are already in `.gitignore`
- Example/template files are provided for reference
- See `SECURITY.md` for detailed security guidelines

## 📁 File Structure

```
kmtsysApp/
├── android/app/
│   ├── google-services.json          ← Your actual file (git-ignored)
│   └── google-services.json.example  ← Template for reference
└── ios/
    ├── GoogleService-Info.plist       ← Your actual file (git-ignored)
    └── GoogleService-Info.plist.example ← Template for reference
```

## ❓ Troubleshooting

**Problem:** Build fails with "google-services.json not found"
**Solution:** Download the file from Firebase Console (see step 1 above)

**Problem:** Firebase features not working
**Solution:** Verify the configuration files are in the correct locations and contain valid credentials

**Problem:** Files appear in git status
**Solution:** Run `git rm --cached <file>` to stop tracking them

## 🔗 Related Documentation

- [SECURITY.md](./SECURITY.md) - Security guidelines and key rotation instructions
- [Firebase Documentation](https://firebase.google.com/docs)
