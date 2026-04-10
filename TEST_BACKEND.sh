#!/bin/bash
# Quick test to verify backend is accessible

echo "🧪 Testing ZYCROP Backend Connectivity..."
echo ""

# Test 1: Basic health check
echo "Test 1: Health Check (GET /docs)"
curl -s http://localhost:8000/docs > /dev/null && echo "✅ Backend is responding" || echo "❌ Backend not responding"
echo ""

# Test 2: Market data endpoint
echo "Test 2: Market Data (GET /api/market/compare?crop=Rice)"
RESPONSE=$(curl -s -w "\n%{http_code}" http://localhost:8000/api/market/compare?crop=Rice)
HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Market endpoint responding (HTTP 200)"
  echo "Response: $BODY" | head -c 100
  echo ""
else
  echo "❌ Market endpoint error (HTTP $HTTP_CODE)"
  echo "Response: $BODY"
fi
echo ""

# Test 3: CORS headers
echo "Test 3: CORS Headers"
CORS=$(curl -s -I -H "Origin: http://10.0.2.2:8000" http://localhost:8000/api/market/compare?crop=Rice | grep -i "access-control")
if [ -z "$CORS" ]; then
  echo "⚠️  No CORS headers detected (check if request failed)"
else
  echo "✅ CORS headers present:"
  echo "$CORS"
fi
echo ""

echo "🎉 Backend connectivity test complete!"
echo ""
echo "Next: On your Android device, app should now connect to http://10.0.2.2:8000/api"
