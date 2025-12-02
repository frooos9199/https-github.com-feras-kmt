# 🗄️ Database Backup System

## Overview
Automated monthly database backup system that creates complete backups and sends them via email.

## Features
- ✅ Automatic monthly backups (1st of each month at midnight Kuwait time)
- ✅ Manual backup on demand via admin panel
- ✅ Email delivery to admin
- ✅ Complete data export (users, events, attendances, notifications, broadcasts)
- ✅ Backup statistics and size tracking
- ✅ Admin notifications on completion/failure

## Schedule
**Automatic Backup:** Every 1st of the month at 00:00 (Kuwait time)
- Cron expression: `0 0 1 * *`
- Configured in `vercel.json`

## Manual Backup
Admins can create a backup anytime by:
1. Go to Admin Panel → Database Backup
2. Click "Create Backup Now"
3. Wait for email confirmation

## Configuration

### Environment Variables
Add to Vercel environment variables:

```env
# Admin Email (receives backups)
ADMIN_EMAIL=summit_kw@hotmail.com

# Cron Secret (protects endpoint)
CRON_SECRET=your-random-secret-string-here
```

### Vercel Cron Setup
Already configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/backup",
      "schedule": "0 0 1 * *"
    }
  ]
}
```

## Backup Contents
Each backup includes:
- 👥 All users (with attendances and notifications)
- 📅 All events (with attendances)
- ✅ All attendance records
- 🔔 All notifications
- 📢 All broadcast messages

## Backup Format
JSON file structure:
```json
{
  "timestamp": "2024-11-11T12:00:00.000Z",
  "users": [...],
  "events": [...],
  "attendances": [...],
  "notifications": [...],
  "broadcastMessages": [...]
}
```

## How to Restore from Backup

### Option 1: Manual Restoration (Recommended)
1. Download backup JSON from email
2. Contact technical support
3. Provide the backup file
4. Support will restore using Prisma Studio or custom script

### Option 2: Database Reset + Import
⚠️ **WARNING: This will DELETE all current data!**

```bash
# 1. Reset database
npx prisma db push --force-reset

# 2. Use Prisma Studio to import data
npx prisma studio

# 3. Manually copy data from backup JSON
```

### Option 3: SQL Import (Advanced)
1. Convert JSON to SQL INSERT statements
2. Execute on database
3. Verify data integrity

## Security
- ✅ Endpoint protected by `CRON_SECRET` for automated calls
- ✅ Manual calls require admin authentication
- ✅ Email sent only to configured admin email
- ✅ No public access to backup data

## Troubleshooting

### Backup Not Running Automatically
1. Check Vercel Cron Jobs dashboard
2. Verify `CRON_SECRET` is set in environment variables
3. Check Vercel function logs for errors

### Email Not Received
1. Check spam folder
2. Verify `ADMIN_EMAIL` in environment variables
3. Check `EMAIL_TESTING_MODE` setting
4. Review Resend email logs

### Backup Failed
- Admin receives error notification email
- Check Vercel function logs
- Verify database connection
- Check Prisma schema compatibility

## File Locations
- Backup API: `/app/api/cron/backup/route.ts`
- Admin Page: `/app/admin/backup/page.tsx`
- Configuration: `/vercel.json`

## Changing Backup Frequency

### Monthly (Current)
```json
"schedule": "0 0 1 * *"  // 1st of month at midnight
```

### Weekly
```json
"schedule": "0 0 * * 0"  // Every Sunday at midnight
```

### Daily
```json
"schedule": "0 0 * * *"  // Every day at midnight
```

### Every 12 Hours
```json
"schedule": "0 */12 * * *"  // Every 12 hours
```

### Every 6 Hours
```json
"schedule": "0 */6 * * *"  // Every 6 hours
```

## Cost Considerations
- ✅ Vercel Cron Jobs: FREE on Hobby/Pro plans
- ✅ Email delivery: FREE (within Resend limits)
- ✅ Storage: Email attachment only (no extra cost)

## Best Practices
1. 📧 Keep all backup emails in a dedicated folder
2. 💾 Download important backups to local storage
3. 🔐 Do NOT share backup files (contain sensitive data)
4. 📅 Review backup emails monthly
5. 🧪 Test restoration process periodically

## Next Steps
After deployment:
1. Add `CRON_SECRET` to Vercel environment variables
2. Add `ADMIN_EMAIL` to Vercel environment variables
3. Test manual backup from admin panel
4. Wait for first automatic backup on 1st of next month
5. Verify email delivery
6. Save backup file securely

---

**Created:** November 11, 2024  
**Last Updated:** November 11, 2024  
**Status:** ✅ Active
