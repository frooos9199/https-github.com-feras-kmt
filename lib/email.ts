import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: 'KMT System <onboarding@resend.dev>', // سيتم تحديثه عند إضافة دومين مخصص
      to: [to],
      subject,
      html,
    })
    
    console.log('Email sent successfully:', data)
    return { success: true, data }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}

// قالب إيميل التسجيل في الفعالية
export function registrationEmailTemplate(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  language: 'en' | 'ar' = 'ar',
  endDate?: string | null,
  endTime?: string | null
) {
  if (language === 'ar') {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .event-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-right: 4px solid #dc2626;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .button {
            display: inline-block;
            background: #dc2626;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 5px;
            margin: 10px 0;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>🏁 مدينة الكويت لرياضة السيارات</h1>
        <p>نظام إدارة المارشالات</p>
    </div>
    
    <div class="content">
        <h2>مرحباً ${userName}! 👋</h2>
        
        <p>تم استلام طلب تسجيلك للفعالية بنجاح.</p>
        
        <div class="event-details">
            <h3>📋 تفاصيل الفعالية:</h3>
            <p><strong>الفعالية:</strong> ${eventTitle}</p>
            <p><strong>تاريخ البداية:</strong> ${eventDate}</p>
            ${endDate ? `<p><strong>تاريخ النهاية:</strong> ${endDate}</p>` : ''}
            <p><strong>وقت البداية:</strong> ${eventTime}</p>
            ${endTime ? `<p><strong>وقت النهاية:</strong> ${endTime}</p>` : ''}
        </div>
        
        <p><strong>حالة الطلب:</strong> قيد المراجعة ⏳</p>
        
        <p>سيتم مراجعة طلبك من قبل الإدارة وسيصلك إشعار بالقبول أو الرفض قريباً.</p>
        
        <p>يمكنك متابعة حالة طلبك من خلال لوحة التحكم الخاصة بك في النظام.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 مدينة الكويت لرياضة السيارات - KMT</p>
        <p>جميع الحقوق محفوظة</p>
    </div>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .event-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>🏁 Kuwait Motorsport Town</h1>
        <p>Marshal Management System</p>
    </div>
    
    <div class="content">
        <h2>Hello ${userName}! 👋</h2>
        
        <p>Your registration request has been received successfully.</p>
        
        <div class="event-details">
            <h3>📋 Event Details:</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Start Date:</strong> ${eventDate}</p>
            ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
            <p><strong>Start Time:</strong> ${eventTime}</p>
            ${endTime ? `<p><strong>End Time:</strong> ${endTime}</p>` : ''}
        </div>
        
        <p><strong>Status:</strong> Pending Review ⏳</p>
        
        <p>Your request will be reviewed by the administration and you will receive a notification about approval or rejection soon.</p>
        
        <p>You can track your request status through your dashboard in the system.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 Kuwait Motorsport Town - KMT</p>
        <p>All Rights Reserved</p>
    </div>
</body>
</html>
    `
  }
}

// قالب إيميل القبول
export function approvalEmailTemplate(
  userName: string,
  eventTitle: string,
  eventDate: string,
  eventTime: string,
  eventLocation: string,
  language: 'en' | 'ar' = 'ar',
  endDate?: string | null,
  endTime?: string | null
) {
  if (language === 'ar') {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .event-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-right: 4px solid #059669;
        }
        .success-badge {
            background: #d1fae5;
            color: #065f46;
            padding: 10px 20px;
            border-radius: 50px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>✅ تهانينا!</h1>
        <p>تم قبول طلبك</p>
    </div>
    
    <div class="content">
        <h2>عزيزي ${userName}! 🎉</h2>
        
        <div class="success-badge">
            ✓ تم قبولك كمارشال في الفعالية
        </div>
        
        <p>يسعدنا إبلاغك بأنه تم قبول طلبك للعمل كمارشال في الفعالية التالية:</p>
        
        <div class="event-details">
            <h3>📋 تفاصيل الفعالية:</h3>
            <p><strong>الفعالية:</strong> ${eventTitle}</p>
            <p><strong>تاريخ البداية:</strong> ${eventDate}</p>
            ${endDate ? `<p><strong>تاريخ النهاية:</strong> ${endDate}</p>` : ''}
            <p><strong>وقت البداية:</strong> ${eventTime}</p>
            ${endTime ? `<p><strong>وقت النهاية:</strong> ${endTime}</p>` : ''}
            <p><strong>الموقع:</strong> ${eventLocation}</p>
        </div>
        
        <h3>⚠️ تعليمات هامة:</h3>
        <ul>
            <li>يرجى الحضور قبل موعد الفعالية بـ 30 دقيقة</li>
            <li>التأكد من إحضار بطاقة الهوية</li>
            <li>الالتزام بالزي الرسمي للمارشالات</li>
            <li>مراجعة تعليمات السلامة قبل الفعالية</li>
        </ul>
        
        <p>نتطلع لرؤيتك في الفعالية!</p>
    </div>
    
    <div class="footer">
        <p>© 2025 مدينة الكويت لرياضة السيارات - KMT</p>
        <p>جميع الحقوق محفوظة</p>
    </div>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .event-details {
            background: white;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #059669;
        }
        .success-badge {
            background: #d1fae5;
            color: #065f46;
            padding: 10px 20px;
            border-radius: 50px;
            display: inline-block;
            font-weight: bold;
            margin: 10px 0;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>✅ Congratulations!</h1>
        <p>Your Request Has Been Approved</p>
    </div>
    
    <div class="content">
        <h2>Dear ${userName}! 🎉</h2>
        
        <div class="success-badge">
            ✓ You have been approved as a marshal
        </div>
        
        <p>We are pleased to inform you that your request to work as a marshal has been approved for the following event:</p>
        
        <div class="event-details">
            <h3>📋 Event Details:</h3>
            <p><strong>Event:</strong> ${eventTitle}</p>
            <p><strong>Start Date:</strong> ${eventDate}</p>
            ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
            <p><strong>Start Time:</strong> ${eventTime}</p>
            ${endTime ? `<p><strong>End Time:</strong> ${endTime}</p>` : ''}
            <p><strong>Location:</strong> ${eventLocation}</p>
        </div>
        
        <h3>⚠️ Important Instructions:</h3>
        <ul>
            <li>Please arrive 30 minutes before the event</li>
            <li>Make sure to bring your ID card</li>
            <li>Wear the official marshal uniform</li>
            <li>Review safety instructions before the event</li>
        </ul>
        
        <p>We look forward to seeing you at the event!</p>
    </div>
    
    <div class="footer">
        <p>© 2025 Kuwait Motorsport Town - KMT</p>
        <p>All Rights Reserved</p>
    </div>
</body>
</html>
    `
  }
}

// قالب إيميل الرفض
export function rejectionEmailTemplate(
  userName: string,
  eventTitle: string,
  notes: string | null,
  language: 'en' | 'ar' = 'ar'
) {
  if (language === 'ar') {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .info-box {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-right: 4px solid #dc2626;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>تنبيه من النظام</h1>
        <p>تحديث حالة الطلب</p>
    </div>
    
    <div class="content">
        <h2>عزيزي ${userName},</h2>
        
        <p>نأسف لإبلاغك بأنه تم رفض طلب تسجيلك في الفعالية التالية:</p>
        
        <div class="info-box">
            <p><strong>الفعالية:</strong> ${eventTitle}</p>
            ${notes ? `<p><strong>السبب:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>يمكنك التسجيل في فعاليات أخرى من خلال لوحة التحكم.</p>
        
        <p>شكراً لاهتمامك، ونتطلع لرؤيتك في فعاليات قادمة.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 مدينة الكويت لرياضة السيارات - KMT</p>
        <p>جميع الحقوق محفوظة</p>
    </div>
</body>
</html>
    `
  } else {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: white;
            padding: 30px;
            text-align: center;
            border-radius: 10px 10px 0 0;
        }
        .content {
            background: #f9f9f9;
            padding: 30px;
            border: 1px solid #ddd;
        }
        .info-box {
            background: #fef2f2;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
        }
        .footer {
            background: #1a1a1a;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 0 0 10px 10px;
            font-size: 14px;
        }
        .logo {
            max-width: 150px;
            height: auto;
            margin: 0 auto 15px auto;
            display: block;
        }
    </style>
</head>
<body>
    <div class="header">
        <img src="https://https-github-com-feras-kmt.vercel.app/kmt-logo.png" alt="KMT Logo" class="logo" />
        <h1>System Notification</h1>
        <p>Request Status Update</p>
    </div>
    
    <div class="content">
        <h2>Dear ${userName},</h2>
        
        <p>We regret to inform you that your registration request has been declined for the following event:</p>
        
        <div class="info-box">
            <p><strong>Event:</strong> ${eventTitle}</p>
            ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
        </div>
        
        <p>You can register for other events through your dashboard.</p>
        
        <p>Thank you for your interest, and we look forward to seeing you at future events.</p>
    </div>
    
    <div class="footer">
        <p>© 2025 Kuwait Motorsport Town - KMT</p>
        <p>All Rights Reserved</p>
    </div>
</body>
</html>
    `
  }
}
