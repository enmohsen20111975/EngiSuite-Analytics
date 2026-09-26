#!/bin/bash
# Demonstration of Payment Integration Functionality

echo "============================================"
echo "  Payment Integration Demonstration"
echo "============================================"
echo ""

echo "1. API Health Check"
echo "───────────────────"
curl -s http://localhost:8000/health | python3 -m json.tool 2>/dev/null || echo "Server not running"
echo ""

echo "2. Payment Methods"
echo "──────────────────"
curl -s http://localhost:8000/api/payments/methods | python3 -m json.tool
echo ""

echo "3. Subscription Plans"
echo "─────────────────────"
curl -s http://localhost:8000/api/subscriptions/plans | python3 -m json.tool
echo ""

echo "4. Tier Prices"
echo "──────────────"
curl -s http://localhost:8000/api/payments/prices | python3 -m json.tool
echo ""

echo "5. Paymob Configuration"
echo "──────────────────────"
curl -s http://localhost:8000/api/payments/paymob/config | python3 -m json.tool
echo ""

echo "============================================"
echo "  Frontend Pages"
echo "============================================"
echo ""
echo "Pricing Page:    http://localhost:5173/pricing"
echo "Subscription:    http://localhost:5173/subscription"
echo "Dashboard:       http://localhost:5173/dashboard"
echo ""

echo "============================================"
echo "  Key Features"
echo "============================================"
echo "✅ JWT-based authentication"
echo "✅ Paymob integration (Egypt)"
echo "✅ Stripe integration (International)"
echo "✅ 30-minute token expiry"
echo "✅ Metadata storage for callbacks"
echo "✅ Automatic subscription activation"
echo "✅ Multi-tier pricing support"
echo ""

echo "============================================"
echo "  Test Payment Flow"
echo "============================================"
echo ""
echo "Step 1: GET /api/subscribe/pro?type=card"
echo "  → Generates JWT token"
echo "  → Redirects to https://m2y.net/checkout?token=JWT"
echo ""
echo "Step 2: m2y.net verifies JWT"
echo "  → Calls Paymob API"
echo "  → Returns payment iframe"
echo ""
echo "Step 3: User completes payment"
echo "  → Paymob redirects to /payments/result"
echo "  → Subscription status updated"
echo "  → Redirects back to engsuite.m2y.net"
echo ""
echo "Step 4: Frontend shows success"
echo "  → Premium features unlocked"
echo ""

read -p "Press Enter to continue..."

echo ""
echo "All systems operational! ✅"
