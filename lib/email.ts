import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const LOGO_URL = 'https://https-github-com-feras-kmt.vercel.app/kmt-logo.png'

// Production mode: always send to intended recipient
// const TESTING_MODE = process.env.EMAIL_TESTING_MODE === 'true'
// const TESTING_EMAIL = 'summit_kw@hotmail.com' // Your verified email in Resend

interface SendEmailParams {
  to: string
  subject: string
  html: string
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  try {
    const data = await resend.emails.send({
      from: 'KMT System <noreply@kmtsys.com>',
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

const emailStyles = `
  body {
    font-family: Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f5f5;
  }
  .container {
    background: white;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }
  .header {
    color: white;
    padding: 30px;
    text-align: center;
  }
  .header-default {
    background: linear-gradient(135deg, #1a1a1a 0%, #333 100%);
  }
  .header-success {
    background: linear-gradient(135deg, #059669 0%, #10b981 100%);
  }
  .header-warning {
    background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
  }
  .header-danger {
    background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  }
  .logo {
    max-width: 120px;
    height: auto;
    margin: 0 auto 15px auto;
    display: block;
  }
  .content {
    padding: 30px;
  }
  .event-details {
    background: #f9fafb;
    border-left: 4px solid #dc2626;
    padding: 20px;
    margin: 20px 0;
    border-radius: 5px;
  }
  .event-details h3 {
    margin-top: 0;
    color: #1a1a1a;
  }
  .event-details p {
    margin: 10px 0;
  }
  .badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: bold;
    margin: 10px 0;
  }
  .badge-success {
    background: #d1fae5;
    color: #065f46;
  }
  .instructions {
    background: #fef3c7;
    border-left: 4px solid #f59e0b;
    padding: 15px;
    margin: 20px 0;
    border-radius: 5px;
  }
  .footer {
    background: #1a1a1a;
    color: white;
    padding: 20px;
    text-align: center;
    font-size: 14px;
  }
  ul {
    padding-left: 20px;
  }
  li {
    margin: 8px 0;
  }
  ol {
    padding-left: 20px;
  }
`

export function welcomeEmailTemplate(userName: string) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-success">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>🎉 Welcome to KMT!</h1>
      <p>Kuwait Motorsport Town - Marshal Management System</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <p>Welcome to the Kuwait Motorsport Town Marshal Management System! We're excited to have you on board.</p>
      
      <div class="badge badge-success">✓ Account Successfully Created</div>
      
      <h3>What's Next?</h3>
      <ul>
        <li><strong>Browse Events:</strong> Check out upcoming motorsport events</li>
        <li><strong>Register:</strong> Sign up for events you'd like to marshal</li>
        <li><strong>Track Status:</strong> Monitor your registration approvals</li>
        <li><strong>Update Profile:</strong> Complete your profile information</li>
      </ul>
      
      <div class="instructions">
        <strong>⚠️ Important:</strong> Make sure to upload your driving license in your profile for event approval.
      </div>
      
      <p>If you have any questions, feel free to contact the administration team.</p>
      
      <p>See you at the track! 🏁</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

export function registrationEmailTemplate(
  userName: string,
  eventTitle: string,
  startDate: string,
  startTime: string,
  endDate?: string,
  endTime?: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-default">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>📋 Registration Received</h1>
      <p>Event Registration Confirmation</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <p>Your registration request has been received successfully.</p>
      
      <div class="event-details">
        <h3>📅 Event Details</h3>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
        <p><strong>Start Time:</strong> ${startTime}</p>
        ${endTime ? `<p><strong>End Time:</strong> ${endTime}</p>` : ''}
      </div>
      
      <p><strong>Status:</strong> ⏳ Pending Review</p>
      
      <p>Your request will be reviewed by the administration team. You will receive a notification about approval or rejection soon.</p>
      
      <p>You can track your request status through your dashboard.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

export function approvalEmailTemplate(
  userName: string,
  eventTitle: string,
  startDate: string,
  startTime: string,
  location: string,
  endDate?: string,
  endTime?: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-success">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>✅ Congratulations!</h1>
      <p>Your Request Has Been Approved</p>
    </div>
    
    <div class="content">
      <h2>Dear ${userName}! 🎉</h2>
      
      <div class="badge badge-success">✓ You have been approved as a marshal</div>
      
      <p>We are pleased to inform you that your request to work as a marshal has been approved for the following event:</p>
      
      <div class="event-details">
        <h3>📅 Event Details</h3>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
        <p><strong>Start Time:</strong> ${startTime}</p>
        ${endTime ? `<p><strong>End Time:</strong> ${endTime}</p>` : ''}
        <p><strong>Location:</strong> ${location}</p>
      </div>
      
      <div class="instructions">
        <h3>⚠️ Important Instructions</h3>
        <ul>
          <li>Please arrive <strong>30 minutes before</strong> the event start time</li>
          <li>Make sure to bring your <strong>ID card</strong></li>
          <li>Wear the <strong>official marshal uniform</strong></li>
          <li>Review <strong>safety instructions</strong> before the event</li>
          <li>Check in with the marshal coordinator upon arrival</li>
        </ul>
      </div>
      
      <p>We look forward to seeing you at the event!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

export function rejectionEmailTemplate(
  userName: string,
  eventTitle: string,
  notes?: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-danger">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>📋 Request Status Update</h1>
      <p>Registration Decision</p>
    </div>
    
    <div class="content">
      <h2>Dear ${userName},</h2>
      
      <p>We regret to inform you that your registration request has been declined for the following event:</p>
      
      <div class="event-details">
        <p><strong>Event:</strong> ${eventTitle}</p>
        ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
      </div>
      
      <p>You can register for other upcoming events through your dashboard.</p>
      
      <p>Thank you for your interest, and we look forward to seeing you at future events.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

export function removalEmailTemplate(
  userName: string,
  eventTitle: string,
  eventDate: string,
  notes?: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-warning">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>⚠️ Important Update</h1>
      <p>Event Registration Change</p>
    </div>
    
    <div class="content">
      <h2>Dear ${userName},</h2>
      
      <p>We would like to inform you that you have been removed from the following event:</p>
      
      <div class="event-details">
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
        ${notes ? `<p><strong>Reason:</strong> ${notes}</p>` : ''}
      </div>
      
      <p>We apologize for any inconvenience this may cause. You can register for other upcoming events through your dashboard.</p>
      
      <p>Thank you for your understanding, and we look forward to seeing you at future events.</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

export function newEventEmailTemplate(
  userName: string,
  eventTitle: string,
  startDate: string,
  startTime: string,
  location: string,
  description: string,
  endDate?: string,
  endTime?: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-success">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>🏁 New Event Available!</h1>
      <p>Registration Now Open</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <p>A new event has been posted and is now open for marshal registration!</p>
      
      <div class="event-details">
        <h3>📅 Event Details</h3>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Description:</strong> ${description}</p>
        <p><strong>Start Date:</strong> ${startDate}</p>
        ${endDate ? `<p><strong>End Date:</strong> ${endDate}</p>` : ''}
        <p><strong>Start Time:</strong> ${startTime}</p>
        ${endTime ? `<p><strong>End Time:</strong> ${endTime}</p>` : ''}
        <p><strong>Location:</strong> ${location}</p>
      </div>
      
      <div class="instructions">
        <strong>📝 How to Register:</strong>
        <ol>
          <li>Log in to your marshal dashboard</li>
          <li>Browse available events</li>
          <li>Click on the event to view details</li>
          <li>Click "Register" to submit your application</li>
        </ol>
      </div>
      
      <p><strong>⚡ Register early!</strong> Marshal positions are limited and filled on a first-come, first-served basis.</p>
      
      <p>We look forward to seeing you at this event!</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

// 7. Broadcast Message Email
export function broadcastEmailTemplate(
  userName: string,
  subject: string,
  message: string,
  priority: 'normal' | 'high' | 'urgent' = 'normal'
) {
  const headerClass = priority === 'urgent' ? 'header-danger' : priority === 'high' ? 'header-warning' : 'header-default'
  const priorityBadge = priority === 'urgent' ? '🔴 URGENT' : priority === 'high' ? '⚠️ IMPORTANT' : '📢 ANNOUNCEMENT'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header ${headerClass}">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>${priorityBadge}</h1>
      <p>Message from KMT Administration</p>
    </div>
    
    <div class="content">
      <h2>Hello ${userName}!</h2>
      
      <div class="event-details">
        <h3>${subject}</h3>
        <p style="white-space: pre-wrap;">${message}</p>
      </div>
      
      ${priority === 'urgent' ? `
      <div class="instructions">
        <strong>⚠️ This is an urgent message that requires your immediate attention.</strong>
      </div>
      ` : ''}
      
      <p>If you have any questions, please contact the administration team.</p>
      
      <p>Best regards,<br>KMT Administration Team</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

// 8. Marshal Cancellation Notification to Admin
export function marshalCancellationEmailTemplate(
  adminName: string,
  marshalName: string,
  marshalEmail: string,
  eventTitle: string,
  eventDate: string,
  cancellationReason: string
): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-warning">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>⚠️ MARSHAL CANCELLATION</h1>
      <p>Registration Cancelled</p>
    </div>
    
    <div class="content">
      <h2>Hello ${adminName}!</h2>
      
      <p>A marshal has cancelled their registration for an upcoming event.</p>
      
      <div class="event-details">
        <h3>Marshal Information</h3>
        <p><strong>Name:</strong> ${marshalName}</p>
        <p><strong>Email:</strong> ${marshalEmail}</p>
      </div>
      
      <div class="event-details">
        <h3>Event Information</h3>
        <p><strong>Event:</strong> ${eventTitle}</p>
        <p><strong>Date:</strong> ${eventDate}</p>
      </div>
      
      <div class="instructions">
        <h3>Cancellation Reason</h3>
        <p style="white-space: pre-wrap;">${cancellationReason || 'No reason provided'}</p>
      </div>
      
      <p>Please review the marshal assignments for this event and make any necessary adjustments.</p>
      
      <p>Best regards,<br>KMT System</p>
    </div>
    
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}
// 9. Marshal Account Removal Email
export function marshalAccountRemovalEmailTemplate(
  userName: string
) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${emailStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header header-danger">
      <img src="${LOGO_URL}" alt="KMT Logo" class="logo" />
      <h1>⚠️ Account Removed</h1>
      <p>KMT Marshal Management System</p>
    </div>
    <div class="content">
      <h2>Dear ${userName},</h2>
      <div class="event-details">
        <h3>Account Removal</h3>
        <p>Your marshal account has been removed from the Kuwait Motorsport Town system.</p>
      </div>
      <p>If you have any questions, please contact the administration team.</p>
    </div>
    <div class="footer">
      <p>© 2025 Kuwait Motorsport Town - KMT</p>
      <p>All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `
}

