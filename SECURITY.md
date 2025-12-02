# 🔐 SECURITY ALERT - IMMEDIATE ACTION REQUIRED

## ⚠️ Exposed Google API Keys Detected

**CRITICAL:** Google API Keys have been exposed in this repository. These keys were found in:
- `android/app/google-services.json`
- `ios/GoogleService-Info.plist`
- `ios/kmtsysApp/GoogleService-Info.plist`

## 🚨 Immediate Actions Required

### 1. Rotate the Exposed API Keys

**You MUST rotate these keys immediately** to prevent unauthorized access to your Firebase project.

#### Steps to Rotate Firebase API Keys:

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/
   - Select your project: `eventapp-a421e`

2. **Navigate to API Credentials:**
   - Go to "APIs & Services" → "Credentials"
   - Find the exposed API keys:
     - Android: `AIzaSyA3YPqDiyPhHPv8LdWEMM4rLUAx2yHuk30`
     - iOS: `AIzaSyAW4VWkbtrIO2LFf4NJmJ1wHdSl1Y9gBnA`

3. **Delete/Restrict the Exposed Keys:**
   - **Option A (Recommended):** Delete the exposed keys entirely
   - **Option B:** Add strict application restrictions and API restrictions

4. **Generate New Keys:**
   - Download new `google-services.json` from Firebase Console
   - Download new `GoogleService-Info.plist` from Firebase Console
   - Replace the local files (these are already in `.gitignore` now)

5. **Update Your Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Select project: `eventapp-a421e`
   - Go to Project Settings → General
   - Re-download configuration files for both Android and iOS

### 2. Remove Sensitive Files from Git History

The files have been added to `.gitignore`, but they still exist in git history. You need to remove them:

```bash
# Navigate to the kmtsysApp directory
cd /Users/mac/Documents/GitHub/kmtmaster/kmtsysApp

# Remove the files from git tracking (but keep local copies)
git rm --cached android/app/google-services.json
git rm --cached ios/GoogleService-Info.plist
git rm --cached ios/kmtsysApp/GoogleService-Info.plist

# Commit the removal
git commit -m "Remove exposed Firebase configuration files"

# IMPORTANT: Purge from git history using BFG Repo-Cleaner or git filter-branch
# Using BFG (recommended):
# 1. Download BFG: https://rtyley.github.io/bfg-repo-cleaner/
# 2. Run: java -jar bfg.jar --delete-files google-services.json
# 3. Run: java -jar bfg.jar --delete-files GoogleService-Info.plist
# 4. Run: git reflog expire --expire=now --all && git gc --prune=now --aggressive
# 5. Force push: git push --force

# OR using git filter-repo (alternative):
# Install: pip install git-filter-repo
# Run: git filter-repo --path android/app/google-services.json --invert-paths
# Run: git filter-repo --path ios/GoogleService-Info.plist --invert-paths
# Run: git filter-repo --path ios/kmtsysApp/GoogleService-Info.plist --invert-paths
```

⚠️ **WARNING:** Force pushing rewrites git history. Coordinate with your team before doing this!

### 3. Setup New Configuration Files

After rotating the keys:

```bash
# Copy the example files
cp android/app/google-services.json.example android/app/google-services.json
cp ios/GoogleService-Info.plist.example ios/GoogleService-Info.plist

# Edit these files with your NEW Firebase credentials
# DO NOT commit these files to git (they're now in .gitignore)
```

### 4. Verify Security

After completing the above steps:

```bash
# Check that sensitive files are not tracked
git status

# Verify .gitignore is working
git check-ignore android/app/google-services.json
git check-ignore ios/GoogleService-Info.plist

# Both should output the file paths, confirming they're ignored
```

## 📋 Prevention Measures

### For Development Team:

1. **Never commit Firebase configuration files** to version control
2. **Always use example/template files** for documentation
3. **Use environment variables** for sensitive data when possible
4. **Enable pre-commit hooks** to prevent accidental commits of sensitive files

### Additional Security Best Practices:

1. **Set up Application Restrictions** in Google Cloud Console for your API keys
2. **Enable Firebase App Check** to prevent unauthorized access
3. **Monitor Firebase usage** regularly for suspicious activity
4. **Implement API key rotation schedule** (every 90 days recommended)
5. **Use Firebase Security Rules** to restrict database access

## 📝 Team Communication

Make sure to:
- [ ] Notify all team members about the exposed keys
- [ ] Ensure everyone pulls the latest changes after force push
- [ ] Update deployment configurations (Vercel, etc.) with new keys
- [ ] Update any CI/CD pipelines with new secrets

## 🔗 Useful Links

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [Firebase Security Best Practices](https://firebase.google.com/support/guides/security-checklist)
- [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/)
- [Git Filter-Repo](https://github.com/newren/git-filter-repo)

## ✅ Checklist

- [ ] Rotated Android API key in Google Cloud Console
- [ ] Rotated iOS API key in Google Cloud Console
- [ ] Downloaded new Firebase configuration files
- [ ] Removed sensitive files from git tracking
- [ ] Purged files from git history
- [ ] Force pushed changes to remote repository
- [ ] Updated local configuration files with new keys
- [ ] Verified .gitignore is working correctly
- [ ] Notified team members
- [ ] Updated deployment environments
- [ ] Set up application restrictions for new API keys
- [ ] Enabled Firebase App Check (optional but recommended)

---

**Last Updated:** December 2, 2025
**Status:** 🔴 CRITICAL - Action Required
