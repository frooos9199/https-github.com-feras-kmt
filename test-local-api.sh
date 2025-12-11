#!/bin/bash

echo "🧪 Testing Local Notifications API..."
echo ""

# Start dev server in background
echo "⏳ Starting Next.js dev server..."
npm run dev > /tmp/nextjs-dev.log 2>&1 &
DEV_PID=$!

# Wait for server to start
sleep 15

# Test API
echo "📡 Testing /api/notifications..."
RESPONSE=$(curl -s http://localhost:3000/api/notifications \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaWI5ZGlqbjAwMDBpYzA0Zzl5czc5cmgiLCJuYW1lIjoiQWhtYWQiLCJlbWFpbCI6InN1bW1pdF9rd0Bob3RtYWlsLmNvbSIsInJvbGUiOiJtYXJzaGFsIiwiaWF0IjoxNzM0NDQyMDUxfQ.h-Tr5b8Ls5pRl6OFmF3Trs3bj8RfkO4g5xQAFQ_4ZMU")

echo "Response: $RESPONSE"

# Kill dev server
kill $DEV_PID 2>/dev/null

if [[ "$RESPONSE" == *"Unauthorized"* ]]; then
  echo "❌ FAILED: Got 401 Unauthorized"
  exit 1
elif [[ "$RESPONSE" == "["* ]]; then
  echo "✅ SUCCESS: Got notifications array"
  exit 0
else
  echo "⚠️  Unexpected response"
  exit 1
fi
