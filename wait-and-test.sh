#!/bin/bash

echo "🔍 Monitoring Vercel deployment..."
echo ""
echo "JWT Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaWI5ZGlqbjAwMDBpYzA0Zzl5czc5cmgiLCJuYW1lIjoiQWhtYWQiLCJlbWFpbCI6InN1bW1pdF9rd0Bob3RtYWlsLmNvbSIsInJvbGUiOiJtYXJzaGFsIiwiaWF0IjoxNzM0NDQyMDUxfQ.h-Tr5b8Ls5pRl6OFmF3Trs3bj8RfkO4g5xQAFQ_4ZMU"
echo ""

for i in {1..20}; do
  echo "⏳ Attempt $i/20 (waiting 15s)..."
  sleep 15
  
  RESPONSE=$(curl -s https://www.kmtsys.com/api/notifications \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtaWI5ZGlqbjAwMDBpYzA0Zzl5czc5cmgiLCJuYW1lIjoiQWhtYWQiLCJlbWFpbCI6InN1bW1pdF9rd0Bob3RtYWlsLmNvbSIsInJvbGUiOiJtYXJzaGFsIiwiaWF0IjoxNzM0NDQyMDUxfQ.h-Tr5b8Ls5pRl6OFmF3Trs3bj8RfkO4g5xQAFQ_4ZMU" \
    -w "\nHTTP:%{http_code}")
  
  HTTP_CODE=$(echo "$RESPONSE" | grep -o "HTTP:[0-9]*" | cut -d: -f2)
  BODY=$(echo "$RESPONSE" | sed '/^HTTP:/d')
  
  echo "  Status: $HTTP_CODE"
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo ""
    echo "🎉 SUCCESS! Notifications API is working!"
    echo ""
    echo "Response:"
    echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    exit 0
  elif [ "$HTTP_CODE" != "401" ]; then
    echo "  ⚠️  Unexpected status code!"
    echo "  Response: $BODY"
  fi
done

echo ""
echo "❌ Deployment did not complete after 20 attempts (5 minutes)"
echo ""
echo "📋 Next Steps:"
echo "1. Check Vercel Dashboard: https://vercel.com/dashboard"
echo "2. Look for build errors in deployment logs"
echo "3. Manually trigger deployment from Vercel"
echo ""
