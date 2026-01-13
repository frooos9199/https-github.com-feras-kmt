#!/bin/bash
# اختبار إرسال إشعار حقيقي بعد إصلاح Firebase

echo "🔍 Testing notification send after Firebase OAuth2 fix..."
echo ""

# احصل على معرف الحدث الأول
EVENT_ID=$(cd "/Users/mac/Documents/GitHub/kmtmaster/https-github.com-feras-kmt" && npx prisma db execute --stdin <<EOF 2>/dev/null | tail -1
SELECT id FROM "Event" WHERE status = 'active' LIMIT 1;
EOF
)

if [ -z "$EVENT_ID" ]; then
  echo "❌ No active events found"
  exit 1
fi

echo "📋 Using event ID: $EVENT_ID"
echo ""

# حاول إرسال إشعار للحدث
echo "📤 Sending test notification..."
curl -X POST "https://www.kmtsys.com/api/events/$EVENT_ID/notify" \
  -H "Content-Type: application/json" \
  -d '{
    "titleEn": "Firebase Auth Test",
    "titleAr": "اختبار مصادقة Firebase",
    "messageEn": "Testing after OAuth2 fix",
    "messageAr": "اختبار بعد إصلاح OAuth2",
    "sendToAll": true
  }' \
  -v 2>&1 | grep -E "HTTP/|success|error|failed|{.*}"

echo ""
echo "✅ Test completed"
