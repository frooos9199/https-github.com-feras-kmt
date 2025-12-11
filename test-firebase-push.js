/**
 * Test Firebase Admin SDK Push Notification
 * Run: node test-firebase-push.js
 */

require('dotenv').config({ path: '.env.local' });
const admin = require('firebase-admin');

// Check environment variables
console.log('\n🔍 Checking Firebase Admin Environment Variables...\n');

const hasServiceAccount = !!process.env.FIREBASE_SERVICE_ACCOUNT;
const hasProjectId = !!process.env.FIREBASE_PROJECT_ID;
const hasClientEmail = !!process.env.FIREBASE_CLIENT_EMAIL;
const hasPrivateKey = !!process.env.FIREBASE_PRIVATE_KEY;

console.log('FIREBASE_SERVICE_ACCOUNT:', hasServiceAccount ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_PROJECT_ID:', hasProjectId ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_CLIENT_EMAIL:', hasClientEmail ? '✅ Set' : '❌ Missing');
console.log('FIREBASE_PRIVATE_KEY:', hasPrivateKey ? '✅ Set' : '❌ Missing');

if (!hasServiceAccount && (!hasProjectId || !hasClientEmail || !hasPrivateKey)) {
  console.error('\n❌ ERROR: Firebase Admin credentials are not configured!');
  console.log('\n📝 To fix this, add to your .env.local file:');
  console.log('\nOption 1: Use Service Account JSON (Recommended):');
  console.log('FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}');
  console.log('\nOption 2: Use individual variables:');
  console.log('FIREBASE_PROJECT_ID=your-project-id');
  console.log('FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com');
  console.log('FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"');
  process.exit(1);
}

// Try to initialize Firebase Admin
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
      };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  console.log('\n✅ Firebase Admin initialized successfully!');
  console.log('📱 Project ID:', serviceAccount.projectId);
  console.log('📧 Client Email:', serviceAccount.clientEmail);
  
  console.log('\n✅ Firebase Admin SDK is ready to send push notifications!');
  
} catch (error) {
  console.error('\n❌ Firebase Admin initialization FAILED:', error.message);
  console.log('\n📝 Make sure your service account JSON is valid.');
  console.log('Get it from: https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
  process.exit(1);
}

// Optional: Test sending to a dummy token (will fail but shows the SDK works)
console.log('\n🧪 Testing FCM messaging API...');

const testToken = 'dummy_token_for_testing';
admin.messaging().send({
  token: testToken,
  notification: {
    title: 'Test',
    body: 'This is a test'
  }
}).then(() => {
  console.log('✅ FCM API works (unexpected success with dummy token)');
  process.exit(0);
}).catch((error) => {
  if (error.code === 'messaging/invalid-registration-token' || 
      error.code === 'messaging/registration-token-not-registered') {
    console.log('✅ FCM API works correctly (rejected dummy token as expected)');
    console.log('\n🎉 Firebase Admin SDK is fully functional!');
    console.log('📤 Push notifications will be sent when valid FCM tokens are used.\n');
    process.exit(0);
  } else {
    console.error('❌ FCM API error:', error.code, error.message);
    process.exit(1);
  }
});
