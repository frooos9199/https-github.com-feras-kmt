#!/bin/bash

echo "🔐 Quick Firebase Admin Test"
echo "============================"
echo ""

# Step 1: Login as admin
echo "1️⃣  Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@kmtsys.com",
    "password": "admin123"
  }')

JWT_TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.token')

if [ "$JWT_TOKEN" = "null" ] || [ -z "$JWT_TOKEN" ]; then
  echo "❌ Login failed! Response:"
  echo $LOGIN_RESPONSE | jq '.'
  exit 1
fi

echo "✅ Login successful!"
echo ""

# Step 2: Send test broadcast
echo "2️⃣  Sending test broadcast notification..."
echo ""

BROADCAST_RESPONSE=$(curl -s -X POST http://localhost:3001/api/admin/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "subject": "🧪 Firebase Push Test",
    "message": "This is a test notification from Firebase Admin SDK. If you see this as a push notification, everything works! 🎉",
    "recipientFilter": "all",
    "sendEmail": false,
    "sendNotification": true,
    "priority": "urgent"
  }')

echo $BROADCAST_RESPONSE | jq '.'
echo ""

# Check for success
SUCCESS=$(echo $BROADCAST_RESPONSE | jq -r '.success')

if [ "$SUCCESS" = "true" ]; then
  echo "✅ Broadcast sent successfully!"
  echo ""
  echo "📱 Now check your iPhone - you should receive a push notification!"
  echo ""
  echo "🔍 Check the Next.js server logs above for:"
  echo "   [BROADCAST] Sending push notifications to X devices..."
  echo "   [FCM] ✅ Success: X, Failed: 0"
  echo ""
else
  echo "❌ Broadcast failed!"
  echo ""
fi
