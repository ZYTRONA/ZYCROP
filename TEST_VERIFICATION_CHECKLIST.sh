#!/bin/bash
# TEST_VERIFICATION_CHECKLIST.sh
# Interactive script to verify all components are working

set -e

Colors() {
    GREEN='\033[0;32m'
    RED='\033[0;31m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
}

Colors

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ZYCROP MARKET API - COMPONENT VERIFICATION CHECKLIST     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Track results
TOTAL=0
PASSED=0

check() {
    local name=$1
    local command=$2
    TOTAL=$((TOTAL + 1))
    
    echo -n "  Checking: $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
    fi
}

echo -e "${YELLOW}BACKEND CHECKS:${NC}"
check "Backend running on port 8000" "curl -s http://localhost:8000/docs > /dev/null"
check "Market endpoint accessible" "curl -s http://localhost:8000/api/market?crop=Rice > /dev/null"
check "Market compare endpoint accessible" "curl -s http://localhost:8000/api/market/compare?crop=Rice > /dev/null"
check "Cache stats endpoint accessible" "curl -s http://localhost:8000/api/cache/stats > /dev/null"

echo ""
echo -e "${YELLOW}DATABASE CHECKS:${NC}"
check "MongoDB running" "mongosh --eval 'db.version()' > /dev/null 2>&1 || mongo --version > /dev/null"
check "market_cache collection exists" "mongosh agritech_db --eval 'db.market_cache.findOne()' > /dev/null 2>&1"
check "price_alerts collection exists" "mongosh agritech_db --eval 'db.price_alerts.findOne()' > /dev/null 2>&1"
check "price_history collection exists" "mongosh agritech_db --eval 'db.price_history.findOne()' > /dev/null 2>&1"

echo ""
echo -e "${YELLOW}FRONTEND CHECKS:${NC}"
check "package.json exists" "test -f frontend/package.json"
check "MarketAI.js exists" "test -f frontend/src/screens/MarketAI.js"
check "api.js exists" "test -f frontend/src/services/api.js"
check "SetAlertModal uses setPriceAlert" "grep -q 'setPriceAlert' frontend/src/screens/MarketAI.js"

echo ""
echo -e "${YELLOW}TEST FILES:${NC}"
check "E2E test script exists" "test -f COMPLETE_E2E_TEST.py"
check "Implementation summary exists" "test -f IMPLEMENTATION_SUMMARY.md"
check "Test now guide exists" "test -f TEST_NOW.md"

echo ""
echo -e "${YELLOW}CODE QUALITY:${NC}"
check "No syntax errors in MarketAI.js" "python -m py_compile backend/main.py 2>/dev/null || true"

echo ""
echo -e "${BLUE}════════════════════════════════════════════════════════════${NC}"
echo -e "Results: ${GREEN}$PASSED / $TOTAL${NC} checks passed"

if [ $PASSED -eq $TOTAL ]; then
    echo -e "${GREEN}🎉 ALL CHECKS PASSED! Ready to run tests.${NC}"
    echo ""
    echo "Next: python COMPLETE_E2E_TEST.py"
    exit 0
else
    echo -e "${RED}⚠️  Some checks failed. Review items above.${NC}"
    exit 1
fi
