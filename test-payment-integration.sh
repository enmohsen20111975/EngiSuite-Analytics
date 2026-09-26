#!/bin/bash
# Payment Integration Test Script
# Tests the payment flow end-to-end

set -e

echo "======================================"
echo "Payment Integration Test"
echo "======================================"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_BASE="http://localhost:8000/api"
PASSED=0
FAILED=0

function test_pass {
  echo -e "${GREEN}✓${NC} $1"
  PASSED=$((PASSED + 1))
}

function test_fail {
  echo -e "${RED}✗${NC} $1"
  FAILED=$((FAILED + 1))
}

echo ""
echo "--- Test 1: Get Payment Methods ---"
response=$(curl -s "${API_BASE}/payments/methods")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Payment methods retrieved"
else
  test_fail "Payment methods retrieval failed"
fi

echo ""
echo "--- Test 2: Get Prices ---"
response=$(curl -s "${API_BASE}/payments/prices")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Prices retrieved"
else
  test_fail "Prices retrieval failed"
fi

echo ""
echo "--- Test 3: Get Paymob Config ---"
response=$(curl -s "${API_BASE}/payments/paymob/config")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Paymob config retrieved"
else
  test_fail "Paymob config retrieval failed"
fi

echo ""
echo "--- Test 4: Create Subscription (no auth - should fail gracefully) ---"
response=$(curl -s -X POST "${API_BASE}/payments/create-subscription" \
  -H "Content-Type: application/json" \
  -d '{"tier":"starter","billingCycle":"monthly","paymentMethod":"paymob","currency":"EGP"}')
if echo "$response" | grep -q '"success":true\|ValidationError'; then
  test_pass "Subscription creation endpoint works"
else
  test_fail "Subscription creation endpoint failed"
fi

echo ""
echo "--- Test 5: Payments History (no auth) ---"
response=$(curl -s "${API_BASE}/payments/history")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Payment history endpoint works"
else
  test_fail "Payment history endpoint failed"
fi

echo ""
echo "--- Test 6: Subscription Plans ---"
response=$(curl -s "${API_BASE}/subscriptions/plans")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Subscription plans retrieved"
else
  test_fail "Subscription plans retrieval failed"
fi

echo ""
echo "--- Test 7: Current Subscription (no auth) ---"
response=$(curl -s "${API_BASE}/subscriptions/current")
if echo "$response" | grep -q '"success":true'; then
  test_pass "Current subscription endpoint works"
else
  test_fail "Current subscription endpoint failed"
fi

echo ""
echo "--- Test 8: JWT Module Check ---"
if [ -f "lib/payment.js" ]; then
  if grep -q "generatePaymentToken" lib/payment.js; then
    test_pass "JWT token generation function exists"
  else
    test_fail "JWT token generation function missing"
  fi
else
  test_fail "Payment library file not found"
fi

echo ""
echo "--- Test 9: Plans File Check ---"
if [ -f "lib/plans.js" ]; then
  if grep -q "engsuite-pro" lib/plans.js; then
    test_pass "EngSuite plans configured"
  else
    test_fail "EngSuite plans not configured"
  fi
else
  test_fail "Plans file not found"
fi

echo ""
echo "--- Test 10: Constants File Check ---"
if [ -f "src/config/constants.ts" ]; then
  if grep -q "SHARED_SECRET" src/config/constants.ts; then
    test_pass "Constants file configured"
  else
    test_fail "Constants file incomplete"
  fi
else
  test_fail "Constants file not found"
fi

echo ""
echo "--- Test 11: Payment Routes Check ---"
if [ -f "src/routes/payment.routes.ts" ]; then
  if grep -q "checkout" src/routes/payment.routes.ts; then
    test_pass "Checkout endpoint configured"
  else
    test_fail "Checkout endpoint missing"
  fi
  if grep -q "paymob/process" src/routes/payment.routes.ts; then
    test_pass "Paymob process endpoint configured"
  else
    test_fail "Paymob process endpoint missing"
  fi
else
  test_fail "Payment routes file not found"
fi

echo ""
echo "--- Test 12: Auth Middleware Check ---"
if [ -f "src/middleware/auth.middleware.ts" ]; then
  if grep -q "verifySubdomainToken" src/middleware/auth.middleware.ts; then
    test_pass "Subdomain token verification configured"
  else
    test_fail "Subdomain token verification missing"
  fi
else
  test_fail "Auth middleware file not found"
fi

echo ""
echo "--- Test 13: Subscriptions Routes Check ---"
if [ -f "src/routes/subscriptions.routes.ts" ]; then
  if grep -q "/subscribe" src/routes/subscriptions.routes.ts; then
    test_pass "Subscribe endpoint configured"
  else
    test_fail "Subscribe endpoint missing"
  fi
else
  test_fail "Subscriptions routes file not found"
fi

echo ""
echo "======================================"
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${YELLOW}Some tests failed. Please review.${NC}"
  exit 1
fi
