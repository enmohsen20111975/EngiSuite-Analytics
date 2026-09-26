# 🎯 Subscription Plans - Quick Access Guide

## How to Access Subscription Plans

### From the Dashboard (Easiest)
1. Log in to EngiSuite
2. Look for the **"Premium Plans"** link in the left sidebar navigation
3. Click to view all available plans with pricing

### From the Pricing Page
1. Navigate directly to: `/pricing`
2. Compare all plans side-by-side
3. Click "Start Free Trial" or "Get Started" on any plan
4. You'll be redirected to the subscription flow

### Direct URL
```
https://engi-suite.com/pricing
https://engi-suite.com/subscription
```

## Available Plans

### Free Tier
- **Price:** Free (forever)
- **Calculations:** 10/month
- **Basic calculators**
- **Standard support**

### Starter Plan
- **Price:** 99 EGP/month (or 9.99 USD)
- **Calculations:** Unlimited
- **Full equations library**
- **Priority support**
- **Export to PDF/Excel**

### Professional Plan ⭐ Most Popular
- **Price:** 199 EGP/month (or 29.99 USD)
- **Everything in Starter, plus:**
- **API access**
- **Custom workflows**
- **Advanced calculators**

### Enterprise Plan
- **Price:** 399 EGP/month (or 99.99 USD)
- **Everything in Pro, plus:**
- **Unlimited team members**
- **Custom integrations**
- **Dedicated support**
- **SLA guarantee**

## Payment Flow (Simplified)

```
1. Choose a plan on the Pricing page
2. Click "Subscribe" or "Get Started"
3. Fill in your billing details (name, email, phone)
4. Select payment type (Card or Wallet)
5. Confirm and pay securely
6. Your subscription activates instantly
7. Access premium features immediately!
```

## Payment Methods Accepted

- ✅ **Credit/Debit Cards** (via Paymob for Egypt, Stripe for international)
- ✅ **Bank Cards**
- ✅ **Digital Wallets** (coming soon)

## Billing Options

- **Monthly:** Pay per month
- **Annual:** Save 20% when you pay yearly
- **Cancel anytime:** No long-term commitment

## Need Help?

If you encounter any issues:
1. Check that your SHARED_SECRET is configured (for self-hosted instances)
2. Verify your payment credentials are set up
3. Contact support at support@engi-suite.com

## Self-Hosting Notes

For self-hosted deployments, ensure these environment variables are set:

```bash
# Required for payment integration
SHARED_SECRET=your-64-char-secret-here
JWT_SECRET=your-jwt-secret-here

# Paymob (Egypt payments)
PAYMOB_API_KEY=your-api-key
PAYMOB_INTEGRATION_ID=your-integration-id
PAYMOB_IFRAME_ID=your-iframe-id

# Stripe (International payments)
STRIPE_SECRET_KEY=sk_test_your-key
STRIPE_WEBHOOK_SECRET=whsec_your-secret
```

## API Endpoints

For programmatic access:

- `GET /api/subscriptions/plans` - List all plans
- `GET /api/payments/methods` - Available payment methods
- `GET /api/payments/prices` - Current pricing
- `POST /api/subscribe` - Create subscription

## Testing Payments

For integration testing:
```bash
# Run the test suite
bash test-payment-integration.sh

# Verify endpoints
curl http://localhost:8000/api/payments/methods
curl http://localhost:8000/api/subscriptions/plans
```

---

**Last Updated:** 2026-05-01  
**Status:** ✅ Active & Fully Functional
