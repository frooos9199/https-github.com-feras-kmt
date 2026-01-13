// Test Firebase Admin SDK authentication
import { NextResponse } from 'next/server';
import { messaging } from '@/lib/firebase-admin';

export async function GET() {
  try {
    // Get Firebase Messaging instance
    if (!messaging) {
      return NextResponse.json({ 
        success: false, 
        error: 'Firebase Messaging not initialized' 
      }, { status: 500 });
    }

    // Try to send a test message with invalid token
    // This will test authentication without actually sending
    const testToken = 'invalid_test_token_for_auth_check';
    
    try {
      await messaging.send({
        token: testToken,
        notification: {
          title: 'Test',
          body: 'Test'
        }
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Unexpected success - should have failed with invalid token' 
      });
      
    } catch (error: any) {
      // These errors mean authentication worked!
      if (error.code === 'messaging/invalid-argument' || 
          error.code === 'messaging/invalid-registration-token' ||
          error.code === 'messaging/registration-token-not-registered') {
        return NextResponse.json({ 
          success: true, 
          message: 'Firebase authentication successful',
          note: 'Token was invalid as expected, but auth worked',
          errorCode: error.code
        });
      }
      
      // These errors mean authentication failed!
      if (error.code === 'auth/invalid-credential' || 
          error.message?.includes('OAuth') ||
          error.message?.includes('authentication credential')) {
        return NextResponse.json({ 
          success: false, 
          error: 'Firebase authentication failed',
          errorCode: error.code,
          errorMessage: error.message
        }, { status: 401 });
      }
      
      // Other errors
      return NextResponse.json({ 
        success: false, 
        error: 'Unexpected error',
        errorCode: error.code,
        errorMessage: error.message
      }, { status: 500 });
    }
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to test Firebase',
      message: error.message 
    }, { status: 500 });
  }
}
