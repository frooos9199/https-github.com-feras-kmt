# ⚙️ Setup Instructions for Backup System

## 🚀 Quick Setup (5 minutes)

### Step 1: Add Environment Variables to Vercel

1. Go to your Vercel Dashboard: https://vercel.com/dashboard
2. Select your KMT project
3. Click on **Settings** → **Environment Variables**
4. Add these two variables:

#### Variable 1: CRON_SECRET
```
Key: CRON_SECRET
Value: kmt-backup-secret-2024-kuwait-motorsport
Environment: Production, Preview, Development
```

#### Variable 2: ADMIN_EMAIL
```
Key: ADMIN_EMAIL
Value: summit_kw@hotmail.com
Environment: Production, Preview, Development
```

5. Click **Save** for each variable

### Step 2: Redeploy Your Application

Since the code is already pushed to GitHub, Vercel will automatically deploy.

**OR** manually trigger a redeploy:
1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋮** (three dots) → **Redeploy**
4. Wait for deployment to complete (~2 minutes)

### Step 3: Verify Cron Job is Active

1. In Vercel Dashboard → Your Project
2. Click on **Cron Jobs** tab
3. You should see:
   ```
   Path: /api/cron/backup
   Schedule: 0 0 1 * * (Monthly)
   Next Run: [Date of next 1st of month]
   ```

### Step 4: Test Manual Backup (Optional but Recommended)

1. Go to: https://your-domain.vercel.app/admin
2. Login as admin
3. Click on **🗄️ Database Backup** button
4. Click **📦 Create Backup Now**
5. Wait 10-30 seconds
6. Check email: summit_kw@hotmail.com
7. You should receive backup email with statistics

## ✅ What You'll Receive

### Email Example:
```
Subject: 🗄️ KMT Database Backup - Monday, November 11, 2024

📦 Database Backup Complete

Automatic monthly backup has been created successfully.

Backup Statistics:
• 👥 Users: 25
• 📅 Events: 8
• ✅ Attendances: 150
• 🔔 Notifications: 320
• 📢 Broadcasts: 12
• 📊 Backup Size: 45.32 KB

Backup Date: Monday, November 11, 2024, 12:00 AM
Next Backup: Scheduled in 1 month

⚠️ Important: The backup data is included below.
Please save it securely in a file named: kmt-backup-1731283200000.json
```

## 📅 Backup Schedule

### Current Schedule: Monthly
- **Frequency:** Once per month
- **Date:** 1st of every month
- **Time:** 00:00 (midnight) Kuwait time
- **Next Backup:** December 1, 2024

### If You Want to Change Frequency

Edit `vercel.json`:

**For Weekly (Every Sunday):**
```json
"crons": [
  {
    "path": "/api/cron/backup",
    "schedule": "0 0 * * 0"
  }
]
```

**For Daily:**
```json
"crons": [
  {
    "path": "/api/cron/backup",
    "schedule": "0 0 * * *"
  }
]
```

**For Every 12 Hours:**
```json
"crons": [
  {
    "path": "/api/cron/backup",
    "schedule": "0 */12 * * *"
  }
]
```

Then commit and push:
```bash
git add vercel.json
git commit -m "Update backup frequency"
git push origin main
```

## 🔧 Troubleshooting

### Cron Job Not Showing in Vercel
- **Solution:** Make sure you're on Vercel Pro plan (Hobby plan has cron jobs too)
- Check `vercel.json` is committed to Git
- Redeploy the application

### Email Not Received
1. Check spam folder
2. Verify `ADMIN_EMAIL` is correct: summit_kw@hotmail.com
3. Check if `EMAIL_TESTING_MODE=true` in environment variables
4. Review Vercel function logs for errors

### Backup Failed
1. Check Vercel function logs:
   - Go to **Deployments** → Latest → **Functions**
   - Click on `/api/cron/backup`
   - Review error logs
2. Verify database connection is working
3. Check all environment variables are set

### Manual Backup Not Working
1. Make sure you're logged in as admin
2. Check browser console for errors (F12)
3. Verify `/api/cron/backup` endpoint is accessible
4. Check network tab in browser DevTools

## 💡 Tips

### Save Backups Securely
1. Create a folder: `KMT-Backups/`
2. Save each backup email
3. Name files: `kmt-backup-YYYY-MM-DD.json`
4. Keep on secure cloud storage (Google Drive, OneDrive, etc.)

### Test Restoration
Periodically test that you can restore from backup:
1. Download a backup file
2. Verify it opens and contains data
3. Contact technical support if needed

### Monitor Backup Health
- Check email monthly for backup confirmations
- Verify backup size is growing (indicates new data)
- Review statistics for accuracy

## 📊 Cost

- ✅ **Vercel Cron Jobs:** FREE (included in all plans)
- ✅ **Email Delivery:** FREE (Resend free tier)
- ✅ **Storage:** FREE (email only, no cloud storage needed)

**Total Monthly Cost:** $0 💰

## 🔐 Security Notes

- Backup contains sensitive data (user info, emails, etc.)
- Keep backup files private and secure
- Do NOT share backup files publicly
- Use strong password for email account
- Consider encrypted storage for backups

## 📞 Support

If you need help:
1. Check BACKUP-SYSTEM.md for detailed docs
2. Review Vercel function logs
3. Contact technical support with:
   - Error message
   - Screenshot
   - Approximate time of issue

---

**Setup Date:** November 11, 2024  
**Status:** Ready to Deploy  
**Next Action:** Add environment variables to Vercel
