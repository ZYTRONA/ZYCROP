#!/usr/bin/env bash
# QUICK_TEST.sh — Test the Market API Integration

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🌾 Market API Integration — Quick Test${NC}\n"

# 1. Test Backend Health
echo -e "${YELLOW}1️⃣  Testing Backend Health...${NC}"
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health)
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✅ Backend running on http://localhost:8000${NC}"
else
    echo -e "${RED}❌ Backend not responding (status: $response)${NC}"
    exit 1
fi

# 2. Test Old Market Endpoint
echo -e "\n${YELLOW}2️⃣  Testing Old Market Endpoint (/api/market)...${NC}"
echo "Query: GET /api/market?crop=Rice&location=Coimbatore"
response=$(curl -s "http://localhost:8000/api/market?crop=Rice&location=Coimbatore")
echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# 3. Test NEW Market Compare Endpoint
echo -e "\n${YELLOW}3️⃣  Testing NEW Market Compare Endpoint (/api/market/compare)...${NC}"
echo "Query: GET /api/market/compare?crop=Rice&location=Tamil%20Nadu"
response=$(curl -s "http://localhost:8000/api/market/compare?crop=Rice&location=Tamil%20Nadu")
echo "Response:"
echo "$response" | jq '.' 2>/dev/null || echo "$response"

# 4. Test Multiple Crops
echo -e "\n${YELLOW}4️⃣  Testing Multiple Crops...${NC}"
for crop in "Rice" "Wheat" "Tomato" "Onion" "Brinjal"; do
    echo -n "  - $crop: "
    response=$(curl -s "http://localhost:8000/api/market/compare?crop=$crop" | jq -r '.markets | length')
    if [ "$response" -gt 0 ]; then
        echo -e "${GREEN}✅ $response markets${NC}"
    else
        echo -e "${RED}❌ No markets found${NC}"
    fi
done

# 5. Test Best Market Logic
echo -e "\n${YELLOW}5️⃣  Testing Best Market Recommendation...${NC}"
response=$(curl -s "http://localhost:8000/api/market/compare?crop=Rice" | jq '{crop, best_market, average_price, markets: (.markets | map({name, price}))}')
echo "Best selling location:"
echo "$response" | jq '.best_market'
echo "Average price:"
echo "$response" | jq '.average_price'

echo -e "\n${GREEN}✅ All tests completed!${NC}"
echo -e "\n${YELLOW}📊 Next Steps:${NC}"
echo "1. Start the app: cd frontend && npx expo start"
echo "2. Open MarketAI screen"
echo "3. Should see real market data"
echo "4. Tap 'Compare Markets' → See prices across regions"
echo "5. Check console for API call success"
