// Direct FCM API call without Firebase Admin SDK
import { GoogleAuth } from 'google-auth-library';

interface FCMMessage {
  token: string;
  notification?: {
    title: string;
    body: string;
  };
  data?: { [key: string]: string };
  apns?: any;
}

export async function sendFCMNotification(message: FCMMessage) {
  try {
    const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY || '';
    const decodedPrivateKey = rawPrivateKey.includes('BEGIN')
      ? rawPrivateKey
      : Buffer.from(rawPrivateKey, 'base64').toString('utf-8');

    const privateKey = decodedPrivateKey
      .replace(/^["']|["']$/g, '')
      .replace(/\\n/g, '\n');

    // Create credentials from environment variables
    const credentials = {
      type: 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: privateKey,
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: 'https://accounts.google.com/o/oauth2/auth',
      token_uri: 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
      universe_domain: 'googleapis.com'
    };

    // Use GoogleAuth to get access token
    const auth = new GoogleAuth({
      credentials: credentials as any,
      scopes: ['https://www.googleapis.com/auth/firebase.messaging']
    });

    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();

    if (!accessToken.token) {
      throw new Error('Failed to get access token');
    }

    // Call FCM API directly
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FCM API error: ${error}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('[FCM Direct] Error:', error);
    throw error;
  }
}
