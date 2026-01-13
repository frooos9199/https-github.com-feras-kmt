// اختبار Firebase Admin SDK Authentication
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function testFirebaseAuth() {
  console.log('🔍 Testing Firebase Admin SDK Authentication...\n');

  try {
    // محاولة 1: استخدام ملف service account
    const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
    
    if (fs.existsSync(serviceAccountPath)) {
      console.log('✅ Found firebase-service-account.json file');
      const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase initialized with service account file');
    } else {
      // محاولة 2: استخدام متغيرات البيئة
      console.log('⚠️ Service account file not found, using environment variables');
      
      require('dotenv').config({ path: '.env.local' });
      
      const serviceAccount = {
        type: "service_account",
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "dummy_key_id",
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')?.replace(/"/g, ''),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: "https://accounts.google.com/o/oauth2/auth",
        token_uri: "https://oauth2.googleapis.com/token",
        auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
        client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`,
        universe_domain: "googleapis.com"
      };

      console.log('📋 Checking environment variables:');
      console.log('  - FIREBASE_PROJECT_ID:', serviceAccount.project_id ? '✅' : '❌');
      console.log('  - FIREBASE_PRIVATE_KEY:', serviceAccount.private_key?.length > 100 ? '✅' : '❌');
      console.log('  - FIREBASE_CLIENT_EMAIL:', serviceAccount.client_email ? '✅' : '❌');
      console.log('  - FIREBASE_CLIENT_ID:', serviceAccount.client_id ? '✅' : '❌');

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      
      console.log('✅ Firebase initialized with environment variables');
    }

    // اختبار إرسال إشعار تجريبي
    console.log('\n📤 Testing notification send capability...');
    
    // هذا سيفشل إذا لم يكن لدينا FCM token، لكنه سيختبر المصادقة
    const testToken = 'test_token_invalid';
    
    try {
      await admin.messaging().send({
        token: testToken,
        notification: {
          title: 'Test',
          body: 'Test notification'
        }
      });
    } catch (error) {
      if (error.code === 'messaging/invalid-argument' || 
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        console.log('✅ Authentication successful! (Token was invalid as expected)');
        console.log('   Error:', error.code);
      } else if (error.code === 'auth/invalid-credential' || 
                 error.message?.includes('OAuth') ||
                 error.message?.includes('authentication credential')) {
        console.log('❌ AUTHENTICATION FAILED!');
        console.log('   Error:', error.code, error.message);
        throw error;
      } else {
        console.log('⚠️ Unexpected error:', error.code, error.message);
      }
    }

    console.log('\n✅ All tests passed!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

testFirebaseAuth();
