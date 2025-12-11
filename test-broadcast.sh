#!/bin/bash

echo "🧪 Testing Push Notification Send"
echo "=================================="
echo ""
echo "📝 This script will test sending a broadcast notification"
echo ""

# Get admin JWT token (you need to login first)
read -p "Enter Admin JWT Token (from login): " JWT_TOKEN

if [ -z "$JWT_TOKEN" ]; then
  echo "❌ No token provided. Please login as admin first and copy the JWT token."
  exit 1
fi

echo ""
echo "📤 Sending test broadcast..."
echo ""

curl -X POST http://localhost:3001/api/admin/broadcast \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -d '{
    "subject": "🧪 Test Push Notification",
    "message": "This is a test push notification from Firebase Admin SDK",
    "recipientFilter": "all",
    "sendEmail": false,
    "sendNotification": true,
    "priority": "high"
  }' | jq '.'

echo ""
echo "✅ Request sent! Check server logs for Firebase Admin output."
echo ""
