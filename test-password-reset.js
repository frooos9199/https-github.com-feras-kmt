// Test script for password reset functionality
import fetch from 'node-fetch';

async function testPasswordReset() {
  console.log('Testing password reset functionality...\n');

  // Test 1: Validate invalid token
  console.log('1. Testing invalid token validation...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/validate-reset-token?token=invalid-token');
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }

  // Test 2: Test forgot password API
  console.log('\n2. Testing forgot password API...');
  try {
    const response = await fetch('http://localhost:3000/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com' })
    });
    const result = await response.json();
    console.log('Response:', result);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\nPassword reset functionality test completed.');
}

testPasswordReset().catch(console.error);