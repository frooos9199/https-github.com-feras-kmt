# 📝 Vercel Environment Variables to Add

Go to: https://vercel.com/YOUR_PROJECT/settings/environment-variables

Add this variable:

**Name:** EMAIL_TESTING_MODE
**Value:** true
**Environment:** Production, Preview, Development

⚠️ Important: 
- In TESTING MODE, all emails will be sent to: summit_kw@hotmail.com
- Subject will show: [TEST → original@email.com] Original Subject
- This is temporary until you verify a domain in Resend

To disable testing mode later:
- Change value to "false" OR
- Delete the variable
