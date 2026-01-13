#!/usr/bin/env node
// Script to create service account JSON file from environment variables

const fs = require('fs');
const path = require('path');

// Load environment variables
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

// Validate
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.error('❌ Missing required Firebase credentials!');
  console.error('Required env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL');
  process.exit(1);
}

// Write to file
const filePath = path.join(__dirname, 'firebase-service-account.json');
fs.writeFileSync(filePath, JSON.stringify(serviceAccount, null, 2));

console.log('✅ Service account file created:', filePath);
console.log('⚠️ Make sure to add this file to .gitignore!');
